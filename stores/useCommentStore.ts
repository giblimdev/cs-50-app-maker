// useCommentStore.ts
// Table : Comment

import { create } from "zustand";
import { Comment } from "@/lib/generated/prisma/client";

interface CommentState {
  comment: Comment | null;
  setComment: (comment: Comment | null) => void;
  clearComment: () => void;
}

export const useCommentStore = create<CommentState>((set) => ({
  comment: null,
  setComment: (comment) => set({ comment }),
  clearComment: () => set({ comment: null }),
}));
