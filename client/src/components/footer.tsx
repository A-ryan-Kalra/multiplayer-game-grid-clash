import { Github } from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className={`bg-white`}>
      <div className="flex relative justify-around items-center h-10 duration-300 py-2 border-t border-slate-800">
        <span className="md:text-sm text-[14px] flex items-center justify-center gap-x-1">
          &copy; {new Date().getFullYear()} | ⚔️ GRID CLASH |
          <Link
            target="__blank"
            to={"https://github.com/A-ryan-Kalra/multiplayer-game-grid-clash"}
            className="bg-slate-300 rounded-full p-1 hover:bg-slate-200 cursor-pointer transition"
          >
            <Github className="fill-white w-4 sm:w-4 h-4 sm:h-4" />
          </Link>
        </span>
      </div>
    </footer>
  );
}

export default Footer;
