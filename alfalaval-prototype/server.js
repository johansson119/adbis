const express = require("express");
const app = express();

const db = require("./db");

app.use(express.json());

const path = require("path");

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send("Alfa Laval prototype kører");
});

app.listen(3000, () => {
  console.log("Server kører på http://localhost:3000");
});