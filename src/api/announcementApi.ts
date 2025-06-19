import api from './axios';

interface Announcement {
  announcement_id: number;
  title: string;
  content: string;
  created_at: string;
  admin: { user_id: number; user: { name: string; email: string; role: string } };
  poll?: any;
  attachments?: any[];
  _count?: { comments: number };
}

interface CreateAnnouncementData {
  title: string;
  content: string;
}

interface CreatePollData {
  announcementId: number;
  type: 'general' | 'course';
  allowMultipleAnswers: boolean;
}

interface PollResponseData {
  pollId: number;
  optionId: number;
}

export const getAnnouncements = async (
  page: number = 1,
  limit: number = 10
): Promise<Announcement[] | null> => {
  const response = await api.get('/announcements/general', {
    params: { page, limit },
  });
  return response.data;
};

export const getAnnouncementDetails = async (
  announcementId: number
): Promise<Announcement | null> => {
  const response = await api.get(`/announcements/general/${announcementId}`);
  return response.data;
};

export const createAnnouncement = async (
  data: CreateAnnouncementData
): Promise<Announcement> => {
  const response = await api.post('/announcements/general', data);
  return response.data;
};

export const updateAnnouncement = async (
  announcementId: number,
  data: Partial<CreateAnnouncementData>
): Promise<Announcement> => {
  const response = await api.put(`/announcements/general/${announcementId}`, data);
  return response.data;
};

export const deleteAnnouncement = async (announcementId: number): Promise<{ message: string }> => {
  const response = await api.delete(`/announcements/general/${announcementId}`);
  return response.data;
};

export const createPoll = async (data: CreatePollData): Promise<any> => {
  const response = await api.post('/polls', data);
  return response.data;
};

export const respondToPoll = async (data: PollResponseData): Promise<any> => {
  const response = await api.post('/polls/respond', data);
  return response.data;
};

export const getPollResponses = async (pollId: number): Promise<any[]> => {
  const response = await api.get(`/polls/${pollId}/responses`);
  return response.data;
};