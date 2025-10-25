import { useEffect, useRef, type ChangeEvent } from "react";

function Grids({ index }: { index: number }) {
  const gridRef = useRef<HTMLInputElement>(null);

  const handleData = (e: ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
    gridRef.current?.blur();
  };

  //   useEffect(() => {
  //     console.log("first");
  //   }, []);

  return (
    <div
      key={index}
      className="border-gray-500 w-full h-full hover:opacity-60 text-2xl text-center bg-amber-200 border-2 p-1"
    >
      {/* {index + 1} */}
      <input
        ref={gridRef}
        onChange={handleData}
        type="text"
        className="h-full w-full text-center border-none outline-none cursor-none"
      />
    </div>
  );
}

export default Grids;
