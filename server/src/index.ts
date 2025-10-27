import express from "express";
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import {
  brodCastMessage,
  closeConnection,
  Member,
  SocketType,
} from "./socket-events";
import { fileURLToPath } from "url";
import path from "path";
const app = express();

cors({ origin: "*" });
app.use(express.json());

const server = createServer(app);
const wss = new WebSocketServer({ server });

app.get("/health", (req, res, next) => {
  res.json({ message: "Working" });
});

// app.use(express.static("public"));
const rooms: SocketType = new Map<string, Member[]>();
const cursors: SocketType = new Map<string, Member[]>();
const grid: SocketType = new Map<string, Member[]>();

wss.on("connection", (ws: WebSocket, req) => {
  const url = new URL(req.url as string, `http://${req.headers.host}`);
  const roomUrl = url.pathname?.split("/").splice(1);
  const roomNo = roomUrl.pop()?.toString() as string;
  const userName = url.searchParams.get("name") as string;

  if (!rooms.has(roomNo) || !cursors || !grid) {
    rooms.set(roomNo, []);
    cursors.set(roomNo, []);
    grid.set(roomNo, []);
  }
  const members = rooms.get(roomNo);
  const cursorMembers = cursors.get(roomNo);
  const gridInfoMembers = grid.get(roomNo);
  const me: Member = { socket: ws, userName };

  if (url.pathname.startsWith("/enter")) members?.push(me);
  if (url.pathname.startsWith("/cursor")) cursorMembers?.push(me);
  if (url.pathname.startsWith("/grid-info")) gridInfoMembers?.push(me);

  ws.on("message", (data) => {
    // console.log("data", data?.toString());
    // console.log("url.pathname", url.pathname);

    if (url.pathname.startsWith("/enter")) {
      //   console.log("enter");

      brodCastMessage(members || [], ws, data.toString(), userName, url);
    } else if (url.pathname.startsWith("/cursor")) {
      brodCastMessage(cursorMembers || [], ws, data.toString(), userName, url);
    } else if (url.pathname.startsWith("/grid-info")) {
      brodCastMessage(
        gridInfoMembers || [],
        ws,
        data.toString(),
        userName,
        url
      );
    }
  });

  ws.on("close", (close) => {
    if (url.pathname.startsWith("/enter")) {
      closeConnection(members || [], userName, ws, roomNo, rooms);
    } else if (url.pathname.startsWith("/cursor")) {
      closeConnection(cursorMembers || [], userName, ws, roomNo, rooms);
    } else if (url.pathname.startsWith("/grid-info")) {
      closeConnection(gridInfoMembers || [], userName, ws, roomNo, rooms);
    }
  });
});

const dirname = path.resolve();
const outputDist = path.join(dirname, "../client/dist");
app.use(express.static(outputDist));
app.get("*splat", (req, res) => {
  res.sendFile(path.join(outputDist, "index.html"));
});
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log("Server is running on PORT: ", PORT);
});
