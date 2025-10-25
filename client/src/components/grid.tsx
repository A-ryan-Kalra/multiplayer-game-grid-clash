import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useSocket } from "../services/use-socket-provider";
import type { GridLayoutProps } from "../type";
import UserPopover from "./user-popover";

function Grids({ position, data, userName }: GridLayoutProps) {
  const [value, setValue] = useState<string>("");
  const copyValue = useRef<string>("");

  const gridRef = useRef<HTMLInputElement>(null);
  const { socketProvider } = useSocket();
  function isMinutePassed() {
    const now = Date.now();
    const lastSaved = Number(localStorage.getItem("pause"));

    if (!lastSaved) return true;
    const millisecondsInAMinute = 1000 * 6;

    const duration = now - lastSaved;

    return duration >= millisecondsInAMinute;
  }
  const handleData = (e: ChangeEvent<HTMLInputElement>) => {
    console.log("update", isMinutePassed());
    // if (!isMinutePassed()) {
    //   alert("Please wait a minute before making another update.");
    //   e.preventDefault();
    //   return;
    // }
    const value = e.target.value;
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

    localStorage.setItem("pause", Date.now().toString());
  };

  useEffect(() => {
    if (data) {
      setValue(data);
      console.log("userName", userName);
    }
  }, [data]);
  // console.log("data", data);
  return (
    <div
      key={position}
      className={`relative border-gray-500 w-full h-full hover:opacity-60 text-2xl text-center  border-2 p-1 ${
        userName ? "bg-amber-300" : "bg-amber-200"
      }`}
    >
      {/* {index + 1} */}
      {userName && <UserPopover names={userName} />}
      <input
        value={value}
        onFocus={(e) => {
          copyValue.current = value;
          e.target.value = "";
        }}
        onBlur={() => setValue(copyValue.current)}
        onClick={(e: React.MouseEvent<HTMLInputElement>) => {
          (e.target as HTMLInputElement).setSelectionRange(
            (e.target as HTMLInputElement).value.length,
            (e.target as HTMLInputElement).value.length
          );
          setValue((e.target as HTMLInputElement).value);
          (e.target as HTMLInputElement).value = "";
        }}
        ref={gridRef}
        // value={value}
        onChange={handleData}
        type="text"
        className="h-full w-full text-center border-none outline-none cursor-none"
      />
    </div>
  );
}

export default Grids;
