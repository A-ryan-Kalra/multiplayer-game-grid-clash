import { useEffect, useState } from "react";
import { useSocket } from "../services/use-socket-provider";
import { type UserProps } from "../type";
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000";

function PlayArea() {
  const { socketProvider } = useSocket();
  const [userSockets, setUserSockets] = useState<UserProps[]>();
  const unique = Date.now().toString().slice(-3);

  console.log(userSockets);
  useEffect(() => {
    const socket = new WebSocket(`${WS_URL}/enter/room/1?name=aryan${unique}`);

    socketProvider.set("user", socket);
    // setUserSockets(
    //   (prev: UserProps[] | undefined) =>
    //     [
    //       ...(prev || []),
    //       { userName: `Hello From Aryan ${unique}` },
    //     ] as UserProps[]
    // );

    console.log(socketProvider.get("user"));
    console.log(socket.readyState);

    socket.addEventListener("open", (data) => {
      console.log(data);
      socket.send(JSON.stringify({ userName: `Hello From Aryan ` + unique }));
    });
    socket.addEventListener("message", (data) => {
      const parsedData = JSON.parse(data.data);
      console.log("User: ", parsedData);
      setUserSockets((prev: UserProps[] | undefined) => [
        ...(prev || []),
        parsedData,
      ]);
    });

    return () => {
      socket.close();
    };
  }, []);

  console.log("socketProvider", socketProvider);
  return (
    <div className="w-full h-full">
      <h1>Hello</h1>
      <div>
        <input type="text" />
      </div>
    </div>
  );
}

export default PlayArea;
