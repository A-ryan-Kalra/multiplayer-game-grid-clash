import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { UserPopoverProps } from "@/type";

function UserPopover({ names }: UserPopoverProps) {
  const userNames = names.split(",");
  const total = userNames.length;

  return (
    <div className="absolute bottom-0 right-3">
      <Popover>
        <PopoverTrigger className="p-0 m-0 w-0 text-xs h-px ">
          {total}
        </PopoverTrigger>
        <PopoverContent className="text-xs w-fit p-1 m-0 flex flex-col gap-y-1">
          {userNames?.map((name, index) => (
            <span>
              {index + 1}. {name}
            </span>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default UserPopover;
