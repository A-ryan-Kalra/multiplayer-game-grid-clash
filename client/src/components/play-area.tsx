import { useEffect, useRef, useState } from "react";
import { useSocket } from "../services/use-socket-provider";
import { type UserProps } from "../type";
import UsersCursorMovement from "./user-cursor-movement";
import CursorMovement from "./cursor-movement";
import Grids from "./grid";
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000";

function PlayArea() {
  const { socketProvider } = useSocket();
  const [userSockets, setUserSockets] = useState<UserProps[]>();
  const unique = Date.now().toString().slice(-3);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [gridInfo, setGridInfo] = useState(Array.from({ length: 100 }));
  console.log(socketProvider);

  useEffect(() => {
    const userSocket = new WebSocket(
      `${WS_URL}/enter/room/1?name=Aryan${unique}`
    );
    const userCursorSocket = new WebSocket(
      `${WS_URL}/cursor/room/1?name=Aryan${unique}`
    );
    const gridInfoSocket = new WebSocket(
      `${WS_URL}/grid-info/room/1?name=Aryan${unique}`
    );

    socketProvider.set("user", userSocket);
    socketProvider.set("cursor", userCursorSocket);
    socketProvider.set("grid-info", gridInfoSocket);

    console.log(`Aryan${unique}`);

    userSocket.addEventListener("open", () => {
      userSocket.send(JSON.stringify({ userName: `Aryan` + unique }));
    });

    userCursorSocket.addEventListener("open", () => {
      console.log("Established User Cursor Socket connection");
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
          // const updatedMember = prev?.filter(
          //   (user) => user.userName !== parsedData?.userName
          // );
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
      cursorRef.current!.style.transform = `translate(${e.clientX - 5}px, ${
        e.clientY
      }px)`;
      cursorRef.current!.style.backgroundColor = `red`;
    }
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      userSocket.close();
      gridInfoSocket.close();
      userCursorSocket.close();
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);
  console.log(userSockets);

  return (
    <div className="w-full h-full cursor-none">
      <CursorMovement ref={cursorRef} />
      {userSockets?.map((user: UserProps, index: number) => (
        <UsersCursorMovement {...user} key={index} />
      ))}
      <div className="flex  h-full w-full items-center justify-center p-1">
        <div className="w-full grid-cols-10 grid mx-auto min-h-[620px]  max-w-[720px] gap-1">
          {gridInfo.map((_, index) => (
            <Grids index={index} key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default PlayArea;
