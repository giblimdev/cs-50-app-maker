// types/comment.ts
import { Comment } from "@/lib/generated/prisma/client";

export type CommentWithRelations = Comment & {
  author?: {
    id: string;
    name: string | null;
    email: string | null;
    image?: string | null;
  } | null;
  project?: {
    id: string;
    name: string;
  } | null;
  parentComment?: {
    id: string;
    title: string;
    author?: {
      name: string | null;
      email: string | null;
    };
  } | null;
  childComments?: CommentWithRelations[];
  _count?: {
    childComments: number;
  };
};
