import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAnnouncements,
  getAnnouncementDetails,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  createPoll,
  getPollResponses,
} from '../api/announcementApi';
import { io, Socket } from 'socket.io-client';
import { useEffect, useState } from 'react';
import api from '../api/axios';

const socket: Socket = io('http://localhost:8989');

export const useGetAnnouncements = () => {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: () => api.get('/announcements/general').then((res) => res.data),
  });
};

export const useGetAnnouncementDetails = (announcementId: number) => {
  return useQuery({
    queryKey: ['announcement', announcementId],
    queryFn: () => getAnnouncementDetails(announcementId),
    enabled: !!announcementId,
  });
};

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};

export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ announcementId, data }: { announcementId: number; data: any }) =>
      updateAnnouncement(announcementId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};

export const useCreatePoll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { announcementId: number; type: string; allowMultipleAnswers: boolean }) => {
      const response = await api.post('/polls', {
        announcementId: data.announcementId,
        type: data.type,
        allow_multiple_answers: data.allowMultipleAnswers,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};

export const useRespondToPoll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { pollId: number; optionId: number }) => {
      const response = await api.post('/polls/toggle-vote', {
        pollId: data.pollId,
        optionId: data.optionId,
      });
      return response.data;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['pollResponses', response.pollId] });
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};

export const useGetPollResponses = (pollId: number) => {
  return useQuery({
    queryKey: ['pollResponses', pollId],
    queryFn: () => api.get(`/polls/${pollId}/responses`).then((res) => res.data),
    enabled: !!pollId,
  });
};

export const useAnnouncementSocket = () => {
  const queryClient = useQueryClient();
  useEffect(() => {
    socket.emit('join', 'generalAnnouncements');
    socket.on('newAnnouncement', (announcement) => {
      queryClient.setQueryData(['announcements'], (oldData: any) => {
        return oldData ? [announcement, ...oldData] : [announcement];
      });
    });
    socket.on('updateAnnouncement', (announcement) => {
      queryClient.setQueryData(['announcement', announcement.announcement_id], announcement);
    });
    socket.on('deleteAnnouncement', ({ announcementId }) => {
      queryClient.setQueryData(['announcements'], (oldData: any) => {
        return oldData?.filter((a: any) => a.announcement_id !== announcementId);
      });
    });
    socket.on('newPoll', (poll) => {
      queryClient.setQueryData(['announcement', poll.general_announcement_id], (oldData: any) => ({
        ...oldData,
        poll,
      }));
    });
    socket.on('pollResponse', (response) => {
      queryClient.invalidateQueries({ queryKey: ['pollResponses', response.pollId] });
    });
    return () => {
      socket.off('newAnnouncement');
      socket.off('updateAnnouncement');
      socket.off('deleteAnnouncement');
      socket.off('newPoll');
      socket.off('pollResponse');
    };
  }, [queryClient]);
};