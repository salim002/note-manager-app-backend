import express from "express";
const app = express();
const PORT = 9000

import connectToMongo from "./config/db.js";
connectToMongo();

import auth from "./routes/auth.js";
import notes from "./routes/notes.js";

import cors from "cors";
app.use(cors());
app.use(express.json())

// Available Routes
app.use('/api/auth', auth)
app.use('/api/notes', notes)

app.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`)
})