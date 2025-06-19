import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import type { Announcement } from "../../types";

const sampleComments: Comment[] = [
  {
    id: '1',
    author: 'Alice Johnson',
    content: 'This sounds like a great opportunity! I\'ll make sure to prepare some interesting project ideas.',
    date: '2 hours ago',
    avatar: '/api/placeholder/32/32'
  },
  {
    id: '2',
    author: 'Bob Wilson',
    content: 'What time will the event start? I want to make sure I don\'t miss anything important.',
    date: '4 hours ago',
    avatar: '/api/placeholder/32/32'
  }
];

// Announcement Details Modal
const AnnouncementDetailsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  announcement: Announcement | null;
}> = ({ isOpen, onClose, announcement }) => {
  const [newComment, setNewComment] = useState('');

  if (!isOpen || !announcement) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">{announcement.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {announcement.author.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <p className="text-white font-medium">{announcement.author}</p>
              <p className="text-gray-400 text-sm">{announcement.date}</p>
            </div>
          </div>
          <p className="text-gray-300">{announcement.content}</p>
          {announcement.attachments && (
            <p className="text-blue-400 text-sm mt-2">{announcement.attachments} attachments</p>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <MessageCircle className="mr-2" size={20} />
            Comments ({announcement.comments})
          </h3>

          <div className="space-y-4">
            {sampleComments.map((comment) => (
              <div key={comment.id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">
                      {comment.author.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{comment.author}</p>
                    <p className="text-gray-400 text-xs">{comment.date}</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">{comment.content}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-600 pt-4">
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">A</span>
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <button className="bg-blue-600 text-white px-4 py-1 rounded-md hover:bg-blue-700 text-sm">
                    Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementDetailsModal;