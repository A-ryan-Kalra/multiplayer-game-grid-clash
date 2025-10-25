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
    const userSocket = new WebSocket(
      `${WS_URL}/enter/room/1?name=Aryan${unique}`
    );
    const userCursorSocket = new WebSocket(
      `${WS_URL}/cursor/room/1?name=Aryan${unique}`
    );

    socketProvider.set("user", userSocket);
    socketProvider.set("cursor", userCursorSocket);

    // setUserSockets(
    //   (prev: UserProps[] | undefined) =>
    //     [
    //       ...(prev || []),
    //       { userName: `Hello From Aryan ${unique}` },
    //     ] as UserProps[]
    // );

    // console.log(socketProvider.get("user"));
    // console.log(socket.readyState);
    console.log(`Aryan${unique}`);

    userSocket.addEventListener("open", () => {
      userSocket.send(JSON.stringify({ userName: `Aryan` + unique }));
    });
    userCursorSocket.addEventListener("open", () => {
      console.log("EstablishedUser Cursor SOcker operations");
    });
    userSocket.addEventListener("message", (data) => {
      const parsedData = JSON.parse(data.data);

      if (parsedData?.exit && parsedData?.event !== "cursor") {
        setUserSockets((prev: UserProps[] | undefined) => {
          const updatedMember = prev?.filter(
            (user) => user.userName !== parsedData?.userName
          );

          return updatedMember;
        });
      } else if (parsedData?.event === "cursor") {
        console.log(parsedData);
      } else {
        setUserSockets((prev: UserProps[] | undefined) => [
          ...(prev || []),
          parsedData,
        ]);
      }
    });
    userCursorSocket.addEventListener("message", (data) => {
      const parsedData = JSON.parse(data.data);

      console.log(parsedData);
    });

    function handleMouseMove(e: MouseEvent) {
      // console.log({ x: e.clientX, y: e.clientY });
      userCursorSocket.send(
        JSON.stringify({ x: e.clientX, y: e.clientY, event: "cursor" })
      );
    }
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      userSocket.close();
      userCursorSocket.close();
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

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
