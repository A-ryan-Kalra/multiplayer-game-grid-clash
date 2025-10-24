import { useEffect } from "react";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000";
function PlayArea() {
  useEffect(() => {
    const socket = new WebSocket(`${WS_URL}/room/1`);
    socket.addEventListener("open", (data) => {
      console.log(data);
    });
    socket.addEventListener("message", (data) => {
      console.log(data);
    });
  }, []);
  return <div className="w-full h-full">PlayArea</div>;
}

export default PlayArea;
