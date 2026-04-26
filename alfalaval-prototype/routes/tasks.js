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

module.exports = router;