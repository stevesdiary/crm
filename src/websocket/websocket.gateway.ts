import {
  WebSocketGateway as WSGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

@Injectable()
@WSGateway({
  cors: { origin: '*' },
  namespace: '/ws',
})
export class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private connectedClients = new Map<string, { socket: Socket; tenantId: string; userId: string }>();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const payload = this.jwtService.verify(token);
      
      this.connectedClients.set(client.id, {
        socket: client,
        tenantId: payload.tenantId,
        userId: payload.sub,
      });

      client.join(`tenant:${payload.tenantId}`);
      client.join(`user:${payload.sub}`);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(@MessageBody() data: { room: string }, @ConnectedSocket() client: Socket) {
    const clientData = this.connectedClients.get(client.id);
    if (clientData) {
      client.join(`${clientData.tenantId}:${data.room}`);
    }
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(@MessageBody() data: { room: string }, @ConnectedSocket() client: Socket) {
    const clientData = this.connectedClients.get(client.id);
    if (clientData) {
      client.leave(`${clientData.tenantId}:${data.room}`);
    }
  }

  sendNotification(tenantId: string, userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  sendTenantNotification(tenantId: string, notification: any) {
    this.server.to(`tenant:${tenantId}`).emit('notification', notification);
  }

  sendUpdate(tenantId: string, room: string, update: any) {
    this.server.to(`${tenantId}:${room}`).emit('update', update);
  }

  @SubscribeMessage('edit-start')
  handleEditStart(@MessageBody() data: { recordId: string; field: string }, @ConnectedSocket() client: Socket) {
    const clientData = this.connectedClients.get(client.id);
    if (clientData) {
      client.to(`${clientData.tenantId}:record:${data.recordId}`).emit('edit-lock', {
        field: data.field,
        userId: clientData.userId,
      });
    }
  }

  @SubscribeMessage('edit-change')
  handleEditChange(@MessageBody() data: { recordId: string; field: string; value: any }, @ConnectedSocket() client: Socket) {
    const clientData = this.connectedClients.get(client.id);
    if (clientData) {
      client.to(`${clientData.tenantId}:record:${data.recordId}`).emit('edit-change', {
        field: data.field,
        value: data.value,
        userId: clientData.userId,
      });
    }
  }

  @SubscribeMessage('edit-end')
  handleEditEnd(@MessageBody() data: { recordId: string; field: string }, @ConnectedSocket() client: Socket) {
    const clientData = this.connectedClients.get(client.id);
    if (clientData) {
      client.to(`${clientData.tenantId}:record:${data.recordId}`).emit('edit-unlock', {
        field: data.field,
        userId: clientData.userId,
      });
    }
  }
}