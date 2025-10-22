import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    const tenantId = client.handshake.query.tenantId as string;
    
    if (userId && tenantId) {
      const key = `${tenantId}:${userId}`;
      if (!this.userSockets.has(key)) {
        this.userSockets.set(key, new Set());
      }
      this.userSockets.get(key)!.add(client.id);
      client.join(`tenant:${tenantId}`);
      console.log(`Client connected: ${client.id} (User: ${userId}, Tenant: ${tenantId})`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    const tenantId = client.handshake.query.tenantId as string;
    
    if (userId && tenantId) {
      const key = `${tenantId}:${userId}`;
      this.userSockets.get(key)?.delete(client.id);
      if (this.userSockets.get(key)?.size === 0) {
        this.userSockets.delete(key);
      }
    }
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(@ConnectedSocket() client: Socket, @MessageBody() data: { channel: string }) {
    client.join(data.channel);
    return { event: 'subscribed', data: { channel: data.channel } };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(@ConnectedSocket() client: Socket, @MessageBody() data: { channel: string }) {
    client.leave(data.channel);
    return { event: 'unsubscribed', data: { channel: data.channel } };
  }

  // Emit to specific tenant
  emitToTenant(tenantId: string, event: string, data: any) {
    this.server.to(`tenant:${tenantId}`).emit(event, data);
  }

  // Emit to specific user
  emitToUser(tenantId: string, userId: string, event: string, data: any) {
    const key = `${tenantId}:${userId}`;
    const sockets = this.userSockets.get(key);
    if (sockets) {
      sockets.forEach(socketId => {
        this.server.to(socketId).emit(event, data);
      });
    }
  }

  // Emit notification
  emitNotification(tenantId: string, userId: string, notification: any) {
    this.emitToUser(tenantId, userId, 'notification', notification);
  }

  // Emit data update
  emitDataUpdate(tenantId: string, entity: string, action: string, data: any) {
    this.emitToTenant(tenantId, 'data:update', { entity, action, data });
  }

  // Field locking
  @SubscribeMessage('lock:field')
  handleLockField(@ConnectedSocket() client: Socket, @MessageBody() data: { entity: string; id: string; field: string }) {
    const userId = client.handshake.query.userId as string;
    const tenantId = client.handshake.query.tenantId as string;
    
    this.server.to(`tenant:${tenantId}`).emit('field:locked', {
      ...data,
      userId,
      socketId: client.id
    });
  }

  @SubscribeMessage('unlock:field')
  handleUnlockField(@ConnectedSocket() client: Socket, @MessageBody() data: { entity: string; id: string; field: string }) {
    const tenantId = client.handshake.query.tenantId as string;
    
    this.server.to(`tenant:${tenantId}`).emit('field:unlocked', data);
  }
}