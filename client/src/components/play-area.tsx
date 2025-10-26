import { useEffect, useRef, useState } from "react";
import { useSocket } from "../services/use-socket-provider";
import { type UserProps } from "../type";
import UsersCursorMovement from "./user-cursor-movement";
import CursorMovement from "./cursor-movement";

import Sidebar from "./sidebar";

import GridLayout from "./grid-layout";
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000";

function PlayArea() {
  const { socketProvider } = useSocket();
  const [userSockets, setUserSockets] = useState<UserProps[]>();
  const unique = Date.now().toString().slice(-3);
  const cursorRef = useRef<HTMLDivElement>(null);

  // console.log(socketProvider);
  // console.log(gridInfo);

  useEffect(() => {
    const userSocket = new WebSocket(
      `${WS_URL}/enter/room/1?name=Aryan${unique}`
    );
    const userCursorSocket = new WebSocket(
      `${WS_URL}/cursor/room/1?name=Aryan${unique}`
    );

    socketProvider.set("user", {
      socket: userSocket,
      userName: `Aryan${unique}`,
    });
    socketProvider.set("cursor", {
      socket: userCursorSocket,
      userName: `Aryan${unique}`,
    });

    console.log(`Aryan${unique}`);

    userSocket.addEventListener("open", () => {
      userSocket.send(JSON.stringify({ userName: `Aryan` + unique }));
    });

    userCursorSocket.addEventListener("open", () => {
      console.log("Established User Cursor Socket connection");
    });

    userSocket.addEventListener("message", (data) => {
      const parsedData = JSON.parse(data.data);
      console.log("Message User");
      if (parsedData?.exit && parsedData?.event !== "cursor") {
        setUserSockets((prev: UserProps[] | undefined) => {
          const updatedMember = prev?.filter(
            (user) => user.userName !== parsedData?.userName
          );

          return updatedMember;
        });
      } else {
        setUserSockets((prev: UserProps[] | undefined) => [
          ...(prev || []),
          {
            userName: parsedData?.userName,
            cursorStyle: "purple",
            height: -100,
            width: -100,
            x: -100,
            y: -100,
          } as UserProps,
        ]);
      }
    });

    userCursorSocket.addEventListener("message", (data) => {
      const parsedData = JSON.parse(data.data);

      // console.log(parsedData);
      if (parsedData.event === "cursor") {
        setUserSockets((prev: UserProps[] | undefined) => {
          let updatedUser: number = prev?.findIndex(
            (user) => user.userName === parsedData.userName
          ) as number;

          if (updatedUser !== -1) {
            const newUser = [...(prev as UserProps[])];
            newUser[updatedUser] = parsedData;
            // console.log("prev", prev);
            return newUser;
          } else {
            return [...(prev as UserProps[]), parsedData];
          }
        });
      }
    });

    function handleMouseMove(e: MouseEvent) {
      // console.log({ x: e.clientX, y: e.clientY });
      userCursorSocket.send(
        JSON.stringify({
          x: e.clientX,
          y: e.clientY,
          height: window.innerHeight,
          width: window.innerWidth,
          userName: `Aryan${unique}`,
          event: "cursor",
          cursorStyle: "purple",
        })
      );
      cursorRef.current!.style.transform = `translate(${e.clientX - 6}px, ${
        e.clientY - 1
      }px)`;
      cursorRef.current!.style.backgroundColor = `red`;
    }
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      userSocket.close();

      userCursorSocket.close();
      window.removeEventListener("mousemove", handleMouseMove);
      localStorage.removeItem("pause");
    };
  }, []);
  // console.log(userSockets);

  return (
    <div className="w-full h-full flex bg-amber-100/70 backdrop-blur-sm cursor-none">
      <Sidebar userSockets={userSockets || []} />
      <CursorMovement ref={cursorRef} />
      {userSockets?.map((user: UserProps, index: number) => (
        <UsersCursorMovement {...user} key={index} />
      ))}
      <GridLayout />
    </div>
  );
}

export default PlayArea;
