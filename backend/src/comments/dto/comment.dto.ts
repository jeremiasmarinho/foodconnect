import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty({ message: 'Content is required' })
  @IsString({ message: 'Content must be a string' })
  @MaxLength(500, { message: 'Content must not exceed 500 characters' })
  content: string;
}

export class CommentResponseDto {
  id: string;
  content: string;
  createdAt: Date;
  userId: string;
  postId: string;
  user: {
    id: string;
    username: string;
    name: string;
    avatar: string | null;
  };
}
