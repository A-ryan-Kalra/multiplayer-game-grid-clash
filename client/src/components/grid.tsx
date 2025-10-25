import { useEffect, useRef, type ChangeEvent } from "react";
import { useSocket } from "../services/use-socket-provider";
import type { GridLayoutProps } from "../type";

function Grids({ position, data }: GridLayoutProps) {
  const gridRef = useRef<HTMLInputElement>(null);
  const { socketProvider } = useSocket();

  const handleData = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log(value);
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
      })
    );
  };

  //   useEffect(() => {
  //     console.log("first");
  //   }, []);

  return (
    <div
      key={position}
      className="border-gray-500 w-full h-full hover:opacity-60 text-2xl text-center bg-amber-200 border-2 p-1"
    >
      {/* {index + 1} */}
      <input
        defaultValue={data}
        ref={gridRef}
        onChange={handleData}
        type="text"
        className="h-full w-full text-center border-none outline-none cursor-none"
      />
    </div>
  );
}

export default Grids;
