import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import cors from "cors";
import { config } from 'dotenv';
config();


const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cors());
app.use(bodyParser.json());

const db = new pg.Client({
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  ssl: process.env.DB_SSL === 'true'
});

async function connectToDatabase() {
  try {
    await db.connect();
    console.log("Database connected successfully!");
  } catch (err) {
    console.error("Error connecting to database:", err);
  }
}

connectToDatabase();

//fetching data from the table
app.get("/get", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM keeper order by id desc");
    res.json(result.rows);
  } catch (e) {
    console.error("something wrong");
    console.log(e);
  }
});

//creating a new note
app.post("/add", async (req, res) => {
  try {
    const title = req.body.title;
    const content = req.body.content;

    const querystatement = "insert into keeper (title,content) values ($1,$2)";
    try {
      const result = db.query(querystatement, [title, content]);
    } catch (error) {
      console.error("Error Executing query");
    }
  } catch (e) {
    console.log(e);
    res.status(500).send("Error processing request");
  }
});

//deleting a note
app.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const querystatement = "DELETE FROM KEEPER where id= $1";
    try {
      const result = db.query(querystatement, [id]);
    } catch (error) {
      console.error("Error executing query" + e);
    }
  } catch (e) {
    console.log(e);
    res.status(500).send("Error processing request");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
