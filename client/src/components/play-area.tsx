import { useEffect, useRef, useState } from "react";
import { useSocket } from "../services/use-socket-provider";
import { type GridLayoutProps, type UserProps } from "../type";
import UsersCursorMovement from "./user-cursor-movement";
import CursorMovement from "./cursor-movement";
import Grids from "./grid";
import Sidebar from "./sidebar";
import MobileSidbar from "./mobile-sidebar";
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000";

function PlayArea() {
  const { socketProvider } = useSocket();
  const [userSockets, setUserSockets] = useState<UserProps[]>();
  const unique = Date.now().toString().slice(-3);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [gridInfo, setGridInfo] = useState(
    Array.from({ length: 100 }, (_, index) => ({
      data: "",
      userName: ``,
      event: "grid",
      position: index,
      timestamp: Date.now(),
    }))
  );
  // console.log(socketProvider);
  // console.log(gridInfo);

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

    socketProvider.set("user", {
      socket: userSocket,
      userName: `Aryan${unique}`,
    });
    socketProvider.set("cursor", {
      socket: userCursorSocket,
      userName: `Aryan${unique}`,
    });
    socketProvider.set("grid-info", {
      socket: gridInfoSocket,
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

    gridInfoSocket.addEventListener("message", (data) => {
      const parsedData = JSON.parse(data.data);

      console.log(parsedData);
      if (parsedData.event === "grid") {
        setGridInfo((prev: GridLayoutProps[]) => {
          let updatedGrid: number = prev?.findIndex(
            (grid: GridLayoutProps) => grid.position === parsedData.position
          ) as number;

          const newGrid = [...prev];
          const prevUser = newGrid[updatedGrid].userName;
          const prevData = newGrid[updatedGrid].data;

          const isSecondPassed =
            parsedData?.timestamp - (newGrid[updatedGrid].timestamp as number) <
              3000 && prevUser !== parsedData?.userName;

          if (prevUser && prevData && isSecondPassed) {
            newGrid[updatedGrid] = {
              ...parsedData,
              userName: prevUser + "," + parsedData?.userName,
              data: prevData + "," + parsedData?.data,
            };
          } else {
            newGrid[updatedGrid] = parsedData;
          }

          return newGrid;
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
      gridInfoSocket.close();
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
      <div className="flex-3 flex relative flex-col gap-y-5 h-full w-full items-center  p-1">
        <h1 className="md:text-2xl text-lg font-semibold">
          🧩 GRID CLASH ⚔️ | 10x10 Multiplayer Arena
        </h1>
        <h1 className="text-xl ">Add emojis to the box</h1>
        <div className="w-full grid-cols-10 grid mx-auto min-h-[620px]  max-w-[720px] gap-1">
          {gridInfo.map((item, index) => (
            <Grids
              timestamp={item.timestamp}
              event="grid"
              userName={item.userName}
              data={item.data}
              position={item.position}
              key={index}
            />
          ))}
        </div>
        <MobileSidbar userSockets={userSockets || []} />
      </div>
    </div>
  );
}

export default PlayArea;
