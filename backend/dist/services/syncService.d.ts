import { Server as HttpServer } from 'http';
export interface SyncEvent {
    type: 'create' | 'update' | 'delete';
    resource: 'patient' | 'appointment' | 'anamnese' | 'record';
    data: any;
    userId: string;
    timestamp: string;
}
declare class SyncService {
    private io;
    private connectedUsers;
    initialize(server: HttpServer): void;
    broadcastToAll(event: SyncEvent): void;
    broadcastToUsers(userIds: string[], event: SyncEvent): void;
    broadcastToRoom(room: string, event: SyncEvent): void;
    notifyDataChange(resource: SyncEvent['resource'], type: SyncEvent['type'], data: any, userId: string, targetUsers?: string[]): void;
    getConnectedUsers(): string[];
    isUserConnected(userId: string): boolean;
}
export declare const syncService: SyncService;
export default syncService;
//# sourceMappingURL=syncService.d.ts.map