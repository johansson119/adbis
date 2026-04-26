const express = require("express");
const app = express();

require("./db");
const tasksRoutes = require("./routes/tasks");
const path = require("path");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Henter routes fra routes/tasks.js
app.use("/tasks", tasksRoutes);

app.get("/", (req, res) => {
  res.send("Alfa Laval prototype kører");
});

app.listen(3000, () => {
  console.log("Server kører på http://localhost:3000");
});