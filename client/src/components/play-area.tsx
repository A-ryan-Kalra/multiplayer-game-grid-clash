import { useEffect, useRef, useState } from "react";
import { useSocket } from "../services/use-socket-provider";
import { type GridLayoutProps, type UserProps } from "../type";
import UsersCursorMovement from "./user-cursor-movement";
import CursorMovement from "./cursor-movement";
import Grids from "./grid";
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
    <div className="w-full h-full flex cursor-none">
      <div className="relative w-full flex gap-y-2 flex-col h-full bg-amber-200 border-r border-r-slate-900 flex-1">
        <h1 className="text-3xl p-1 w-full text-white font-semibold text-center bg-orange-400">
          Participants{" "}
          <span className="px-2  bg-amber-100 text-green-600 w-fit h-fit text-2xl text-center">
            {userSockets?.length}
          </span>
        </h1>

        <div className="flex flex-col w-full relative left-2">
          {userSockets?.map((player) => (
            <div className="flex items-center gap-x-1">
              <span className="bg-[#3fba6e] w-1 p-1 h-1 rounded-full"></span>
              <p> {player.userName}</p>
            </div>
          ))}
        </div>
      </div>
      <CursorMovement ref={cursorRef} />
      {userSockets?.map((user: UserProps, index: number) => (
        <UsersCursorMovement {...user} key={index} />
      ))}
      <div className="flex-3 flex relative h-full w-full items-center justify-center p-1">
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
      </div>
    </div>
  );
}

export default PlayArea;
