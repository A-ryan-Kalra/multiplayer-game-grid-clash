import { createContext, useContext, useRef, type ReactNode } from "react";

const SocketContext = createContext<
  Map<string, { socket: WebSocket; userName: string }>
>(new Map());

export function useSocket() {
  const socketProvider = useContext(SocketContext);
  return { socketProvider };
}

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const socketRefs = useRef<
    Map<string, { socket: WebSocket; userName: string }>
  >(new Map());

  return (
    <SocketContext.Provider value={socketRefs.current}>
      {children}
    </SocketContext.Provider>
  );
};
