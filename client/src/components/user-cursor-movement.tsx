import type { CursorMovementProps } from "../type";

function UsersCursorMovement({
  x,
  y,
  height,
  width,
  userName,
  cursorStyle,
}: CursorMovementProps) {
  return (
    <div
      style={{
        width: "50px",
        height: "50px",
        position: "fixed",
        borderRadius: "23px",
        pointerEvents: "none",
        zIndex: 999999,
        cursor: "none",
        // transition: "transform 0.04s ease-in-out",
        transform: `translate(${((x - 25) / width) * window.innerWidth}px, ${
          ((y - 25) / height) * window.innerHeight
        }px)`,
      }}
    >
      <div
        style={{
          width: "25px",
          height: "25px",
          color: cursorStyle,
        }}
        className=" relative top-0 left-0 mx-auto"
      >
        {userName}
        {/* <div
          className={`absolute -top-11 min-w-[150px] bg-lime-300/90 ${
            messages.message && "p-1"
          } text-black rounded-[5px] text-sm`}
        >
          {messages.name !== name && messages.message && "Typing..."}
        </div> */}
      </div>
      <div
        style={{
          WebkitMaskImage: "url('/pointer.svg')",
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskSize: "contain",
          WebkitMaskPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundColor: cursorStyle,
          width: "25px",
          height: "25px",
        }}
        className="relative top-0 left-0 mx-auto"
      ></div>
    </div>
  );
}

export default UsersCursorMovement;
