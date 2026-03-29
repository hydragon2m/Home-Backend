import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import * as cookie from 'cookie';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const cookies = client.handshake.headers.cookie;
      let token = client.handshake.auth?.token;

      // Extract Auth Token từ HttpOnly Cookie access_token
      if (!token && cookies) {
        const parsedCookies = cookie.parse(cookies);
        token = parsedCookies['access_token'];
      }

      if (!token) {
        throw new Error('Unauthorized');
      }

      // Xác thực JWT Token
      const secret = this.configService.get<string>('JWT_SECRET') || 'defaultSecret';
      const payload = this.jwtService.verify(token, { secret });
      
      const userId = payload.sub;
      client.data.user = payload;

      // Tự động Add Client này vào 1 Room riêng mang tên UserId của họ
      // Điều này giúp dễ dàng bắn noti tới tất cả thiết bị (tab) mà user đó đang mở
      client.join(`user_${userId}`);
      
      this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
    } catch (error) {
      this.logger.error(`Connection denied: ${client.id} - ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.user?.sub;
    this.logger.log(`Client disconnected: ${client.id} (User: ${userId || 'Unknown'})`);
  }

  // --- Lắng nghe các sự kiện gửi lên từ Frontend ---
  
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket, @MessageBody() data: any): void {
    client.emit('pong', { message: 'Server đã nhận thông tin!', data });
  }
}
