const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Alfa Laval prototype kører");
});

app.listen(3000, () => {
  console.log("Server kører på http://localhost:3000");
});