const express = require("express");
const router = express.Router();

const db = require("../db");

// Hent opgaver for én bestemt tekniker
router.get("/", (req, res) => {
  const technicianId = 1; // Mikkel Hansen

  db.all(
    "SELECT * FROM tasks WHERE technician_id = ?",
    [technicianId],
    (err, rows) => {
      if (err) {
        return res.status(500).send("Databasefejl");
      }

      res.json(rows);
    }
  );
});

// Hent én specifik opgave
router.get("/:id", (req, res) => {
    const taskId = req.params.id;
  
    db.get(
      `
      SELECT tasks.*, technicians.name AS technician_name
      FROM tasks
      JOIN technicians ON tasks.technician_id = technicians.id
      WHERE tasks.id = ?
      `,
      [taskId],
      (err, row) => {
        if (err) return res.status(500).send("Database error");
        res.json(row);
      }
    );
  });

  // Start Task – Gem starttidspunkt i databasen
  router.post("/:id/start", (req, res) => {
    const id = req.params.id;
  
    const now = new Date().toISOString();
  
    db.run(
      "UPDATE tasks SET start_time = ? WHERE id = ?",
      [now, id],
      function (err) {
        if (err) return res.status(500).json(err);
        res.json({ success: true, start_time: now });
      }
    );
  });

  // Afslutter opgaven ved at beregne tidsforbrug, gemme servicerapporten og opdatere status til COMPLETED
  router.post("/:id/submit", (req, res) => {
    const taskId = req.params.id;
    const { problem_description, work_performed, images } = req.body;
  
    const endTime = new Date().toISOString();
  
    db.get("SELECT start_time FROM tasks WHERE id = ?", [taskId], (err, task) => {
      if (err) return res.status(500).send("Database error");
  
      const start = new Date(task.start_time);
      const end = new Date(endTime);
      const timeSpent = Math.round((end - start) / 60000);
  
      db.run(
        `
        INSERT INTO service_reports 
        (task_id, problem_description, work_performed, images, date_submitted, time_spent)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [taskId, problem_description, work_performed, images, endTime, timeSpent]
      );
  
      db.run(
        "UPDATE tasks SET end_time = ?, status = ? WHERE id = ?",
        [endTime, "COMPLETED", taskId],
        (err) => {
          if (err) return res.status(500).send("Database error");
  
          res.json({
            message: "Report submitted",
            time_spent: timeSpent
          });
        }
      );
    });
  });

  // gemmer draft + sætter task til IN PROGRESS
router.post("/:id/save-draft", (req, res) => {
    const taskId = req.params.id;
    const { problem_description, work_performed } = req.body;
  
    const now = new Date().toISOString();
  
    db.run(
      `
      INSERT INTO service_reports 
      (task_id, problem_description, work_performed, date_submitted)
      VALUES (?, ?, ?, ?)
      `,
      [taskId, problem_description, work_performed, now],
      function (err) {
        if (err) return res.status(500).json(err);
  
        db.run(
          "UPDATE tasks SET status = ? WHERE id = ?",
          ["IN PROGRESS", taskId],
          function (err) {
            if (err) return res.status(500).json(err);
  
            res.json({ message: "Draft saved" });
          }
        );
      }
    );
  });

module.exports = router;