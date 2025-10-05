import { Injectable, Logger } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { PrismaService } from '../prisma/prisma.service';

export interface NotificationData {
  userId: string;
  type: 'like' | 'comment' | 'order' | 'order-status' | 'new-post' | 'follow';
  title: string;
  message: string;
  data?: any;
  read?: boolean;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  /**
   * Send notification for new like on post
   */
  async notifyPostLike(postId: string, likerId: string) {
    this.logger.log('Sending post like notification', { postId, likerId });

    try {
      // Get post data with owner info
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
        include: {
          user: {
            select: { id: true, username: true, name: true },
          },
        },
      });

      if (!post || post.userId === likerId) {
        return; // Don't notify if post doesn't exist or user liked their own post
      }

      // Get liker data
      const liker = await this.prisma.user.findUnique({
        where: { id: likerId },
        select: { id: true, username: true, name: true, avatar: true },
      });

      if (!liker) return;

      // Send real-time notification
      await this.notificationsGateway.notifyNewLike(postId, post.userId, liker);

      // Store notification in database for persistence
      await this.createNotification({
        userId: post.userId,
        type: 'like',
        title: 'New Like',
        message: `${liker.name || liker.username} liked your post`,
        data: {
          postId,
          likerId: liker.id,
          liker: {
            id: liker.id,
            username: liker.username,
            name: liker.name,
            avatar: liker.avatar,
          },
        },
      });

      this.logger.log('Post like notification sent successfully');
    } catch (error) {
      this.logger.error('Failed to send post like notification', error);
    }
  }

  /**
   * Send notification for new comment on post
   */
  async notifyPostComment(
    postId: string,
    commenterId: string,
    commentContent: string,
  ) {
    this.logger.log('Sending post comment notification', {
      postId,
      commenterId,
    });

    try {
      // Get post data with owner info
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
        include: {
          user: {
            select: { id: true, username: true, name: true },
          },
        },
      });

      if (!post || post.userId === commenterId) {
        return; // Don't notify if post doesn't exist or user commented on their own post
      }

      // Get commenter data
      const commenter = await this.prisma.user.findUnique({
        where: { id: commenterId },
        select: { id: true, username: true, name: true, avatar: true },
      });

      if (!commenter) return;

      // Send real-time notification
      await this.notificationsGateway.notifyNewComment(
        postId,
        post.userId,
        commenter,
        commentContent,
      );

      // Store notification in database
      await this.createNotification({
        userId: post.userId,
        type: 'comment',
        title: 'New Comment',
        message: `${commenter.name || commenter.username} commented on your post`,
        data: {
          postId,
          commenterId: commenter.id,
          commenter: {
            id: commenter.id,
            username: commenter.username,
            name: commenter.name,
            avatar: commenter.avatar,
          },
          commentContent,
        },
      });

      this.logger.log('Post comment notification sent successfully');
    } catch (error) {
      this.logger.error('Failed to send post comment notification', error);
    }
  }

  /**
   * Send notification for new order
   */
  async notifyNewOrder(orderId: string) {
    this.logger.log('Sending new order notification', { orderId });

    try {
      // Get order data with restaurant info
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          restaurant: {
            select: { id: true, name: true },
          },
          user: {
            select: { id: true, username: true, name: true },
          },
        },
      });

      if (!order) return;

      // Send real-time notification to restaurant
      await this.notificationsGateway.notifyNewOrder(order.restaurantId, {
        id: order.id,
        customerName: order.user.name || order.user.username,
        total: order.total,
        status: order.status,
      });

      this.logger.log('New order notification sent successfully');
    } catch (error) {
      this.logger.error('Failed to send new order notification', error);
    }
  }

  /**
   * Send notification for order status update
   */
  async notifyOrderStatusUpdate(orderId: string, newStatus: string) {
    this.logger.log('Sending order status update notification', {
      orderId,
      newStatus,
    });

    try {
      // Get order data
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          restaurant: {
            select: { name: true },
          },
        },
      });

      if (!order) return;

      // Send real-time notification to customer
      await this.notificationsGateway.notifyOrderStatusUpdate(
        order.userId,
        orderId,
        newStatus,
        order.restaurant.name,
      );

      // Store notification in database
      await this.createNotification({
        userId: order.userId,
        type: 'order-status',
        title: 'Order Update',
        message: `Your order from ${order.restaurant.name} is now ${newStatus}`,
        data: {
          orderId,
          status: newStatus,
          restaurantName: order.restaurant.name,
        },
      });

      this.logger.log('Order status update notification sent successfully');
    } catch (error) {
      this.logger.error(
        'Failed to send order status update notification',
        error,
      );
    }
  }

  /**
   * Create and store notification in database
   */
  private async createNotification(notificationData: NotificationData) {
    try {
      await this.prisma.notification.create({
        data: {
          userId: notificationData.userId,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          data: notificationData.data || {},
          read: false,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create notification in database', error);
    }
  }

  /**
   * Get user notifications with pagination
   */
  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return {
      notifications,
      total,
      page,
      limit,
      hasMore: skip + notifications.length < total,
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    await this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  }
}
