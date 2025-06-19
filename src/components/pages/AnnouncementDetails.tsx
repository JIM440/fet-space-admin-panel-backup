import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCommentSocket, useCreateComment, useGetComments } from '../../hooks/useComments';
import { useCreatePoll, useGetAnnouncementDetails, useGetPollResponses, useRespondToPoll, useUpdateAnnouncement, useDeleteAnnouncement } from '../../hooks/useAnnouncements';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { MoreVertical } from 'lucide-react';

const AnnouncementDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const announcementId = parseInt(id || '0');
  const { data: announcement, isLoading, error } = useGetAnnouncementDetails(announcementId);
  const { data: comments, isLoading: commentsLoading } = useGetComments(
    'generalAnnouncement',
    announcementId
  );
  const { mutate: addComment } = useCreateComment();
  const [newComment, setNewComment] = useState('');
  useCommentSocket(announcementId);

  // Poll-related state and hooks
  const { mutate: createPoll } = useCreatePoll();
  const { mutate: respondToPoll } = useRespondToPoll();
  const { data: pollResponses } = useGetPollResponses(announcement?.poll?.poll_id || 0);
  const [pollForm, setPollForm] = useState({ allowMultipleAnswers: false });
  const { mutate: updateAnnouncement } = useUpdateAnnouncement();
  const { mutate: deleteAnnouncement } = useDeleteAnnouncement();
  const queryClient = useQueryClient();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    if (announcement) {
      setEditTitle(announcement.title || '');
      setEditContent(announcement.content || '');
    }
  }, [announcement]);

  if (isLoading) return <p className="text-white p-4">Loading...</p>;
  if (error) return <p className="text-red-500 p-4">{error.message}</p>;
  if (!announcement) return <p className="text-white p-4">Announcement not found.</p>;

  const handleAddComment = () => {
    if (newComment.trim() === '') return;
    addComment(
      {
        type: 'generalAnnouncement',
        targetId: announcementId,
        content: newComment,
      },
      {
        onSuccess: () => setNewComment(''),
      }
    );
  };

  const handleCreatePoll = () => {
    createPoll({
      announcementId,
      type: 'general',
      allowMultipleAnswers: pollForm.allowMultipleAnswers,
    });
  };

  const handlePollResponse = (optionId: number) => {
    if (announcement.poll?.poll_id) {
      respondToPoll(
        { pollId: announcement.poll.poll_id, optionId },
        {
          onSuccess: (response) => {
            queryClient.invalidateQueries(['pollResponses', announcement.poll.poll_id]);
            api.get(`/polls/${announcement.poll.poll_id}/responses`).then((res) => {
              queryClient.setQueryData(['pollResponses', announcement.poll.poll_id], res.data);
            });
          },
        }
      );
    }
  };

  const handleEdit = () => {
    setEditModalOpen(true);
  };

  const handleUpdate = () => {
    updateAnnouncement(
      { announcementId, data: { title: editTitle, content: editContent } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['announcements']);
          queryClient.invalidateQueries(['announcement', announcementId]);
          setEditModalOpen(false);
        },
      }
    );
  };

  const handleDelete = () => {
    deleteAnnouncement(announcementId, {
      onSuccess: () => {
        queryClient.invalidateQueries(['announcements']);
        navigate('/announcements');
      },
    });
  };

  // Assume user role and ID are available (e.g., from auth context)
  const isAdminOrSuperAdmin = true; // Replace with actual role check
  const currentUserId = 1; // Replace with actual user ID from auth

  // Calculate vote counts for each option
  const voteCounts = announcement.poll?.options?.reduce((acc, option) => {
    acc[option.option_id] = pollResponses?.filter((r) => r.poll_option_id === option.option_id).length || 0;
    return acc;
  }, {} as { [key: number]: number });

  const totalVotes = announcement.poll?.options?.reduce((sum, option) => sum + (voteCounts?.[option.option_id] || 0), 0) || 0;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-400 hover:underline"
        >
          ← Back to announcements
        </button>
        {(isAdminOrSuperAdmin || announcement.admin.user_id === currentUserId) && (
          <div className="relative">
            <MoreVertical
              size={20}
              className="text-gray-400 cursor-pointer hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                setEditModalOpen(false); // Close edit modal if open
                setDeleteConfirmOpen(false); // Close delete modal if open
              }}
            />
            {editModalOpen || deleteConfirmOpen ? null : (
              <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg z-10">
                {!announcement.is_poll && (
                  <button
                    onClick={handleEdit}
                    className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-600 rounded-t-md"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => setDeleteConfirmOpen(true)}
                  className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-600 rounded-b-md"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">{announcement.title}</h1>
      <p className="text-gray-400 mb-4">
        By {announcement.admin.user.name} on{' '}
        {new Date(announcement.created_at).toLocaleDateString()}
      </p>
      {/* Display assignment details */}
      <div className="text-gray-300 mb-6">
        <h2 className="text-xl font-semibold mb-2">Assignment Details</h2>
        <p>{announcement.content || 'No details provided.'}</p>
      </div>
      {announcement.attachments?.length > 0 && (
        <p className="text-blue-400 mb-6">{announcement.attachments.length} attachments</p>
      )}

      {/* Poll Section */}
      {announcement.is_poll && announcement.poll && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Poll: {announcement.poll.type}</h2>
          {announcement.poll.options?.map((option) => {
            const votes = voteCounts?.[option.option_id] || 0;
            const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
            const hasVoted = pollResponses?.some((r) => r.user_id === currentUserId && r.poll_option_id === option.option_id);
            return (
              <div key={option.option_id} className="mb-2">
                <label className="flex items-center space-x-2 text-gray-300">
                  {announcement.poll.allow_multiple_answers ? (
                    <input
                      type="checkbox"
                      checked={hasVoted}
                      onChange={() => handlePollResponse(option.option_id)}
                      className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                  ) : (
                    <input
                      type="radio"
                      name="pollOption"
                      checked={hasVoted}
                      onChange={() => handlePollResponse(option.option_id)}
                      className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                  )}
                  <span>{option.content}</span>
                </label>
                <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-400">{votes} votes</span>
              </div>
            );
          })}
          {isAdminOrSuperAdmin && pollResponses && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-white">Responses</h3>
              {pollResponses.map((response) => (
                <p key={response.response_id} className="text-gray-300">
                  {response.user.name} responded at{' '}
                  {new Date(response.responded_at).toLocaleString()}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Poll Creation (Admin/SuperAdmin only) */}
      {!announcement.is_poll && isAdminOrSuperAdmin && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Create Poll</h2>
          <label className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              checked={pollForm.allowMultipleAnswers}
              onChange={(e) =>
                setPollForm({ ...pollForm, allowMultipleAnswers: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <span className="text-white">Allow multiple answers</span>
          </label>
          <button
            onClick={handleCreatePoll}
            className="bg-blue-500 px-4 py-2 rounded text-white hover:bg-blue-700"
            disabled={isLoading}
          >
            Create Poll
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
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
              placeholder="Assignment Details"
              rows={4}
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-500 rounded text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96 text-center">
            <p className="text-white mb-4">Are you sure you want to delete this announcement?</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 rounded text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">
          Comments ({announcement._count?.comments || 0})
        </h2>
        {commentsLoading && <p className="text-gray-400 mb-4">Loading comments...</p>}
        {!comments?.length && (
          <p className="text-gray-400 mb-4">No comments yet. Be the first to comment!</p>
        )}
        <ul className="space-y-4 mb-4">
          {comments?.map((c) => (
            <li key={c.comment_id} className="bg-gray-700 p-3 rounded">
              <p className="text-white font-semibold">{c.user.name}</p>
              <p className="text-gray-300">{c.content}</p>
            </li>
          ))}
        </ul>
        <div className="flex space-x-3">
          <input
            type="text"
            placeholder="Add a comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddComment}
            className="bg-blue-500 px-4 py-2 rounded text-white hover:bg-blue-700"
            disabled={!newComment.trim() || isLoading}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementDetails;