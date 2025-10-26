import type { UserProps } from "@/type";
import { LogOutIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Sidebar({ userSockets }: { userSockets: UserProps[] | [] }) {
  const navigate = useNavigate();

  return (
    <div className="relative w-full max-lg:hidden flex gap-y-2 flex-col h-full bg-amber-200 border-r border-r-slate-900 flex-1">
      <div className="w-full flex items-center justify-center bg-orange-400">
        <h1 className="text-3xl max-sm:text-xl p-1 w-full text-white font-semibold text-center ">
          Participants{" "}
          <span className="px-2 max-sm:text-xl bg-amber-100 text-green-600 font-semibold w-fit h-fit text-2xl text-center">
            {userSockets?.length}
          </span>
        </h1>

        <div
          onClick={() => navigate("/")}
          className="p-0.5 hover:opacity-75 bg-amber-100 rounded-md"
        >
          <LogOutIcon className="right-2" width={20} />
        </div>
      </div>

      <div className="flex flex-col w-full gap-y-1 relative left-2">
        {userSockets?.map((player, index) => (
          <div key={index} className="flex items-center gap-x-1">
            <span className="bg-[#3fba6e] w-1 p-1 h-1 rounded-full"></span>
            <p className="font-mono text-sm  font-semibold">
              {player.userName}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
