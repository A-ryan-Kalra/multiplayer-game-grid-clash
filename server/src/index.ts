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

type Member = { socket: WebSocket; userName: string };

const rooms = new Map<string, Member[]>();
const cursors = new Map<string, Member[]>();

wss.on("connection", (ws: WebSocket, req) => {
  const url = new URL(req.url as string, `http://${req.headers.host}`);
  const roomUrl = url.pathname?.split("/").splice(1);
  const roomNo = roomUrl.pop()?.toString() as string;
  const userName = url.searchParams.get("name") as string;

  if (!rooms.has(roomNo) || !cursors) {
    rooms.set(roomNo, []);
    cursors.set(roomNo, []);
  }
  const members = rooms.get(roomNo);
  const cursorMembers = cursors.get(roomNo);
  const me: Member = { socket: ws, userName };

  if (url.pathname.startsWith("/enter")) members?.push(me);
  if (url.pathname.startsWith("/cursor")) cursorMembers?.push(me);

  ws.on("message", (data) => {
    console.log("url.pathname", url.pathname);

    if (url.pathname.startsWith("/enter")) {
      //   console.log("enter");

      // members?.forEach((client) => {
      //   if (client.socket !== ws && client.userName !== userName) {
      //     client.socket.send(data.toString());
      //     ws.send(JSON.stringify({ userName: `${client.userName}` }));
      //   }
      // });
      brodCastMessage(members || [], ws, data.toString());
    } else if (url.pathname.startsWith("/cursor")) {
      // cursorMembers?.forEach((client) => {
      //   // console.log("cursor", data.toString());

      //   if (client.socket !== ws && client.userName !== userName) {
      //     client.socket.send(data.toString());
      //   }
      // });
      brodCastMessage(cursorMembers || [], ws, data.toString());
    }
  });

  function brodCastMessage(members: Member[], ws: WebSocket, data: string) {
    members?.forEach((client) => {
      if (client.socket !== ws && client.userName !== userName) {
        client.socket.send(data.toString());

        if (url.pathname.startsWith("/enter"))
          ws.send(JSON.stringify({ userName: `${client.userName}` }));
      }
    });
  }

  ws.on("close", (close) => {
    if (url.pathname.startsWith("/enter")) {
      const idx = members?.findIndex((item) => item.socket === ws);
      if (idx !== -1) {
        console.log("idx", idx);
        members?.splice(idx as number, 1);
      }
      if (members?.length) {
        members?.forEach((client) => {
          if (client.socket !== ws && client.userName !== userName) {
            client.socket.send(JSON.stringify({ exit: true, userName }));
            ws.send(
              JSON.stringify({ userName: `Hello From ${client.userName}` })
            );
          }
        });
      }
      if (members?.length === 0) rooms.delete(roomNo);
      console.log(`[${roomNo}] - (${userName}) (total: ${members?.length})`);
    } else if (url.pathname.startsWith("/cursor")) {
      const idx = cursorMembers?.findIndex((item) => item.socket === ws);
      if (idx !== -1) {
        console.log("idx", idx);
        cursorMembers?.splice(idx as number, 1);
      }
      if (cursorMembers?.length) {
        cursorMembers?.forEach((client) => {
          if (client.socket !== ws && client.userName !== userName) {
            client.socket.send(JSON.stringify({ exit: true, userName }));
            ws.send(
              JSON.stringify({ userName: `Hello From ${client.userName}` })
            );
          }
        });
      }
      if (cursorMembers?.length === 0) rooms.delete(roomNo);
      console.log(
        `[${roomNo}] - (${userName}) (total: ${cursorMembers?.length})`
      );
    }
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log("Server is running on PORT: ", PORT);
});
