import { Injectable } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Injectable()
export class EventsService {
  constructor(private readonly eventsGateway: EventsGateway) {}

  /**
   * Push Socket events (e.g. 'new_notification', 'new_message') tới Cụ thể 1 USER
   * Dù User đó có mở trên 3 thiết bị hay điện thoại, tất cả đều sẽ nhận được
   */
  emitToUser(userId: string, event: string, payload: any) {
    this.eventsGateway.server.to(`user_${userId}`).emit(event, payload);
  }

  /**
   * Broadcast gửi Event cho toàn bộ hệ thống
   */
  emitToAll(event: string, payload: any) {
    this.eventsGateway.server.emit(event, payload);
  }
}
