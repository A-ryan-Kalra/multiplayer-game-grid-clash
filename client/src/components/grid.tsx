import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useSocket } from "../services/use-socket-provider";
import type { GridLayoutProps } from "../type";
import UserPopover from "./user-popover";
import { useSearchParams } from "react-router-dom";

function Grids({
  position,
  data,
  userName,
  timeLine,
  showCountDownTimer,
}: GridLayoutProps & { showCountDownTimer: () => void }) {
  const [value, setValue] = useState<string>("");
  const copyValue = useRef<string>("");
  const [searchParams] = useSearchParams();
  const unique = searchParams.get("accessId");
  const name = searchParams.get("name");
  const gridRef = useRef<HTMLInputElement>(null);
  const { socketProvider } = useSocket();

  function isMinutePassed() {
    const now = Date.now();
    const lastSaved = Number(localStorage.getItem(`${name}${unique}`));
    const isUserSessionSaved = Object.keys(localStorage).includes(
      `${name}${unique}`
    );
    if (!lastSaved && isUserSessionSaved) return true;
    const millisecondsInAMinute = 1000 * 60;

    const duration = now - lastSaved;

    return duration >= millisecondsInAMinute;
  }

  const handleData = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isMinutePassed()) {
      gridRef.current?.blur();
      alert("Please wait a minute before making another update.");
      // e.preventDefault();
      return;
    }
    showCountDownTimer();
    const value = e.target.value;
    if ([...value].length !== 1) {
      gridRef.current?.blur();
      alert("Please enter only one character or emoji.");
      return;
    }
    copyValue.current = value;
    gridRef.current!.value = value;

    //   e.target.value.length > 1 ? e.target.value.slice(1) : e.target.value;

    // e.target.value = "";
    setValue(value);

    gridRef.current?.blur();
    const gridSocketProvider = socketProvider.get("grid-info");

    const gridData = gridSocketProvider?.socket;
    const userName = gridSocketProvider?.userName;

    gridData?.send(
      JSON.stringify({
        data: value,
        userName,
        event: "grid",
        position: position,
        timestamp: Date.now(),
      })
    );

    localStorage.setItem(`${name}${unique}`, Date.now().toString());
  };

  useEffect(() => {
    // if (data) {
    setValue(data);
    // }
  }, [data]);

  function handleClick(e: React.MouseEvent<HTMLInputElement>) {
    if (timeLine) {
      // setValue(copyValue.current);
      gridRef.current?.blur();
      alert("Please turn on the live mode to edit.");

      return;
    }
    (e.target as HTMLInputElement).setSelectionRange(
      (e.target as HTMLInputElement).value.length,
      (e.target as HTMLInputElement).value.length
    );
    setValue((e.target as HTMLInputElement).value);
    (e.target as HTMLInputElement).value = "";
  }

  // console.log("--------------");
  // console.log("data", value);
  return (
    <div
      key={position}
      className={`relative rounded-sm border-gray-500 w-full h-full hover:opacity-60 text-2xl text-center  border-2 sm:p-1 ${
        userName ? "bg-amber-300" : "bg-amber-200"
      }`}
    >
      {/* {index + 1} */}
      {userName && <UserPopover names={userName} />}
      <input
        value={value}
        onFocus={(e) => {
          if (timeLine) return;
          copyValue.current = value;
          e.target.value = "";
        }}
        onBlur={() => setValue(copyValue.current)}
        onClick={handleClick}
        ref={gridRef}
        // value={value}
        onChange={handleData}
        type="text"
        className="h-full  w-full text-center border-none outline-none cursor-none"
      />
    </div>
  );
}

export default Grids;
