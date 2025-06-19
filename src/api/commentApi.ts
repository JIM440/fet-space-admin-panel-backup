import api from './axios';

interface Comment {
  comment_id: number;
  content: string;
  user: { name: string; role: string };
  created_at: string;
}

interface CreateCommentData {
  type: 'assignment' | 'generalAnnouncement' | 'courseAnnouncement';
  targetId: number;
  content: string;
}

export const createComment = async (data: CreateCommentData): Promise<Comment> => {
  const response = await api.post('/comments', data);
  return response.data;
};

export const getComments = async (
  type: 'assignment' | 'generalAnnouncement' | 'courseAnnouncement',
  targetId: number,
  page: number = 1,
  limit: number = 10
): Promise<Comment[]> => {
  const response = await api.get('/comments', {
    params: { type, targetId, page, limit },
  });
  return response.data;
};