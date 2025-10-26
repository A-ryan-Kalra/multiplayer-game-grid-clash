import { useSocket } from "@/services/use-socket-provider";
import type { GridLayoutProps, UserProps } from "@/type";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Grids from "./grid";
import MobileSidbar from "./mobile-sidebar";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000";

function GridLayout({ userSockets }: { userSockets: UserProps[] | [] }) {
  const unique = Date.now().toString().slice(-3);
  const { socketProvider } = useSocket();
  const firstTimeStamp = useRef<number>(0);
  const lastTimeStamp = useRef<number>(0);
  const [isTimeLineOn, setIsTimeLineOn] = useState<boolean>(false);
  const recordGridDetails = useRef<GridLayoutProps[]>([]);
  const [gridInfo, setGridInfo] = useState(
    Array.from({ length: 100 }, (_, index) => ({
      data: "",
      userName: ``,
      event: "grid",
      position: index,
      timestamp: Date.now(),
    }))
  );
  const [softCopy, setSoftCopy] = useState(
    Array.from({ length: 100 }, (_, index) => ({
      data: "",
      userName: ``,
      event: "grid",
      position: index,
      timestamp: Date.now(),
    }))
  );
  const startTime = firstTimeStamp.current
    ? firstTimeStamp.current
    : gridInfo[0].timestamp;
  const endTime = lastTimeStamp.current ? lastTimeStamp.current : Date.now();

  const [value, setValue] = useState<number>(endTime);
  const [timeLine, setTimeLine] = useState<boolean>(false);

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
      recordGridDetails.current = [...recordGridDetails.current, parsedData];
      if (parsedData.event === "grid") {
        setGridInfo((prev: GridLayoutProps[]) => {
          let updatedGrid: number = prev?.findIndex(
            (grid: GridLayoutProps) => grid.position === parsedData.position
          ) as number;

          if (!firstTimeStamp.current) {
            firstTimeStamp.current = parsedData?.timestamp;
          }

          setValue(parsedData?.timestamp);
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

  const newArray = () =>
    Array.from({ length: 100 }, (_, index) => ({
      data: "",
      userName: ``,
      event: "grid",
      position: index,
      timestamp: Date.now(),
    }));

  function handleTime(e: ChangeEvent<HTMLInputElement>) {
    setTimeLine(true);

    const targetTime = Number(e.target.value);
    setValue(targetTime);
    let base = newArray();
    for (const e of recordGridDetails.current) {
      if (e.timestamp > targetTime) break;

      base[e.position] = e;
    }
    // console.log("newArray", base);
    setSoftCopy(base);
  }

  return (
    <div className="flex-3 flex relative flex-col gap-y-3 py-2 h-full w-full items-center  p-1">
      <h1 className="md:text-2xl text-lg font-semibold">
        🧩 GRID CLASH ⚔️ | 10x10 Multiplayer Arena
      </h1>
      <h1 className="text-lg ">Add emojis to the box</h1>
      <div className="min-h-[660px]  max-w-[720px] flex flex-col  gap-y-2">
        <div className="w-full rounded-sm bg-slate-100 border-2 gap-1 h-full p-2 grid-cols-10 grid mx-auto ">
          {(timeLine ? softCopy : gridInfo)?.map((item, index) => (
            <Grids
              timeLine={isTimeLineOn}
              timestamp={item.timestamp}
              event="grid"
              userName={item.userName}
              data={item.data}
              position={item.position}
              key={index}
            />
          ))}
        </div>

        <div className="flex items-center gap-x-2 border-slate-400 border-[1px] p-1  rounded-md w-full justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setTimeLine(false);
              setIsTimeLineOn((prev) => !prev);
              lastTimeStamp.current = Date.now();
            }}
            className="p-1.5 text-nowrap hover:opacity-70 cursor-none rounded-md bg-blue-300 text-sm"
          >
            {!isTimeLineOn ? "Open Timeline" : "Live"}
          </button>
          <input
            type="range"
            min={startTime - 1}
            max={endTime}
            value={value}
            // defaultValue={5}
            // max={30}
            // onChange={(e) => console.log("e", e.target.value)}
            disabled={!isTimeLineOn}
            // step={(endTime - startTime) / 100}
            onChange={handleTime}
            className="cursor-none w-full"
          />
          <MobileSidbar userSockets={userSockets || []} />
        </div>
      </div>
    </div>
  );
}

export default GridLayout;
