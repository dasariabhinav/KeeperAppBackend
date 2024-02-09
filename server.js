import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { config } from 'dotenv';
import pkg from 'pg';

config();
const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  ssl: process.env.DB_SSL === 'true'
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

//fetching data from the table
app.get("/get", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM keeper order by id desc");
    res.json(result.rows);
  } catch (e) {
    console.error("something wrong");
    console.log(e);
  }
});

//creating a new note
// Creating a new note
app.post("/add", async (req, res) => {
  try {
    const title = req.body.title;
    const content = req.body.content;

    const queryStatement = "INSERT INTO keeper (title, content) VALUES ($1, $2)";
    await pool.query(queryStatement, [title, content]);

    res.status(201).send("Note added successfully");
  } catch (error) {
    console.error("Error adding note:", error);
    res.status(500).send("Error adding note");
  }
});

// Deleting a note
app.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const queryStatement = "DELETE FROM keeper WHERE id = $1";
    await pool.query(queryStatement, [id]);

    res.status(200).send("Note deleted successfully");
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).send("Error deleting note");
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
