import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { UserPopoverProps } from "@/type";
import { UserRound } from "lucide-react";

function UserPopover({ names }: UserPopoverProps) {
  const userNames = names.split(",");
  //   const total = userNames.length;

  return (
    <div className="absolute bottom-1 cursor-none right-3">
      <Popover>
        <PopoverTrigger className="p-0 m-0 w-0 cursor-none text-[9px] h-px ">
          {/* {total} */}
          <UserRound size={13} />
        </PopoverTrigger>
        <PopoverContent className="text-xs w-fit cursor-default p-1 m-0 flex flex-col gap-y-1">
          {userNames?.map((name, index) => (
            <span key={index}>
              {index + 1}. {name}
            </span>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default UserPopover;
