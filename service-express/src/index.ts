import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

export const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/health", (_req, res) => {
  res.status(200).send("OK");
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});