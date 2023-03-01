import { useRef, useCallback } from 'react';
import { Manager } from 'socket.io-client';

import type { Socket, ISession } from '../shared/interfaces';

type IUseInitializeSocket = (args: { socketUrl: string }) => {
  socket: Socket | undefined;
  initializeSocket: (args: ISession) => void;
  disconnectSocket: () => void;
};

export const useInitializeSocket: IUseInitializeSocket = ({ socketUrl }) => {
  const socketRef = useRef<Socket | null>(null);

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, [socketRef]);

  const initializeSocket = useCallback(
    ({ token }: ISession) => {
      if (socketRef.current) {
        disconnectSocket();
      }

      if (token) {
        const manager = new Manager(socketUrl);
        socketRef.current = manager.socket('/', {
          reconnectionDelayMax: 10000,
          transports: ['websocket'],
          auth: {
            token: `${token}`,
          },
        });

        socketRef.current.on('connect_error', (error: any) => {
          // eslint-disable-next-line no-console
          console.error(error.message);
        });
      }
    },
    [socketRef, disconnectSocket]
  );

  return {
    socket: socketRef.current,
    initializeSocket,
    disconnectSocket,
  };
};
