import React, { useState } from 'react';
import { useGetAdmins, useAddAdmin, useEditAdmin, useDeleteAdmin } from '../../hooks/useAdmin';

const ManageAdmins: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { data: admins, isLoading, error } = useGetAdmins(page, limit);
  const { mutate: addAdmin } = useAddAdmin();
  const { mutate: editAdmin } = useEditAdmin();
  const { mutate: deleteAdmin } = useDeleteAdmin();

  const [showAddSingleModal, setShowAddSingleModal] = useState(false);
  const [singleAdminForm, setSingleAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    institutional_email: '',
    phone_number: '',
    nationality: '',
  });
  const [selectedAdmin, setSelectedAdmin] = useState<any | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    institutional_email: '',
    phone_number: '',
    nationality: '',
  });

  const addSingleAdmin = () => {
    if (
      singleAdminForm.name &&
      singleAdminForm.email &&
      singleAdminForm.password &&
      singleAdminForm.institutional_email &&
      singleAdminForm.nationality
    ) {
      addAdmin(
        { ...singleAdminForm, role: 'Admin' },
        {
          onSuccess: () => {
            setSingleAdminForm({
              name: '',
              email: '',
              password: '',
              institutional_email: '',
              phone_number: '',
              nationality: '',
            });
            setShowAddSingleModal(false);
          },
          onError: (err) => {
            console.error('Add admin failed:', err);
            alert('Failed to add admin: ' + err.message);
          },
        }
      );
    } else {
      alert('Please fill in all required fields.');
    }
  };

  const handleEdit = () => {
    if (selectedAdmin) {
      console.log('Selected admin for edit:', selectedAdmin);
      setEditForm({
        name: selectedAdmin.user.name,
        email: selectedAdmin.user.email,
        institutional_email: selectedAdmin.institutional_email,
        phone_number: selectedAdmin.user.phone_number || '',
        nationality: selectedAdmin.nationality || '',
      });
      setShowEditModal(true);
    }
  };

  const submitEdit = () => {
    if (selectedAdmin) {
      const adminId = selectedAdmin.user_id?.toString();
      console.log(`Submitting edit for admin ID: ${adminId}, Data:`, editForm);
      if (!adminId || isNaN(Number(adminId))) {
        console.error('Invalid admin ID:', adminId);
        alert('Invalid admin ID');
        return;
      }
      editAdmin(
        { adminId, data: editForm },
        {
          onSuccess: () => {
            console.log('Edit admin successful');
            setShowEditModal(false);
            setSelectedAdmin(null);
          },
          onError: (err) => {
            console.error('Edit admin failed:', err);
            alert('Failed to edit admin: ' + err.message);
          },
        }
      );
    }
  };

  const handleDelete = () => {
    if (selectedAdmin) {
      const adminId = selectedAdmin.user_id?.toString();
      console.log(`Deleting admin ID: ${adminId}`);
      if (!adminId || isNaN(Number(adminId))) {
        console.error('Invalid admin ID:', adminId);
        alert('Invalid admin ID');
        return;
      }
      deleteAdmin(adminId, {
        onSuccess: () => {
          console.log('Delete admin successful');
          setShowConfirmDelete(false);
          setSelectedAdmin(null);
        },
        onError: (err) => {
          console.error('Delete admin failed:', err);
          alert('Failed to delete admin: ' + err.message);
        },
      });
    }
  };

  if (isLoading) return <p className="text-white">Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;

  return (
    <div className="p-4 bg-gray-900 text-white">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowAddSingleModal(true)}
          className="bg-blue-500 text-white p-2 rounded"
        >
          + Add Admin
        </button>
      </div>
      {admins?.map((admin) => (
        <div
          key={admin.user_id}
          className="bg-gray-800 p-2 mb-2 rounded flex justify-between items-center"
        >
          <span>
            {admin.user.name} - {admin.institutional_email}
          </span>
          <button
            onClick={() => setSelectedAdmin(admin)}
            className="text-white text-xl"
          >
            ...
          </button>
        </div>
      ))}
      {showAddSingleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded shadow-md min-w-[300px]">
            <h2 className="text-lg font-semibold mb-4">Add Single Admin</h2>
            <input
              type="text"
              value={singleAdminForm.name}
              onChange={(e) => setSingleAdminForm({ ...singleAdminForm, name: e.target.value })}
              placeholder="Name"
              className="w-full mb-2 p-2 border rounded text-black border-black"
              required
            />
            <input
              type="email"
              value={singleAdminForm.email}
              onChange={(e) => setSingleAdminForm({ ...singleAdminForm, email: e.target.value })}
              placeholder="Email"
              className="w-full mb-2 p-2 border rounded text-black border-black"
              required
            />
            <input
              type="password"
              value={singleAdminForm.password}
              onChange={(e) => setSingleAdminForm({ ...singleAdminForm, password: e.target.value })}
              placeholder="Password"
              className="w-full mb-2 p-2 border rounded text-black border-black"
              required
            />
            <input
              type="email"
              value={singleAdminForm.institutional_email}
              onChange={(e) => setSingleAdminForm({ ...singleAdminForm, institutional_email: e.target.value })}
              placeholder="Institutional Email"
              className="w-full mb-2 p-2 border rounded text-black border-black"
              required
            />
            <input
              type="text"
              value={singleAdminForm.phone_number}
              onChange={(e) => setSingleAdminForm({ ...singleAdminForm, phone_number: e.target.value })}
              placeholder="Phone Number (optional)"
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="text"
              value={singleAdminForm.nationality}
              onChange={(e) => setSingleAdminForm({ ...singleAdminForm, nationality: e.target.value })}
              placeholder="Nationality"
              className="w-full mb-4 p-2 border rounded text-black border-black"
              required
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAddSingleModal(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={addSingleAdmin}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded shadow-md min-w-[300px]">
            <h2 className="text-lg font-semibold mb-4">Edit Admin</h2>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              placeholder="Name"
              className="w-full mb-2 p-2 border rounded text-black border-black"
              required
            />
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              placeholder="Email"
              className="w-full mb-2 p-2 border rounded text-black border-black"
              required
            />
            <input
              type="email"
              value={editForm.institutional_email}
              onChange={(e) => setEditForm({ ...editForm, institutional_email: e.target.value })}
              placeholder="Institutional Email"
              className="w-full mb-2 p-2 border rounded text-black border-black"
              required
            />
            <input
              type="text"
              value={editForm.phone_number}
              onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
              placeholder="Phone Number (optional)"
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="text"
              value={editForm.nationality}
              onChange={(e) => setEditForm({ ...editForm, nationality: e.target.value })}
              placeholder="Nationality"
              className="w-full mb-4 p-2 border rounded text-black border-black"
              required
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={submitEdit}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {showConfirmDelete && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-4 rounded shadow-md min-w-[300px] text-center">
            <p className="mb-4">
              Are you sure you want to delete <strong>{selectedAdmin.user.name}</strong>?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedAdmin && !showEditModal && !showConfirmDelete && (
        <div className="fixed bottom-10 right-10 bg-white p-4 rounded shadow-md z-20">
          <button onClick={handleEdit} className="block mb-2 text-left w-full text-black">
            Edit
          </button>
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="block text-left w-full text-red-600"
          >
            Delete
          </button>
          <button
            onClick={() => setSelectedAdmin(null)}
            className="block mt-2 text-gray-500 text-sm"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default ManageAdmins;