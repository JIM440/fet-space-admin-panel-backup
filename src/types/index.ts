export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'Teacher' | 'Admin' | 'SuperAdmin';
  studentId?: string;
  joinDate?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  comments: number;
  attachments?: number;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
  avatar: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  path: string;
}