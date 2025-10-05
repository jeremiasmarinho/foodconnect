import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSockets = new Map<string, string[]>(); // userId -> socketIds[]

  handleConnection(client: AuthenticatedSocket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    if (client.userId) {
      this.removeUserSocket(client.userId, client.id);
    }
  }

  @SubscribeMessage('authenticate')
  @UseGuards(JwtAuthGuard)
  handleAuthentication(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    client.userId = data.userId;
    this.addUserSocket(data.userId, client.id);

    this.logger.log(`User ${data.userId} authenticated on socket ${client.id}`);

    client.emit('authenticated', {
      message: 'Successfully authenticated',
      userId: data.userId,
    });
  }

  @SubscribeMessage('join-restaurant')
  handleJoinRestaurant(
    @MessageBody() data: { restaurantId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    client.join(`restaurant-${data.restaurantId}`);
    this.logger.log(
      `Socket ${client.id} joined restaurant ${data.restaurantId}`,
    );

    client.emit('joined-restaurant', {
      restaurantId: data.restaurantId,
      message: 'Joined restaurant notifications',
    });
  }

  @SubscribeMessage('leave-restaurant')
  handleLeaveRestaurant(
    @MessageBody() data: { restaurantId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    client.leave(`restaurant-${data.restaurantId}`);
    this.logger.log(`Socket ${client.id} left restaurant ${data.restaurantId}`);
  }

  @SubscribeMessage('join-post')
  handleJoinPost(
    @MessageBody() data: { postId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    client.join(`post-${data.postId}`);
    this.logger.log(`Socket ${client.id} joined post ${data.postId}`);
  }

  @SubscribeMessage('leave-post')
  handleLeavePost(
    @MessageBody() data: { postId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    client.leave(`post-${data.postId}`);
    this.logger.log(`Socket ${client.id} left post ${data.postId}`);
  }

  // Notification emission methods

  /**
   * Send notification to specific user
   */
  async notifyUser(userId: string, event: string, data: any) {
    const socketIds = this.userSockets.get(userId);
    if (socketIds && socketIds.length > 0) {
      socketIds.forEach((socketId) => {
        this.server.to(socketId).emit(event, data);
      });

      this.logger.log(`Notification sent to user ${userId}:`, { event, data });
    }
  }

  /**
   * Send notification about new like on post
   */
  async notifyNewLike(postId: string, postOwnerId: string, likerData: any) {
    // Notify post owner
    await this.notifyUser(postOwnerId, 'new-like', {
      type: 'like',
      postId,
      liker: likerData,
      message: `${likerData.name || likerData.username} liked your post`,
      timestamp: new Date(),
    });

    // Notify users watching this post
    this.server.to(`post-${postId}`).emit('post-liked', {
      postId,
      liker: likerData,
      timestamp: new Date(),
    });
  }

  /**
   * Send notification about new comment on post
   */
  async notifyNewComment(
    postId: string,
    postOwnerId: string,
    commenterData: any,
    commentContent: string,
  ) {
    // Notify post owner
    await this.notifyUser(postOwnerId, 'new-comment', {
      type: 'comment',
      postId,
      commenter: commenterData,
      content: commentContent,
      message: `${commenterData.name || commenterData.username} commented on your post`,
      timestamp: new Date(),
    });

    // Notify users watching this post
    this.server.to(`post-${postId}`).emit('post-commented', {
      postId,
      commenter: commenterData,
      content: commentContent,
      timestamp: new Date(),
    });
  }

  /**
   * Send notification about new order
   */
  async notifyNewOrder(restaurantId: string, orderData: any) {
    this.server.to(`restaurant-${restaurantId}`).emit('new-order', {
      type: 'order',
      restaurantId,
      order: orderData,
      message: 'New order received',
      timestamp: new Date(),
    });
  }

  /**
   * Send notification about order status update
   */
  async notifyOrderStatusUpdate(
    userId: string,
    orderId: string,
    status: string,
    restaurantName: string,
  ) {
    await this.notifyUser(userId, 'order-status-update', {
      type: 'order-status',
      orderId,
      status,
      restaurantName,
      message: `Your order from ${restaurantName} is now ${status}`,
      timestamp: new Date(),
    });
  }

  /**
   * Send notification about new post from followed restaurant
   */
  async notifyNewPost(followersIds: string[], postData: any) {
    const notification = {
      type: 'new-post',
      post: postData,
      message: `${postData.restaurant.name} shared a new post`,
      timestamp: new Date(),
    };

    // Send to all followers
    for (const followerId of followersIds) {
      await this.notifyUser(followerId, 'new-post', notification);
    }
  }

  // Helper methods

  private addUserSocket(userId: string, socketId: string) {
    const existingSockets = this.userSockets.get(userId) || [];
    existingSockets.push(socketId);
    this.userSockets.set(userId, existingSockets);
  }

  private removeUserSocket(userId: string, socketId: string) {
    const existingSockets = this.userSockets.get(userId) || [];
    const filteredSockets = existingSockets.filter((id) => id !== socketId);

    if (filteredSockets.length === 0) {
      this.userSockets.delete(userId);
    } else {
      this.userSockets.set(userId, filteredSockets);
    }
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  /**
   * Get all connected socket IDs for a user
   */
  getUserSockets(userId: string): string[] {
    return this.userSockets.get(userId) || [];
  }
}
