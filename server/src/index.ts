import express from "express";
import cors from "cors";
import { createServer } from "http";
const app = express();

cors({ origin: "*" });
app.use(express.json());

const server = createServer(app);

app.get("/health", (req, res, next) => {
  res.json({ message: "Working" });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log("Server is running on PORT: ", PORT);
});
