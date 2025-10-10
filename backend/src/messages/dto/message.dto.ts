export interface CreateMessageDto {
  receiverId: string;
  content: string;
  imageUrl?: string;
}

export interface MessageResponse {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  imageUrl?: string;
  isRead: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  readAt?: Date;
  sender: {
    id: string;
    username: string;
    name: string;
    avatar?: string;
  };
}

export interface ConversationResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  participants: {
    id: string;
    username: string;
    name: string;
    avatar?: string;
  }[];
  lastMessage?: MessageResponse;
  unreadCount: number;
}

export interface ConversationDetailResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  participants: {
    id: string;
    username: string;
    name: string;
    avatar?: string;
  }[];
  messages: MessageResponse[];
}
