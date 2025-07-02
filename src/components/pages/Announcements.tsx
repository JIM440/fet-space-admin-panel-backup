import React, { useState, useEffect, useMemo, useRef } from "react";
import { Plus, MoreVertical, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  useAnnouncementSocket,
  useGetAnnouncements,
  useRespondToPoll,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
} from "../../hooks/useAnnouncements";
import { useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";
import FullScreenSpinner from "../commons/loader/FullScreenSpinner";
import ThemedText from "../commons/typography/ThemedText";
import AddCommentInput from "../commons/inputs/AddCommentInput";
import { getTimeAgo } from "@/utils/formatDate";
import { Button } from "../ui/button";
import { useAuth } from "@/context/AuthContext";

const Announcements: React.FC = () => {
  useAnnouncementSocket();
  const { data: announcements, isLoading, error } = useGetAnnouncements();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: respondToPoll } = useRespondToPoll();
  const { mutate: updateAnnouncement } = useUpdateAnnouncement();
  const { mutate: deleteAnnouncement } = useDeleteAnnouncement();

  // State to store poll responses
  const [pollResponses, setPollResponses] = useState<{ [key: number]: any[] }>(
    {}
  );
  const [editModalOpen, setEditModalOpen] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<number | null>(
    null
  );
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editAttachments, setEditAttachments] = useState<string[]>([]);
  const [newAttachment, setNewAttachment] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch poll responses for all poll IDs
  const pollIds = useMemo(
    () =>
      announcements
        ?.filter((a) => a.is_poll && a.poll?.poll_id)
        .map((a) => a.poll.poll_id) || [],
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) return <FullScreenSpinner />;
  if (error) return <p className="text-error">{error.message}</p>;
  if (!announcements?.length)
    return <ThemedText>No announcements found.</ThemedText>;

  const handlePollResponse = (
    announcementId: number,
    optionId: number,
    pollId: number
  ) => {
    respondToPoll(
      { pollId, optionId },
      {
        onSuccess: (response) => {
          queryClient.invalidateQueries({queryKey: ["pollResponses", pollId]});
          queryClient.invalidateQueries({queryKey: ["announcements"]});
          api.get(`/polls/${pollId}/responses`).then((res) => {
            setPollResponses((prev) => ({ ...prev, [pollId]: res.data }));
          });
        },
      }
    );
  };

  const handleEdit = (
    announcementId: number,
    title: string,
    content: string,
    attachments: { url: string; originalName: string }[]
  ) => {
    setEditModalOpen(announcementId);
    setEditTitle(title);
    setEditContent(content);
    setEditAttachments(attachments.map((a) => a.url));
    setDropdownOpen(null);
  };

  const handleUpdate = (announcementId: number) => {
    updateAnnouncement(
      {
        announcementId,
        data: {
          title: editTitle,
          content: editContent,
          attachments: editAttachments.map((url) => ({
            url,
            originalName: url.split("/").pop() || "attachment",
          })),
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ["announcements"]});
          setEditModalOpen(null);
          setEditAttachments([]);
          setNewAttachment("");
        },
      }
    );
  };

  const addAttachment = () => {
    if (newAttachment.trim()) {
      setEditAttachments([...editAttachments, newAttachment]);
      setNewAttachment("");
    }
  };

  const removeAttachment = (index: number) => {
    setEditAttachments(editAttachments.filter((_, i) => i !== index));
  };

  const handleDelete = (announcementId: number) => {
    deleteAnnouncement(announcementId, {
      onSuccess: () => {
        queryClient.invalidateQueries({queryKey: ["announcements"]});
        setDeleteConfirmOpen(null);
      },
    });
  };

  // Assume user ID and role are available (e.g., from auth context)
  const currentUserId = 1; // Replace with actual user ID from auth
  const isAdminOrSuperAdmin = true; // Replace with actual role check

  return (
    <div>
      <div className="flex gap-2 justify-between items-center mb-5">
        <ThemedText variant="h2">Announcements</ThemedText>

        <Button
          className="bg-primary-base hidden sm:block"
          onClick={() => {
            navigate("/create-announcement");
          }}
        >
          + Create Announcement
        </Button>
        <Button
          className="bg-primary-base sm:hidden"
          onClick={() => {
            navigate("/create-announcement");
          }}
        >
          + Create
        </Button>
        {/* <button
          onClick={() => {
            navigate("/create-announcement");
          }}
          className="fixed bottom-4 md:bottom-6 right-6 md:right-20 bg-primary-base text-white p-3 rounded-full shadow-md h-12 z-50"
        >
          <Plus />
        </button> */}
      </div>
      <div className="space-y-6">
        {announcements.map((announcement) => {
          const pollResponsesForPoll = announcement.poll?.poll_id
            ? pollResponses[announcement.poll.poll_id] || []
            : [];
          const voteCounts = announcement.poll?.options?.reduce((acc, opt) => {
            acc[opt.option_id] =
              pollResponsesForPoll.filter(
                (r) => r.poll_option_id === opt.option_id
              ).length || 0;
            return acc;
          }, {} as { [key: number]: number });
          const totalVotes =
            announcement.poll?.options?.reduce(
              (sum, opt) => sum + (voteCounts?.[opt.option_id] || 0),
              0
            ) || 0;

          return (
            <div
              key={announcement.announcement_id}
              className="w-full border border-neutral-border p-6 cursor-pointer flex flex-col justify-start relative"
              onClick={() =>
                navigate(`/announcements/${announcement.announcement_id}`)
              }
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src="../../src/assets/admins/valerie.jpg"
                    className="w-10 h-10 bg-background-neutral rounded-full flex items-center justify-center"
                  />
                  <div>
                    <ThemedText variant="h4">
                      {announcement.admin.user.name}
                    </ThemedText>
                    <ThemedText variant="caption">
                      {getTimeAgo(announcement.created_at)}
                    </ThemedText>
                  </div>
                </div>
                {(isAdminOrSuperAdmin ||
                  announcement.admin.user_id === currentUserId) && (
                  <div
                    className="relative"
                    onClick={(e) => e.stopPropagation()}
                    ref={dropdownRef}
                  >
                    <button
                      onClick={() =>
                        setDropdownOpen(
                          dropdownOpen === announcement.announcement_id
                            ? null
                            : announcement.announcement_id
                        )
                      }
                      className="text-neutral-text-secondary hover:text-primary-base p-2"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    {dropdownOpen === announcement.announcement_id && (
                      <div className="absolute right-0 mt-2 w-32 bg-background-neutral border border-neutral-border rounded-md shadow-lg z-10">
                        <div className="py-1">
                          {!announcement.is_poll && (
                            <button
                              onClick={() =>
                                handleEdit(
                                  announcement.announcement_id,
                                  announcement.title,
                                  announcement.content,
                                  announcement.attachments || []
                                )
                              }
                              className="block w-full text-left px-4 py-2 text-sm text-neutral-text-secondary"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setDeleteConfirmOpen(
                                announcement.announcement_id
                              );
                              setDropdownOpen(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-error"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <ThemedText
                variant="h3"
                className="text-neutral-text-primary mb-3"
              >
                {announcement.title}
              </ThemedText>
              <ThemedText className="mb-3">{announcement.content}</ThemedText>
              {announcement.is_poll && announcement.poll && (
                <div className="mb-4">
                  {announcement.poll.options?.map((opt) => {
                    const votes = voteCounts?.[opt.option_id] || 0;
                    const percentage =
                      totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                    const hasVoted = pollResponsesForPoll.some(
                      (r) =>
                        r.user_id === currentUserId &&
                        r.poll_option_id === opt.option_id
                    );
                    return (
                      <div key={opt.option_id} className="mb-2">
                        <label className="flex items-center space-x-2 text-neutral-text-secondary">
                          {announcement.poll.allow_multiple_answers ? (
                            <input
                              type="checkbox"
                              checked={hasVoted}
                              onChange={() =>
                                handlePollResponse(
                                  announcement.announcement_id,
                                  opt.option_id,
                                  announcement.poll.poll_id
                                )
                              }
                              className="h-4 w-4 text-primary-base bg-background-neutral border-neutral-border rounded"
                            />
                          ) : (
                            <input
                              type="radio"
                              name={`pollOption-${announcement.announcement_id}`}
                              checked={hasVoted}
                              onChange={() =>
                                handlePollResponse(
                                  announcement.announcement_id,
                                  opt.option_id,
                                  announcement.poll.poll_id
                                )
                              }
                              className="h-4 w-4 text-primary-base bg-background-neutral border-neutral-border rounded"
                            />
                          )}
                          <span>{opt.content}</span>
                        </label>
                        <div className="w-full bg-background-neutral rounded-full h-2 mt-1">
                          <div
                            className="bg-primary-base h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <ThemedText variant="caption">{votes} votes</ThemedText>
                      </div>
                    );
                  })}
                </div>
              )}
              {announcement.attachments?.length > 0 && (
                <ThemedText
                  variant="caption"
                  className="text-primary-base mb-4"
                >
                  {announcement.attachments.length} attachments
                </ThemedText>
              )}
              {announcement._count?.comments > 0 ? (
                <div className="flex items-center space-x-2">
                  <ThemedText variant="caption" className="text-right w-full">
                    {announcement._count?.comments || 0} comments
                  </ThemedText>
                </div>
              ) : (
                <AddCommentInput
                  disabled={true}
                  value=""
                  onChangeText={() => {}}
                />
              )}

              {/* Edit Modal */}
              {editModalOpen === announcement.announcement_id && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-background-main p-6 rounded-lg w-96">
                    <ThemedText
                      variant="h2"
                      className="text-xl mb-4 text-neutral-text-secondary"
                    >
                      Edit Announcement
                    </ThemedText>
                    <div className="mb-4">
                      <label className="block text-sm text-neutral-text-secondary mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-background-neutral border border-neutral-border rounded-md text-neutral-text-secondary"
                        placeholder="Enter title"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm text-neutral-text-secondary mb-1">
                        Content
                      </label>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-3 py-2 bg-background-neutral border border-neutral-border rounded-md text-neutral-text-secondary"
                        placeholder="Enter content"
                        rows={4}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm text-neutral-text-secondary mb-1">
                        Attachments
                      </label>
                      {editAttachments.map((url, index) => (
                        <div key={index} className="flex items-center mb-2">
                          <input
                            type="text"
                            value={url}
                            onChange={(e) => {
                              const newAttachments = [...editAttachments];
                              newAttachments[index] = e.target.value;
                              setEditAttachments(newAttachments);
                            }}
                            className="flex-1 px-3 py-2 bg-background-neutral border border-neutral-border rounded-md text-neutral-text-secondary"
                            placeholder="Enter attachment URL"
                          />
                          <button
                            onClick={() => removeAttachment(index)}
                            className="ml-2 text-error hover:text-error-dark"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={newAttachment}
                          onChange={(e) => setNewAttachment(e.target.value)}
                          className="flex-1 px-3 py-2 bg-background-neutral border border-neutral-border rounded-md text-neutral-text-secondary"
                          placeholder="Enter new attachment URL"
                        />
                        <button
                          onClick={addAttachment}
                          className="ml-2 px-3 py-2 bg-primary-base text-white rounded-md hover:bg-primary-dark"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-4">
                      <button
                        onClick={() => setEditModalOpen(null)}
                        className="px-4 py-2 text-neutral-text-secondary hover:text-neutral-text-primary"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() =>
                          handleUpdate(announcement.announcement_id)
                        }
                        className="px-4 py-2 bg-primary-base rounded text-white hover:bg-primary-dark"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Delete Confirmation Modal */}
              {deleteConfirmOpen === announcement.announcement_id && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-background-main p-6 rounded-lg w-96 text-center">
                    <ThemedText className="text-neutral-text-secondary mb-4">
                      Are you sure you want to delete this announcement?
                    </ThemedText>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => setDeleteConfirmOpen(null)}
                        className="px-4 py-2 text-neutral-text-secondary hover:text-neutral-text-primary"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(announcement.announcement_id)
                        }
                        className="px-4 py-2 bg-error rounded text-white hover:bg-error-dark"
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
    </div>
  );
};

export default Announcements;
