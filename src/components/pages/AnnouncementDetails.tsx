import React, { useState, useEffect, Component, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useCommentSocket,
  useCreateComment,
  useGetComments,
} from "../../hooks/useComments";
import {
  useGetAnnouncementDetails,
  useGetPollResponses,
  useRespondToPoll,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
} from "../../hooks/useAnnouncements";
import { useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";
import { MoreVertical, File, FileText, Image, X } from "lucide-react";
import ThemedText from "@/components/commons/typography/ThemedText";
import BackHeader from "@/components/commons/navigation/BackHeader";
import ContentContainer from "@/components/commons/containers/ContentContainer";
import CommentList from "@/components/commons/lists/CommentList";
import { getTimeAgo } from "@/utils/formatDate";

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-error bg-background-neutral rounded">
          <h2 className="text-xl font-bold">Something went wrong</h2>
          <p>{this.state.error?.message || "An unexpected error occurred."}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 bg-primary-base text-white rounded hover:bg-primary-dark"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const AnnouncementDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const announcementId = parseInt(id || "0");
  const {
    data: announcement,
    isLoading,
    error,
  } = useGetAnnouncementDetails(announcementId);
  const { data: comments, isLoading: commentsLoading } = useGetComments(
    "generalAnnouncement",
    announcementId
  );
  const { mutate: addComment } = useCreateComment();
  const [newComment, setNewComment] = useState("");
  useCommentSocket(announcementId);

  // Poll-related state and hooks
  const { mutate: respondToPoll } = useRespondToPoll();
  const { data: pollResponses } = useGetPollResponses(
    announcement?.poll?.poll_id || 0
  );
  const { mutate: updateAnnouncement } = useUpdateAnnouncement();
  const { mutate: deleteAnnouncement } = useDeleteAnnouncement();
  const queryClient = useQueryClient();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editAttachments, setEditAttachments] = useState<string[]>([]);
  const [newAttachment, setNewAttachment] = useState("");
  const [attachmentSizes, setAttachmentSizes] = useState<{
    [key: number]: string;
  }>({});
  const [selectedAttachment, setSelectedAttachment] = useState<{
    url: string;
    originalName: string;
  } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (announcement?.attachments) {
      const fetchSizes = async () => {
        const sizes = {};
        for (let i = 0; i < announcement.attachments.length; i++) {
          const attachment = announcement.attachments[i];
          try {
            const response = await fetch(attachment.url, { method: "HEAD" });
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const size = response.headers.get("content-length");
            sizes[i] = size
              ? `${(parseInt(size) / 1024).toFixed(2)} KB`
              : "Size unavailable (server-side fetch required)";
            if (!size && attachment.url.match(/\.(pdf|docx)$/i)) {
              console.warn(
                `No content-length for ${attachment.url}. Consider backend API for accurate size.`
              );
            }
          } catch (err) {
            sizes[i] = "Size unavailable (error fetching)";
            console.error(`Error fetching size for ${attachment.url}:`, err);
          }
        }
        setAttachmentSizes(sizes);
      };
      fetchSizes();
    }
  }, [announcement]);

  useEffect(() => {
    if (announcement) {
      setEditTitle(announcement.title || "");
      setEditContent(announcement.content || "");
      setEditAttachments(announcement.attachments?.map((a) => a.url) || []);
    }
  }, [announcement]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) return <ThemedText className="p-4">Loading...</ThemedText>;
  if (error)
    return <ThemedText className="text-error p-4">{error.message}</ThemedText>;
  if (!announcement)
    return <ThemedText className="p-4">Announcement not found.</ThemedText>;

  const handleAddComment = () => {
    if (newComment.trim() === "") return;
    addComment(
      {
        type: "generalAnnouncement",
        targetId: announcementId,
        content: newComment,
      },
      {
        onSuccess: () => setNewComment(""),
      }
    );
  };

  const handlePollResponse = (optionId: number) => {
    if (announcement.poll?.poll_id) {
      respondToPoll(
        { pollId: announcement.poll.poll_id, optionId },
        {
          onSuccess: (response) => {
            queryClient.invalidateQueries([
              "pollResponses",
              announcement.poll.poll_id,
            ]);
            api
              .get(`/polls/${announcement.poll.poll_id}/responses`)
              .then((res) => {
                queryClient.setQueryData(
                  ["pollResponses", announcement.poll.poll_id],
                  res.data
                );
              });
          },
        }
      );
    }
  };

  const handleEdit = () => {
    setEditModalOpen(true);
    setDropdownOpen(false);
  };

  const handleUpdate = () => {
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
          queryClient.invalidateQueries(["announcements"]);
          queryClient.invalidateQueries(["announcement", announcementId]);
          setEditModalOpen(false);
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

  const handleDelete = () => {
    deleteAnnouncement(announcementId, {
      onSuccess: () => {
        queryClient.invalidateQueries(["announcements"]);
        navigate("/announcements");
      },
    });
  };

  // Assume user role and ID are available (e.g., from auth context)
  const currentUserId = 1; // Replace with actual user ID from auth
  const isAdminOrSuperAdmin = true; // Replace with actual role check

  // Calculate vote counts for each option
  const voteCounts = announcement.poll?.options?.reduce((acc, opt) => {
    acc[opt.option_id] =
      pollResponses?.filter((r) => r.poll_option_id === opt.option_id).length ||
      0;
    return acc;
  }, {} as { [key: number]: number });

  const totalVotes =
    announcement.poll?.options?.reduce(
      (sum, opt) => sum + (voteCounts?.[opt.option_id] || 0),
      0
    ) || 0;

  // Helper to determine icon and type based on file type
  const getFileInfo = (url: string) => {
    if (url.endsWith(".pdf"))
      return { icon: <FileText className="w-6 h-6 text-error" />, type: "PDF" };
    if (url.endsWith(".doc") || url.endsWith(".docx"))
      return { icon: <File className="w-6 h-6 text-blue-500" />, type: "DOCX" };
    if (url.match(/\.(jpeg|jpg|png|gif)$/i))
      return {
        icon: <Image className="w-6 h-6 text-green-500" />,
        type: "IMG",
      };
    if (url.endsWith(".mp4") || url.endsWith(".mov"))
      return {
        icon: <File className="w-6 h-6 text-purple-500" />,
        type: "VIDEO",
      };
    return {
      icon: <File className="w-6 h-6 text-neutral-text-tertiary" />,
      type: "UNKNOWN",
    };
  };

  const closeModal = () => setSelectedAttachment(null);

  return (
    <ErrorBoundary>
      <ContentContainer>
        <BackHeader title="Back to announcements" backUrl="/announcements" />
        <div className="flex justify-between items-start mb-6 mt-6">
          <div className="flex gap-2">
            <img
              src="../../src/assets/admins/valerie.jpg"
              alt=""
              className="w-10 h-10 rounded-full bg-background-neutral"
            />
            <div className="flex-1">
              <ThemedText variant="h4">
                {announcement.admin.user.name}
              </ThemedText>
              <ThemedText
                variant="caption"
                className="text-neutral-text-tertiary"
              >
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
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="text-neutral-text-secondary hover:text-primary-base p-2"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-background-neutral border border-neutral-border rounded-md shadow-lg z-10">
                  <div className="py-1">
                    {!announcement.is_poll && (
                      <button
                        onClick={handleEdit}
                        className="block w-full text-left px-4 py-2 text-sm text-neutral-text-secondary"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setDeleteConfirmOpen(true);
                        setDropdownOpen(false);
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
        <div className="mb-6">
          <ThemedText
            variant="h2"
            className="text-xl mb-2 text-neutral-text-primary"
          >
            {announcement.title}
          </ThemedText>
          <ThemedText>
            {announcement.content || "No details provided."}
          </ThemedText>
        </div>
        {announcement.attachments?.length > 0 && (
          <div className="mb-6">
            {announcement.attachments.map((attachment, index) => {
              const fileName =
                attachment.originalName ||
                attachment.url.split("/").pop()?.split("?")[0] ||
                `file_${index}`;
              const { icon, type } = getFileInfo(attachment.url);
              return (
                <div
                  key={index}
                  className="flex mb-2 cursor-pointer w-fit"
                  onClick={() => setSelectedAttachment(attachment)}
                >
                  {icon}
                  <div className="ml-3 flex-1">
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-text-secondary text-sm"
                    >
                      {fileName}
                    </a>
                    <div className="flex gap-5 items-center">
                      <ThemedText className="text-xs text-neutral-text-tertiary">
                        {type.toLowerCase()}
                      </ThemedText>
                      {type.toLowerCase() !== "video" &&
                        type.toLowerCase() !== "img" && (
                          <ThemedText className="text-xs text-neutral-text-tertiary">
                            {12} pages
                          </ThemedText>
                        )}
                      <ThemedText className="text-xs text-neutral-text-tertiary">
                        {attachmentSizes[index] || "Loading..."}
                      </ThemedText>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal for Viewing Attachments */}
        {selectedAttachment && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={closeModal}
          >
            <div
              className="relative bg-background-neutral p-6 rounded-lg max-w-4xl w-full h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeModal}
                className="absolute top-2 right-2 text-neutral-text-secondary text-2xl font-bold hover:text-neutral-text-primary"
              >
                ×
              </button>
              {selectedAttachment.url.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                <img
                  src={selectedAttachment.url}
                  alt={selectedAttachment.originalName}
                  className="max-w-full max-h-full object-contain"
                />
              ) : selectedAttachment.url.endsWith(".pdf") ? (
                <iframe
                  src={selectedAttachment.url}
                  title="PDF Viewer"
                  className="w-full h-full"
                />
              ) : (
                <div className="text-neutral-text-secondary text-center">
                  <p>
                    Preview not available for {selectedAttachment.originalName}.
                    Download to view.
                  </p>
                  <a
                    href={selectedAttachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-base hover:underline"
                  >
                    Download
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Poll Section */}
        {announcement.is_poll && announcement.poll && (
          <div className="mb-6">
            <ThemedText variant="h2" className="text-xl mb-4">
              Poll: {announcement.poll.type}
            </ThemedText>
            {announcement.poll.options?.map((opt) => {
              const votes = voteCounts?.[opt.option_id] || 0;
              const percentage =
                totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
              const hasVoted = pollResponses?.some(
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
                        onChange={() => handlePollResponse(opt.option_id)}
                        className="h-4 w-4 text-primary-base bg-background-neutral border-neutral-border rounded"
                      />
                    ) : (
                      <input
                        type="radio"
                        name="pollOption"
                        checked={hasVoted}
                        onChange={() => handlePollResponse(opt.option_id)}
                        className="h-4 w-4 text-primary-base bg-background-neutral border-neutral-border rounded"
                      />
                    )}
                    <span>{opt.content}</span>
                  </label>
                  <div className="w-full bg-background-neutral rounded-full h-2.5 mt-1">
                    <div
                      className="bg-primary-base h-2.5 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <ThemedText variant="caption">{votes} votes</ThemedText>
                </div>
              );
            })}
            {isAdminOrSuperAdmin && pollResponses && (
              <div className="mt-4">
                <ThemedText variant="h3">Responses</ThemedText>
                {pollResponses.map((response) => (
                  <ThemedText
                    key={response.response_id}
                    className="text-neutral-text-secondary"
                  >
                    {response.user.name} responded at{" "}
                    {new Date(response.responded_at).toLocaleString()}
                  </ThemedText>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Comments Section */}
        <div className="mb-8">
          <ThemedText className="text-neutral-text-secondary mb-4 pt-6 border-t border-neutral-border">
            Comments ({announcement._count?.comments || 0})
          </ThemedText>
          <CommentList
            comments={comments}
            isLoading={commentsLoading}
            totalComments={announcement._count?.comments || 0}
          />
          <div className="flex items-center space-x-3 mt-8">
            <input
              type="text"
              placeholder="Add a comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 px-3 py-2 bg-background-neutral rounded-[100px] text-neutral-text-secondary text-sm border border-neutral-border"
            />
            {!!newComment && (
              <button
                onClick={handleAddComment}
                className="flex justify-center items-center bg-primary-base rounded-full w-9 h-9 text-white pl-1 hover:bg-primary-dark"
                disabled={!newComment.trim() || isLoading}
              >
                <span className="material-icons">send</span>
              </button>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {editModalOpen && (
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
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-neutral-text-secondary hover:text-neutral-text-primary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-primary-base rounded text-white hover:bg-primary-dark"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background-main p-6 rounded-lg w-96 text-center">
              <ThemedText className="text-neutral-text-secondary mb-4">
                Are you sure you want to delete this announcement?
              </ThemedText>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="px-4 py-2 text-neutral-text-secondary hover:text-neutral-text-primary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-error rounded text-white hover:bg-error-dark"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </ContentContainer>
    </ErrorBoundary>
  );
};

export default AnnouncementDetails;
