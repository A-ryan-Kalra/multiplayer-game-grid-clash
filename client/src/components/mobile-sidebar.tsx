import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { UserProps } from "@/type";
import { Users } from "lucide-react";
function MobileSidbar({ userSockets }: { userSockets: UserProps[] | [] }) {
  return (
    <Sheet>
      <SheetTrigger className="bg-slate-300 p-2 lg:hidden rounded-full">
        <Users />
      </SheetTrigger>
      <SheetContent>
        <div className=" w-full flex gap-y-2 flex-col h-full bg-amber-200 border-r border-r-slate-900 flex-1">
          <h1 className="text-3xl max-sm:text-xl p-1 w-full text-white font-semibold text-left bg-orange-400">
            Participants{" "}
            <span className="px-2 max-sm:text-xl bg-amber-100 text-green-600 font-semibold w-fit h-fit text-2xl text-center">
              {userSockets?.length}
            </span>
          </h1>

          <div className="flex flex-col w-full gap-y-1 relative left-2">
            {userSockets?.map((player) => (
              <div className="flex items-center gap-x-1">
                <span className="bg-[#3fba6e] w-1 p-1 h-1 rounded-full"></span>
                <p className="font-mono text-sm  font-semibold">
                  {player.userName}
                </p>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default MobileSidbar;
