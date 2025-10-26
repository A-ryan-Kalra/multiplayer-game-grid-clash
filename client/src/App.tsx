import { Route, Routes } from "react-router-dom";

import PlayArea from "./components/play-area";
import Lobby from "./components/Lobby";

function App() {
  return (
    <div className="h-screen w-full">
      {/* <HeaderPage /> */}

      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/room/:roomId" element={<PlayArea />} />
      </Routes>
    </div>
  );
}

export default App;
