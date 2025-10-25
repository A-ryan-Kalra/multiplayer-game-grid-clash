import { WebSocket } from "ws";

export type Member = { socket: WebSocket; userName: string };
export type SocketType = Map<string, Member[]>;

export function brodCastMessage(
  members: Member[],
  ws: WebSocket,
  data: string,
  userName: string,
  url: URL
) {
  if (url.pathname.startsWith("/grid-info")) {
    members?.forEach((client) => {
      client.socket.send(data.toString());
    });
    return;
  }
  members?.forEach((client) => {
    if (client.socket !== ws && client.userName !== userName) {
      client.socket.send(data.toString());

      if (url.pathname.startsWith("/enter"))
        ws.send(JSON.stringify({ userName: `${client.userName}` }));
    }
  });
}

export function closeConnection(
  members: Member[],
  userName: string,
  ws: WebSocket,
  roomNo: string,
  rooms: SocketType
) {
  const idx = members?.findIndex((item) => item.socket === ws);
  if (idx !== -1) {
    console.log("idx", idx);
    members?.splice(idx as number, 1);
  }
  if (members?.length) {
    members?.forEach((client) => {
      if (client.socket !== ws && client.userName !== userName) {
        client.socket.send(JSON.stringify({ exit: true, userName }));
        // ws.send(
        //   JSON.stringify({ userName: `Hello From ${client.userName}` })
        // );
      }
    });
  }
  if (members?.length === 0) rooms.delete(roomNo);
  console.log(`[${roomNo}] - (${userName}) (total: ${members?.length})`);
}
