import React, { useState, useEffect, useMemo } from 'react';
import { MessageCircle, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAnnouncementSocket, useGetAnnouncements, useRespondToPoll, useUpdateAnnouncement, useDeleteAnnouncement } from '../../hooks/useAnnouncements';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';

const Announcements: React.FC = () => {
  useAnnouncementSocket();
  const { data: announcements, isLoading, error } = useGetAnnouncements();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: respondToPoll } = useRespondToPoll();
  const { mutate: updateAnnouncement } = useUpdateAnnouncement();
  const { mutate: deleteAnnouncement } = useDeleteAnnouncement();

  // State to store poll responses
  const [pollResponses, setPollResponses] = useState<{ [key: number]: any[] }>({});
  const [editModalOpen, setEditModalOpen] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // Fetch poll responses for all poll IDs
  const pollIds = useMemo(() => 
    announcements?.filter((a) => a.is_poll && a.poll?.poll_id).map((a) => a.poll.poll_id) || [], 
    [announcements]
  );

  useEffect(() => {
    const fetchPollResponses = async () => {
      const responses = await Promise.all(
        pollIds.map(async (pollId) => {
          const response = await api.get(`/polls/${pollId}/responses`);
          return { pollId, data: response.data };
        })
      );
      const responsesMap = responses.reduce((acc, { pollId, data }) => {
        acc[pollId] = data;
        return acc;
      }, {} as { [key: number]: any[] });
      setPollResponses(responsesMap);
    };
    if (pollIds.length > 0) fetchPollResponses();
  }, [pollIds]);

  if (isLoading) return <p className="text-white">Loading...</p>;
  if (error) return <p className="text-red-500">{error.message}</p>;
  if (!announcements?.length) return <p className="text-white">No announcements found.</p>;

  const handlePollResponse = (announcementId: number, optionId: number, pollId: number) => {
    respondToPoll(
      { pollId, optionId },
      {
        onSuccess: (response) => {
          queryClient.invalidateQueries(['pollResponses', pollId]);
          queryClient.invalidateQueries(['announcements']);
          api.get(`/polls/${pollId}/responses`).then((res) => {
            setPollResponses((prev) => ({ ...prev, [pollId]: res.data }));
          });
        },
      }
    );
  };

  const handleEdit = (announcementId: number, title: string, content: string) => {
    setEditModalOpen(announcementId);
    setEditTitle(title);
    setEditContent(content);
  };

  const handleUpdate = (announcementId: number) => {
    updateAnnouncement(
      { announcementId, data: { title: editTitle, content: editContent } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['announcements']);
          setEditModalOpen(null);
        },
      }
    );
  };

  const handleDelete = (announcementId: number) => {
    deleteAnnouncement(announcementId, {
      onSuccess: () => {
        queryClient.invalidateQueries(['announcements']);
        setDeleteConfirmOpen(null);
      },
    });
  };

  // Assume user ID and role are available (e.g., from auth context)
  const currentUserId = 1; // Replace with actual user ID from auth
  const isAdminOrSuperAdmin = true; // Replace with actual role check

  return (
    <div className="space-y-6">
      {announcements.map((announcement) => {
        const pollResponsesForPoll = announcement.poll?.poll_id ? pollResponses[announcement.poll.poll_id] || [] : [];
        const voteCounts = announcement.poll?.options?.reduce((acc, option) => {
          acc[option.option_id] = pollResponsesForPoll.filter((r) => r.poll_option_id === option.option_id).length || 0;
          return acc;
        }, {} as { [key: number]: number });
        const totalVotes = announcement.poll?.options?.reduce((sum, option) => sum + (voteCounts?.[option.option_id] || 0), 0) || 0;

        return (
          <div
            key={announcement.announcement_id}
            className={`bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-700 ${
              announcement.is_poll ? 'border-l-4 border-yellow-500' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {announcement.admin.user.name.split(' ').map((n) => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">{announcement.admin.user.name}</p>
                  <p className="text-gray-400 text-sm">
                    {new Date(announcement.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {(isAdminOrSuperAdmin || announcement.admin.user_id === currentUserId) && (
                <div className="flex space-x-2">
                  {!announcement.is_poll && (
                    <button
                      onClick={() => handleEdit(announcement.announcement_id, announcement.title, announcement.content)}
                      className="text-blue-400 hover:underline"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteConfirmOpen(announcement.announcement_id)}
                    className="text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">{announcement.title}</h3>
            <p className="text-gray-300 mb-4 line-clamp-2">{announcement.content}</p>
            {announcement.is_poll && announcement.poll && (
              <div className="mb-4">
                <p className="text-yellow-400 text-sm mb-2">📊 Poll: {announcement.poll.type}</p>
                {announcement.poll.options?.map((option) => {
                  const votes = voteCounts?.[option.option_id] || 0;
                  const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                  const hasVoted = pollResponsesForPoll.some((r) => r.user_id === currentUserId && r.poll_option_id === option.option_id);
                  return (
                    <div key={option.option_id} className="mb-2">
                      <label className="flex items-center space-x-2 text-gray-300">
                        {announcement.poll.allow_multiple_answers ? (
                          <input
                            type="checkbox"
                            checked={hasVoted}
                            onChange={() => handlePollResponse(announcement.announcement_id, option.option_id, announcement.poll.poll_id)}
                            className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                          />
                        ) : (
                          <input
                            type="radio"
                            name={`pollOption-${announcement.announcement_id}`} // Unique name per announcement
                            checked={hasVoted}
                            onChange={() => handlePollResponse(announcement.announcement_id, option.option_id, announcement.poll.poll_id)}
                            className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                          />
                        )}
                        <span>{option.content}</span>
                      </label>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-400">{votes} votes</span>
                    </div>
                  );
                })}
              </div>
            )}
            {announcement.attachments?.length > 0 && (
              <p className="text-blue-400 text-sm mb-4">{announcement.attachments.length} attachments</p>
            )}
            <div className="flex items-center justify-between text-gray-400">
              <div className="flex items-center space-x-2">
                <MessageCircle size={16} />
                <span>{announcement._count?.comments || 0} comments</span>
              </div>
              <div
                className="flex items-center space-x-1 text-blue-400 cursor-pointer"
                onClick={() => navigate(`/announcements/${announcement.announcement_id}`)}
              >
                <Eye size={16} />
                <span>View Details</span>
              </div>
            </div>

            {/* Edit Modal */}
            {editModalOpen === announcement.announcement_id && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-gray-800 p-6 rounded-lg w-96">
                  <h2 className="text-xl font-semibold text-white mb-4">Edit Announcement</h2>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 mb-4 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Title"
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 mb-4 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Content"
                    rows={4}
                  />
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setEditModalOpen(null)}
                      className="px-4 py-2 text-gray-300 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdate(announcement.announcement_id)}
                      className="px-4 py-2 bg-blue-500 rounded text-white hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmOpen === announcement.announcement_id && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-gray-800 p-6 rounded-lg w-96 text-center">
                  <p className="text-white mb-4">Are you sure you want to delete this announcement?</p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => setDeleteConfirmOpen(null)}
                      className="px-4 py-2 text-gray-300 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.announcement_id)}
                      className="px-4 py-2 bg-red-500 rounded text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Announcements;