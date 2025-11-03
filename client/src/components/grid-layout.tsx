import { useSocket } from "@/services/use-socket-provider";
import type { GridLayoutProps, UserProps } from "@/type";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Grids from "./grid";
import MobileSidbar from "./mobile-sidebar";
import { useParams, useSearchParams } from "react-router-dom";
import moment from "moment";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000";

function GridLayout({ userSockets }: { userSockets: UserProps[] | [] }) {
  const roomNo = useParams()?.roomId ?? 1;
  const [searchParams] = useSearchParams();
  const unique = searchParams.get("accessId");
  const name = searchParams.get("name");
  const showTimerRef = useRef<HTMLDivElement>(null);
  const { socketProvider } = useSocket();
  const firstTimeStamp = useRef<number>(0);
  const lastTimeStamp = useRef<number>(0);
  const [isTimeLineOn, setIsTimeLineOn] = useState<boolean>(false);
  const recordGridDetails = useRef<GridLayoutProps[]>([]);
  const [lastChangesOnGrid, setLastChangesOnGrid] =
    useState<GridLayoutProps | null>(null);
  const timerRef = useRef<number | null>(null);
  const [showCountDown, setShowCountDown] = useState<boolean>(false);

  const [timeLine, setTimeLine] = useState<boolean>(false);
  const countDownRef = useRef<number>(59);

  const [gridInfo, setGridInfo] = useState(
    Array.from({ length: 100 }, (_, index) => ({
      data: "",
      userName: ``,
      event: "grid",
      position: index,
      timestamp: Date.now(),
    }))
  );
  const sharedState = useRef(
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

  useEffect(() => {
    sharedState.current = gridInfo;
  }, [gridInfo]);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const gridInfoSocket = new WebSocket(
      `${protocol}://${WS_URL}/grid-info/room/${roomNo}?name=${name}${unique}`
      // `wss://rn28c5qs-5173.inc1.devtunnels.ms/grid-info/room/${roomNo}?name=${name}${unique}`
    );
    const requestGameSocket = new WebSocket(
      `${protocol}://${WS_URL}/request-data/room/${roomNo}?name=${name}${unique}`
      // `wss://rn28c5qs-5173.inc1.devtunnels.ms/cursor/room/${roomNo}?name=${name}${unique}`
    );
    socketProvider.set("grid-info", {
      socket: gridInfoSocket,
      userName: `${name}${unique}`,
    });

    gridInfoSocket?.addEventListener("message", (data) => {
      const parsedData = JSON.parse(data.data);

      // Group multiple people in a sec
      const isSamePosition =
        parsedData.position ===
        recordGridDetails.current[recordGridDetails.current.length - 1]
          ?.position;
      const isUpdatedInASecond =
        (parsedData.timestamp as number) -
          recordGridDetails.current[recordGridDetails.current.length - 1]
            ?.timestamp <
        1000;

      if (isUpdatedInASecond && isSamePosition) {
        const combine = {
          ...parsedData,
          data:
            recordGridDetails.current[recordGridDetails.current.length - 1]
              .data +
            "," +
            parsedData.data,
          userName:
            recordGridDetails.current[recordGridDetails.current.length - 1]
              .userName +
            "," +
            parsedData.userName,
        };
        recordGridDetails.current.pop();
        recordGridDetails.current = [...recordGridDetails.current, combine];
      } else {
        recordGridDetails.current = [...recordGridDetails.current, parsedData];
      }

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
            isSamePosition &&
            isUpdatedInASecond &&
            prevUser !== parsedData?.userName;

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

    requestGameSocket.addEventListener("message", (data) => {
      const parsedData: any = JSON.parse(data.data);

      if (parsedData.route === "sender") {
        const userInput = prompt(
          `${parsedData?.userName} requests you to send the current game session. Please confirm (y/n):`
        );

        const requestSocket = socketProvider?.get("request-data")?.socket;
        if (
          userInput?.toLowerCase() === "y" ||
          userInput?.toLowerCase() === "yes"
        ) {
          requestSocket?.send(
            JSON.stringify({
              userName: `${name}` + unique,
              reciever: parsedData?.userName,
              data: sharedState?.current,
              note: "accepted",
              route: "reciever",
            })
          );
          return;
        }
        if (
          userInput?.toLowerCase() !== "y" ||
          userInput?.toLowerCase() !== "yes"
        ) {
          requestSocket!.send(
            JSON.stringify({
              userName: `${name}` + unique,
              reciever: parsedData?.userName,
              note: "unaccepted",
              route: "reciever",
            })
          );
        }
      } else if (parsedData?.route === "reciever") {
        if (parsedData?.note === "unaccepted") {
          alert(parsedData?.userName + " rejected your request");
          return;
        }
        setGridInfo(parsedData?.data);
      }
    });

    return () => {
      gridInfoSocket.close();
      requestGameSocket.close();
    };
  }, []);

  useEffect(() => {
    if (showCountDown) {
      showTimerRef.current!.textContent = `0:59`;
      countDownRef.current = countDownTimer();
    }
    return () => clearInterval(countDownRef.current);
  }, [showCountDown]);

  const newArray = () =>
    Array.from({ length: 100 }, (_, index) => ({
      data: "",
      userName: ``,
      event: "grid",
      position: index,
      timestamp: Date.now(),
    }));

  function handleTime(e: ChangeEvent<HTMLInputElement>) {
    const targetTime = Number(e.target.value);
    setValue(targetTime);
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setTimeLine(true);
      let base = newArray();
      for (const e of recordGridDetails.current) {
        if (e.timestamp > targetTime) break;
        setLastChangesOnGrid(e);
        base[e.position] = e;
      }

      setSoftCopy(base);
    }, 80);
  }

  let countDown = 59;
  const countDownTimer = () => {
    const timer = setInterval(() => {
      if (countDown > 0) {
        countDown -= 1;
      } else {
        setShowCountDown(false);
        clearInterval(timer);
      }

      showTimerRef.current!.textContent =
        countDown.toString().length >= 2 ? `0:${countDown}` : `0:0${countDown}`;
    }, 1000);

    return timer;
  };

  return (
    <div className="flex-3 flex relative flex-col gap-y-3 py-2 h-full w-full items-center  p-1">
      <h1 className="md:text-2xl text-lg font-semibold">
        GRID CLASH ⚔️ | 10x10 Multiplayer Arena
      </h1>
      <h1 className="text-lg ">Add emojis to the box</h1>
      <div className="sm:h-[660px]  relative max-w-[720px] flex flex-col  gap-y-2">
        <div className="w-full mt-5 rounded-sm bg-slate-100 border-2 gap-1 h-full p-2 grid-cols-10 grid mx-auto ">
          {showCountDown && (
            <div className=" absolute top-0 right-2 text-xs gap-1 flex items-center">
              <p>Please wait untill </p>{" "}
              <span
                className="inline-block w-6 text-center"
                ref={showTimerRef}
              />{" "}
              before making your next update.
            </div>
          )}
          {(timeLine ? softCopy : gridInfo)?.map((item, index) => (
            <Grids
              showCountDownTimer={() => setShowCountDown(true)}
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
        {lastChangesOnGrid && (
          <p className="text-xs font-semibold">
            Review last changes made by: ( {lastChangesOnGrid.userName}
            {"- "}
            {lastChangesOnGrid.data} ) at{" "}
            {moment(lastChangesOnGrid.timestamp).format("hh:mm:ss A")}
          </p>
        )}
        <div className="flex items-center gap-x-2 border-slate-400 border-[1px] p-1  rounded-md w-full justify-center">
          <button
            disabled={recordGridDetails.current.length === 0}
            onClick={(e) => {
              e.stopPropagation();
              setTimeLine(false);
              setIsTimeLineOn((prev) => !prev);
              lastTimeStamp.current = Date.now();
              if (timeLine) setLastChangesOnGrid(null);
            }}
            className={`p-1.5 text-nowrap disabled:opacity-50 hover:opacity-70 cursor-none rounded-md ${
              !isTimeLineOn ? "bg-blue-500" : "bg-green-500"
            }  text-white font-semibold text-sm`}
          >
            {!isTimeLineOn ? "View Timeline" : "View Live"}
          </button>
          <input
            type="range"
            min={startTime - 1}
            max={endTime}
            value={value}
            disabled={!isTimeLineOn}
            step={(endTime - startTime) / 100}
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
