import React from "react";
import ThemedText from "@/components/commons/typography/ThemedText";
import InlineSpinner from "../loader/InlineSpinner";
import { getTimeAgo } from "@/utils/formatDate";

interface Comment {
  comment_id: number;
  user: { name: string };
  content: string;
}

interface CommentListProps {
  comments: Comment[] | undefined;
  isLoading: boolean;
  totalComments: number;
}

const CommentList: React.FC<CommentListProps> = ({
  comments,
  isLoading,
  totalComments,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <InlineSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!comments?.length && (
        <ThemedText className="text-neutral-text-secondary mb-4 text-center">
          No comments yet. Be the first to comment!
        </ThemedText>
      )}
      <ul className="space-y-5">
        {comments?.map((comment) => (
          <li key={comment.comment_id} className="flex gap-2">
            <img
              src="../../src/assets/admins/valerie.jpg"
              alt=""
              className="w-10 h-10 rounded-full bg-background-neutral"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <ThemedText
                  variant="caption"
                  className="text-neutral-text-tertiary"
                >
                  {comment.user.name}
                </ThemedText>
                <ThemedText
                  variant="caption"
                  className="text-neutral-text-tertiary"
                >
                  {getTimeAgo(comment?.created_at)}
                </ThemedText>
              </div>
              <ThemedText className="text-neutral-text-primary">
                {comment.content}
              </ThemedText>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommentList;
