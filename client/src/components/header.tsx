import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

function HeaderPage() {
  return (
    <header
      className={cn(
        "w-full top-0 z-100 border-b-px duration-100 bg-amber-200",
        "bg-slate-200/50 backdrop-blur-sm border-b-slate-200"
      )}
    >
      <div
        className={cn(
          "max-w-[1280px] mx-auto flex p-2  items-center justify-between"
        )}
      >
        <Link
          to={"/"}
          className="focus-visible:outline-none flex items-center gap-x-1 sm:gap-x-3"
        >
          <div className="relative sm:w-20 sm:h-20  w-16 h-16">
            {/* <img
              draggable="false"
              alt="/icons/maskable-icon.png"
              src={"/icons/maskable-icon.png"}
              className="object-cover scale-[150%] sm:scale-[155%] aspect-square"
            /> */}
          </div>
          <h1 className=" font-semibold text-lg sm:text-2xl">GRID CLASH ⚔️ </h1>
        </Link>

        {/* <NavbarPage /> */}
      </div>
    </header>
  );
}

export default HeaderPage;
