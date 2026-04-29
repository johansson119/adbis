const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS technicians (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      skill TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      customer TEXT,
      date TEXT NOT NULL,
      skill_required TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      priority TEXT NOT NULL,
      status TEXT NOT NULL,
      technician_id INTEGER,
      FOREIGN KEY (technician_id) REFERENCES technicians(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS service_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      problem_description TEXT,
      work_performed TEXT,
      images TEXT,
      date_submitted TEXT,
      time_spent INTEGER,
      FOREIGN KEY (task_id) REFERENCES tasks(id)
    )
  `);
});

db.get("SELECT COUNT(*) as count FROM technicians", (err, row) => {
    if (row.count === 0) {
  
      //Teknikere
      db.run(`
        INSERT INTO technicians (name, email, skill) VALUES
        ("Mikkel Hansen", "mikkel@alfalaval.com", "Repair"),
        ("Sara Nielsen", "sara@alfalaval.com", "Inspection (DCI)"),
        ("Jonas Larsen", "jonas@alfalaval.com", "Welding"),
        ("Emma Pedersen", "emma@alfalaval.com", "Chemical Cleaning"),
        ("Lars Jensen", "lars@alfalaval.com", "Testing")
      `);
  
      //Opgaver
      db.run(`
        INSERT INTO tasks (title, customer, date, skill_required, start_time, end_time, priority, status, technician_id) VALUES
        ("Fix pump leakage", "ARLA", "2026-04-26", "Repair", "08:00", NULL, "URGENT", "NOT STARTED", 1),
        ("Inspect heat exchanger", "NOVO NORDISK", "2026-04-26", "Inspection (DCI)", "09:00", NULL, "NORMAL", "IN PROGRESS", 2),
        ("Weld broken pipe", "EQUINOR", "2026-04-26", "Welding", NULL, NULL, "URGENT", "NOT STARTED", 3),
        ("Chemical cleaning tank", "OATLY", "2026-04-27", "Chemical Cleaning", NULL, NULL, "LOW", "NOT STARTED", 4),
        ("System pressure test", "COLOPLAST", "2026-04-27", "Testing", NULL, NULL, "NORMAL", "NOT STARTED", 5),
        ("Replace worn seal on pump", "NUTRICIA", "2026-04-27", "Repair", NULL, NULL, "LOW", "NOT STARTED", 1),
        ("Fix leaking valve connection", "NOVO NORDISK", "2026-04-28", "Repair", NULL, NULL, "NORMAL", "IN PROGRESS", 1)
      `);
  
      //Servicerapporter 
      db.run(`
        INSERT INTO service_reports (task_id, problem_description, work_performed, images, date_submitted, time_spent) VALUES
        (2, "Fouling detected in exchanger", "Performed inspection and partial cleaning", "img1.jpg", "2026-04-26", 120)
      `);
  
    }
  });

module.exports = db;