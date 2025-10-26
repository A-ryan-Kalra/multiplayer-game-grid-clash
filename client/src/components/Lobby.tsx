import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

function Lobby() {
  const navigate = useNavigate();
  const [details, setDetails] = useState({ name: "", room: "" });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!details.name || !details.room) {
      alert("Fields required");
      return;
    }
    const unique = Date.now().toString().slice(-3);
    navigate(`/room/${details.room}?name=${details.name}&accessId=${unique}`);
  };

  return (
    <div className="flex  w-full h-full justify-center items-center">
      <div className="h-fit w-fit bg-gradient-to-tl rounded-md p-1 overflow-hidden from-emerald-400 via-pink-600 to-purple-400">
        <div className="flex gap-y-4 flex-col bg-white rounded-sm overflow-hidden items-center p-2 m-1  w-fit h-fit border-[1px] border-zinc-200 ">
          <h1 className="text-4xl max-sm:text-3xl font-semibold text-teal-500 ">
            Welcome to the Lobby
          </h1>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-y-2 mt-10 p-3"
          >
            <div className=" flex gap-x-4 items-center justify-between">
              <label htmlFor="name" className="sm:text-lg text-xs">
                Enter Name
              </label>
              <input
                type="text"
                id="name"
                onChange={(e) =>
                  setDetails((prev) => ({ ...prev, name: e.target.value }))
                }
                value={details.name}
                autoComplete="username"
                className="bg-zinc-200 p-1 border-none outline-none focus-visible:ring-0"
              />
            </div>
            <div className=" flex gap-x-4 items-center justify-between">
              <label htmlFor="room" className="sm:text-lg text-xs">
                Enter Room No
              </label>
              <input
                id="room"
                onChange={(e) =>
                  setDetails((prev) => ({ ...prev, room: e.target.value }))
                }
                value={details.room}
                autoComplete="off"
                className="bg-zinc-200 p-1 border-none outline-none focus-visible:ring-0"
              />
            </div>

            <button className="bg-cyan-400 mt-2 w-fit ml-auto hover:scale-110 transition duration-300 px-10 cursor-pointer py-2 rounded-2xl ">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Lobby;
