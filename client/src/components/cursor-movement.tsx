import type { Ref } from "react";

function CursorMovement({ ref }: { ref: Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      style={{
        WebkitMaskImage: "url('/pointer.svg')",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        position: "fixed",
        WebkitMaskPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
        backgroundPosition: "center",
        zIndex: 999999,

        width: "25px",
        height: "25px",
      }}
      className="relative top-0 left-0 mx-auto"
    ></div>
  );
}

export default CursorMovement;
