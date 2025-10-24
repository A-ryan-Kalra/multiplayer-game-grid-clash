import express from "express";
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
const app = express();

cors({ origin: "*" });
app.use(express.json());

const server = createServer(app);
const wss = new WebSocketServer({ server });

app.get("/health", (req, res, next) => {
  res.json({ message: "Working" });
});

const rooms = new Map<string, Set<WebSocket>>();

wss.on("connection", (ws: WebSocket, req) => {
  let splitRooms = req.url?.split("/");
  const roomNo: string = splitRooms?.[
    splitRooms?.length - 1
  ].toString() as string;

  if (!rooms.has(roomNo)) {
    rooms.set(roomNo, new Set());
  }
  rooms.get(roomNo)?.add(ws);
  console.log(`roomName: ${roomNo} +1  (total: ${rooms?.get(roomNo)?.size})`);

  ws.on("message", (data) => {
    console.log("MEssage", data.toString());
  });

  ws.on("close", (close) => {
    console.log("closed", close);
    console.log("------------");
    const set = rooms.get(roomNo);
    set?.delete(ws);
    if (set?.size === 0) rooms.delete(roomNo);
    console.log(`roomName: ${roomNo} -1 (total: ${rooms?.get(roomNo)?.size})`);
  });
  //   console.log("rooms", rooms.get("1"));
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log("Server is running on PORT: ", PORT);
});
