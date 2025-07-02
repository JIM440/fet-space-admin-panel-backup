import React from 'react';
import ThemedText from '@/components/commons/typography/ThemedText';

interface Comment {
  id: number;
  author: string;
  timestamp: string;
  text: string;
}

const CommentCard: React.FC<{ comment: Comment }> = ({ comment }) => {

  return (
    <div className="flex items-start gap-2 py-4">
      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
      <div className="flex-1">
        <div className="flex items-center gap-4">
          <ThemedText className="line-clamp-1 max-w-[95%] text-gray-900 dark:text-gray-100">
            {comment.author}
          </ThemedText>
          <ThemedText variant="caption" className="text-gray-500 dark:text-gray-400">
            {comment.timestamp}
          </ThemedText>
        </div>
        <ThemedText className="text-gray-700 dark:text-gray-300">{comment.text}</ThemedText>
      </div>
    </div>
  );
};

export default CommentCard;