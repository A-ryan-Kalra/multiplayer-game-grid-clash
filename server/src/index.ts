import express from "express";
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer } from "ws";
const app = express();

cors({ origin: "*" });
app.use(express.json());

const server = createServer(app);
const wss = new WebSocketServer({ server });

app.get("/health", (req, res, next) => {
  res.json({ message: "Working" });
});

const rooms = new Map<string, WebSocket>();

wss.on("connection", (ws: WebSocket, req) => {
  let splitRooms = req.url?.split("/");
  const roomNo: string = splitRooms?.[
    splitRooms?.length - 1
  ].toString() as string;

  if (!rooms.has(roomNo)) {
    rooms.set(roomNo, ws);
  }
  rooms.get(roomNo);
  //   console.log("rooms", rooms.get("1"));
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log("Server is running on PORT: ", PORT);
});
