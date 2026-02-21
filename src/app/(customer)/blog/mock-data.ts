export type Reaction = {
  like: number;
  love: number;
  wow: number;
};

export type Comment = {
  id: number;
  author: string;
  content: string;
  createdAt: string;
};

export const MOCK_REACTIONS: Record<number, Reaction> = {
  1: { like: 12, love: 5, wow: 2 },
  2: { like: 5, love: 2, wow: 1 },
};

export const MOCK_COMMENTS: Record<number, Comment[]> = {
  1: [
    {
      id: 1,
      author: "Lan",
      content: "Bài viết rất hữu ích!",
      createdAt: "2026-02-16",
    },
  ],
  2: [],
  3: [],
};
