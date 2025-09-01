import { Server as SocketIOServer } from 'socket.io';
export declare const setupSocketHandlers: (io: SocketIOServer) => void;
export declare const emitToUser: (io: SocketIOServer, userId: number, event: string, data: any) => void;
export declare const emitToTicket: (io: SocketIOServer, ticketId: number, event: string, data: any) => void;
//# sourceMappingURL=socketService.d.ts.map