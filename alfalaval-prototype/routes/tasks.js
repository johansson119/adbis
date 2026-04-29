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

// Afslutter opgaven ved at beregne samlet tidsforbrug, gemme servicerapporten og opdatere status til COMPLETED
router.post("/:id/submit", (req, res) => {
    const taskId = req.params.id;
    const { problem_description, work_performed, images } = req.body;
  
    const endTime = new Date().toISOString();
  
    db.get(
      "SELECT start_time, total_time FROM tasks WHERE id = ?",
      [taskId],
      (err, task) => {
        if (err) return res.status(500).send("Database error");
  
        let timeSpent = task.total_time || 0;
  
        if (task.start_time) {
          const start = new Date(task.start_time);
          const end = new Date(endTime);
          const activeMinutes = Math.floor((end - start) / 60000);
  
          timeSpent += activeMinutes;
        }
  
        db.run(
          `
          INSERT INTO service_reports 
          (task_id, problem_description, work_performed, images, date_submitted, time_spent)
          VALUES (?, ?, ?, ?, ?, ?)
          `,
          [taskId, problem_description, work_performed, images, endTime, timeSpent]
        );
  
        db.run(
          "UPDATE tasks SET end_time = ?, total_time = ?, status = ?, start_time = NULL WHERE id = ?",
          [endTime, timeSpent, "COMPLETED", taskId],
          (err) => {
            if (err) return res.status(500).send("Database error");
  
            res.json({
              message: "Report submitted",
              time_spent: timeSpent
            });
          }
        );
      }
    );
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

// Henter seneste gemte draft/report for en opgave
router.get("/:id/report", (req, res) => {
    const taskId = req.params.id;
  
    db.get(
      `
      SELECT *
      FROM service_reports
      WHERE task_id = ?
      ORDER BY id DESC
      LIMIT 1
      `,
      [taskId],
      (err, row) => {
        if (err) return res.status(500).send("Database error");
  
        res.json(row || {});
      }
    );
  });

  // Pause Task – Beregn tidsforbrug indtil nu, opdater total_time og nulstil start_time
  router.post("/:id/pause", (req, res) => {
    const taskId = req.params.id;
    const now = new Date();
  
    db.get("SELECT start_time, total_time FROM tasks WHERE id = ?", [taskId], (err, task) => {
      const start = new Date(task.start_time);
      const activeMinutes = Math.floor((now - start) / 60000);
  
      const newTotal = (task.total_time || 0) + activeMinutes;
  
      db.run(
        "UPDATE tasks SET total_time = ?, start_time = NULL WHERE id = ?",
        [newTotal, taskId],
        () => res.json({ total_time: newTotal })
      );
    });
  });

module.exports = router;