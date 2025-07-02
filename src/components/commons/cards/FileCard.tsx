import React, { useState, useRef } from 'react';
import ThemedText from '@/components/commons/typography/ThemedText';

interface FileProps {
  id: number;
  name: string;
  type: 'pdf' | 'docx' | 'img' | 'ppt' | 'video' | string;
  pages: number;
  size: string;
  date?: string;
}

const FileCard: React.FC<{ file: FileProps }> = ({ file }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<string | null>(null);
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return 'https://via.placeholder.com/24?text=PDF';
      case 'docx':
        return 'https://via.placeholder.com/24?text=DOC';
      case 'img':
        return 'https://via.placeholder.com/24?text=IMG';
      case 'ppt':
        return 'https://via.placeholder.com/24?text=PPT';
      case 'video':
        return 'https://via.placeholder.com/24?text=VID';
      default:
        return 'https://via.placeholder.com/24?text=FILE';
    }
  };

  const handleFileClick = (url: string, type: string) => {
    switch (type.toLowerCase()) {
      case 'img':
      case 'video':
        setModalContent(url);
        setIsModalOpen(true);
        break;
      case 'pdf':
        window.open(url, '_blank', 'noopener,noreferrer');
        break;
      case 'docx':
      case 'ppt':
        if (downloadLinkRef.current) {
          downloadLinkRef.current.href = url;
          downloadLinkRef.current.download = file.name; // Use the original file name
          downloadLinkRef.current.click();
        }
        break;
      default:
        window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 p-4 bg-gray-800 rounded-lg">
        <img src={getIcon(file.type)} alt={`${file.type} icon`} className="w-6 h-6" />
        <div
          className="flex-1 cursor-pointer"
          onClick={() => {
            const attachment = document.querySelector(`[data-content-id="${file.id}"]`) as HTMLDivElement;
            if (attachment) {
              const url = attachment.dataset.url || '';
              handleFileClick(url, file.type);
            }
          }}
        >
          <ThemedText className="line-clamp-2 text-gray-100">{file.name}</ThemedText>
          <div className="flex gap-4 text-sm text-gray-400">
            <ThemedText variant="caption">{file.pages} pages</ThemedText>
            <ThemedText variant="caption">{file.size}</ThemedText>
            {file.date && <ThemedText variant="caption">{file.date}</ThemedText>}
          </div>
        </div>
        <a
          ref={downloadLinkRef}
          style={{ display: 'none' }}
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setIsModalOpen(false)}>
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            {file.type.toLowerCase() === 'img' ? (
              <img src={modalContent || ''} alt="Modal content" className="max-h-[80vh] max-w-[80vw]" />
            ) : (
              <video controls className="max-h-[80vh] max-w-[80vw]">
                <source src={modalContent || ''} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-white text-2xl"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FileCard;