export interface UserProps {
  x: number;
  y: number;
  height: number;
  width: number;
  userName: string;
  cursorStyle: string;
}

export interface CursorMovementProps {
  x: number;
  y: number;
  height: number;
  width: number;
  userName: string;
  cursorStyle: string;
}
export interface GridLayoutProps {
  data: string;
  userName: string;
  event: string;
  position: number;
  timestamp: number;
}

export interface UserPopoverProps {
  names: string;
}
