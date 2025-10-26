import { useSocket } from "@/services/use-socket-provider";
import type { GridLayoutProps } from "@/type";
import { useEffect, useState } from "react";
import Grids from "./grid";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000";

function GridLayout() {
  const unique = Date.now().toString().slice(-3);
  const { socketProvider } = useSocket();
  const [gridInfo, setGridInfo] = useState(
    Array.from({ length: 100 }, (_, index) => ({
      data: "",
      userName: ``,
      event: "grid",
      position: index,
      timestamp: Date.now(),
    }))
  );

  useEffect(() => {
    const gridInfoSocket = new WebSocket(
      `${WS_URL}/grid-info/room/1?name=Aryan${unique}`
    );
    socketProvider.set("grid-info", {
      socket: gridInfoSocket,
      userName: `Aryan${unique}`,
    });

    gridInfoSocket?.addEventListener("message", (data) => {
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
    return () => {
      gridInfoSocket.close();
    };
  }, []);

  return (
    <div className="flex-3 flex relative flex-col gap-y-5 h-full w-full items-center  p-1">
      <h1 className="md:text-2xl text-lg font-semibold">
        🧩 GRID CLASH ⚔️ | 10x10 Multiplayer Arena
      </h1>
      <h1 className="text-xl ">Add emojis to the box</h1>
      <div className="w-full rounded-sm bg-slate-100 border-2 p-2 grid-cols-10 grid mx-auto min-h-[620px]  max-w-[720px] gap-1">
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
      {/* <MobileSidbar userSockets={userSockets || []} /> */}
      <div></div>
      {/* <Time /> */}
    </div>
  );
}

export default GridLayout;
