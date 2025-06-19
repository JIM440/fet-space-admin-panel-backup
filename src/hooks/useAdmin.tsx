import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export const useGetStudents = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['students', page, limit],
    queryFn: () => api.get('/admin/students', { params: { page, limit } }).then((res) => res.data),
  });
};

export const useSearchStudents = (query: string) => {
  return useQuery({
    queryKey: ['students', 'search', query],
    queryFn: () => api.get('/admin/students/search', { params: { query } }).then((res) => res.data),
    enabled: !!query,
  });
};

export const useAddStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      email: string;
      password: string;
      matricule_number: string;
      level: string;
      institutional_email: string;
      phone_number?: string;
      role: 'Student';
    }) => api.post('/admin/students', data).then((res) => res.data),
    onSuccess: () => {
      // Invalidate all student list and search queries
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

export const useAddMultipleStudents = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      users: Array<{
        name: string;
        email: string;
        password: string;
        matricule_number: string;
        level: string;
        institutional_email: string;
        phone_number?: string;
        role: 'Student';
      }>;
    }) => {
      console.log('Sending to backend:', data.users);
      return api.post('/admin/students/bulk', data.users).then((res) => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (err: any) => {
      console.error('Bulk add students failed:', err);
      alert('Failed to add students: ' + (err.message || 'Unknown error'));
    },
  });
};

export const useEditStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, data }: {
      studentId: string;
      data: {
        name?: string;
        email?: string;
        password?: string;
        matricule_number?: string;
        level?: string;
        institutional_email?: string;
        phone_number?: string;
      };
    }) => api.put(`/admin/students/${studentId}`, data).then((res) => res.data),
    onSuccess: () => {
      // Invalidate all student list and search queries
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentId: string) => api.delete(`/admin/students/${studentId}`).then((res) => res.data),
    onSuccess: () => {
      // Invalidate all student list and search queries
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

export const useGetTeachers = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['teachers', page, limit],
    queryFn: () => api.get('/admin/teachers', { params: { page, limit } }).then((res) => res.data),
  });
};

export const useSearchTeachers = (query: string) => {
  return useQuery({
    queryKey: ['teachers', 'search', query],
    queryFn: () => api.get('/admin/teachers/search', { params: { query } }).then((res) => res.data),
    enabled: !!query,
  });
};

export const useAddTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      email: string;
      password: string;
      phone_number?: string;
      role: 'Teacher';
    }) => api.post('/admin/teachers', data).then((res) => res.data),
    onSuccess: () => {
      // Invalidate all teacher list and search queries
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
  });
};

export const useAddMultipleTeachers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      users: Array<{
        name: string;
        email: string;
        password: string;
        phone_number?: string;
        role: 'Teacher';
      }>;
    }) => {
      console.log('Sending to backend:', data.users);
      return api.post('/admin/teachers/bulk', data.users).then((res) => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
    onError: (err: any) => {
      console.error('Bulk add teachers failed:', err);
      alert('Failed to add teachers: ' + (err.message || 'Unknown error'));
    },
  });
};

export const useEditTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teacherId, data }: {
      teacherId: string;
      data: {
        name?: string;
        email?: string;
        password?: string;
        phone_number?: string;
      };
    }) => api.put(`/admin/teachers/${teacherId}`, data).then((res) => res.data),
    onSuccess: () => {
      // Invalidate all teacher list and search queries
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
  });
};

export const useDeleteTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teacherId: string) => api.delete(`/admin/teachers/${teacherId}`).then((res) => res.data),
    onSuccess: () => {
      // Invalidate all teacher list and search queries
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
  });
};

export const useGetAdmins = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['admins', page, limit],
    queryFn: () => {
      return api.get('/admin/admins', { params: { page, limit } }).then((res) => res.data)
    }
  });
};

export const useAddAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      email: string;
      password: string;
      phone_number?: string;
      role: 'Admin' | 'SuperAdmin';
    }) => api.post('/admin/admins', data).then((res) => res.data),
    onSuccess: () => {
      // Invalidate all admin list and search queries
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });
};

export const useAddMultipleAdmins = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      users: Array<{
        name: string;
        email: string;
        password: string;
        phone_number?: string;
        role: 'Admin' | 'SuperAdmin';
      }>;
    }) => api.post('/admin/admins/bulk', data).then((res) => res.data),
    onSuccess: () => {
      // Invalidate all admin list and search queries
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });
};

export const useEditAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ adminId, data }: {
      adminId: string;
      data: {
        name?: string;
        email?: string;
        password?: string;
        phone_number?: string;
        role?: 'Admin' | 'SuperAdmin';
      };
    }) => api.put(`/admin/admins/${adminId}`, data).then((res) => res.data),
    onSuccess: () => {
      // Invalidate all admin list and search queries
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });
};

export const useDeleteAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (adminId: string) => api.delete(`/admin/admins/${adminId}`).then((res) => res.data),
    onSuccess: () => {
      // Invalidate all admin list and search queries
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });
};