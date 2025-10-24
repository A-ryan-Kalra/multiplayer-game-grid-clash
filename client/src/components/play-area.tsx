import { useEffect } from "react";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000";
function PlayArea() {
  useEffect(() => {
    const socket = new WebSocket(`${WS_URL}/room/1`);
    console.log(socket.readyState);

    socket.addEventListener("open", (data) => {
      console.log(data);
      socket.send(`Hello From Aryan`);
    });
    socket.addEventListener("message", (data) => {
      console.log(data);
    });

    return () => {
      socket.close();
    };
  }, []);
  return (
    <div className="w-full h-full">
      <h1>Hello</h1>
      <div>
        <input type="text" />
      </div>
    </div>
  );
}

export default PlayArea;
