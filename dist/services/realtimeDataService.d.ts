import { Server as SocketIOServer } from 'socket.io';
export declare class RealtimeDataService {
    private io;
    private intervalId;
    constructor(io: SocketIOServer);
    startBroadcasting(): void;
    stopBroadcasting(): void;
    private getDashboardData;
    private getPaymentsData;
    private getOrdersData;
    private getSupportData;
    private getBasicDashboardData;
    private getBasicPaymentsData;
    private getBasicOrdersData;
    private getBasicSupportData;
    private broadcastRealData;
    emitToAll(event: string, data: any): void;
    emitToRoom(room: string, event: string, data: any): void;
}
//# sourceMappingURL=realtimeDataService.d.ts.map