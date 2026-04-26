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

module.exports = router;