import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createComment, getComments } from '../api/commentApi';
import { io, Socket } from 'socket.io-client';
import { useEffect } from 'react';

const socket: Socket = io('http://localhost:8989');

export const useGetComments = (
  type: 'assignment' | 'generalAnnouncement' | 'courseAnnouncement',
  targetId: number,
  page: number = 1,
  limit: number = 10
) => {
  return useQuery({
    queryKey: ['comments', type, targetId, page, limit],
    queryFn: () => getComments(type, targetId, page, limit),
    enabled: !!targetId,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createComment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
};

export const useCommentSocket = (targetId: number) => {
  const queryClient = useQueryClient();
  useEffect(() => {
    const room = `generalAnnouncement_${targetId}`;
    socket.emit('join', room);
    socket.on('newComment', (comment) => {
      queryClient.setQueryData(['comments', 'generalAnnouncement', targetId], (oldData: any) => {
        return oldData ? [...oldData, comment] : [comment];
      });
    });
    return () => {
      socket.off('newComment');
    };
  }, [queryClient, targetId]);
};