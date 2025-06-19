import React, { useState } from 'react';
import { useGetTeachers, useSearchTeachers, useAddTeacher, useAddMultipleTeachers, useEditTeacher, useDeleteTeacher } from '../../hooks/useAdmin';

const ManageTeachers: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputQuery, setInputQuery] = useState('');
  const { data: teachers, isLoading, error } = useGetTeachers(page, limit);
  const { data: searchedTeachers, isLoading: isSearchLoading } = useSearchTeachers(searchQuery);
  const { mutate: addTeacher } = useAddTeacher();
  const { mutate: addMultipleTeachers } = useAddMultipleTeachers();
  const { mutate: editTeacher } = useEditTeacher();
  const { mutate: deleteTeacher } = useDeleteTeacher();

  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showAddSingleModal, setShowAddSingleModal] = useState(false);
  const [showAddMultipleModal, setShowAddMultipleModal] = useState(false);
  const [singleTeacherForm, setSingleTeacherForm] = useState({
    name: '',
    email: '',
    password: '',
    phone_number: '',
  });
  const [previewData, setPreviewData] = useState<string[][]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone_number: '',
  });

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputQuery(e.target.value);
  };

  const handleSearchSubmit = () => {
    setSearchQuery(inputQuery);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const rows = text
          .split('\n')
          .map((row) => row.split(',').map((cell) => cell.trim()))
          .filter((row) => row.length >= 3); // Allow rows with 3+ values (name, email, password required)
        if (rows.length <= 1) {
          alert('CSV file must contain at least one data row after the header.');
          return;
        }
        setPreviewData(rows.slice(1)); // Skip the header row
      };
      reader.readAsText(file);
    }
  };

  const addSingleTeacher = () => {
    if (
      singleTeacherForm.name &&
      singleTeacherForm.email &&
      singleTeacherForm.password
    ) {
      addTeacher(
        { ...singleTeacherForm, role: 'Teacher' },
        {
          onSuccess: () => {
            setSingleTeacherForm({ name: '', email: '', password: '', phone_number: '' });
            setShowAddSingleModal(false);
          },
          onError: (err) => {
            console.error('Add teacher failed:', err);
            alert('Failed to add teacher: ' + err.message);
          },
        }
      );
    } else {
      alert('Please fill in all required fields.');
    }
  };

  const addMultipleTeachersHandler = () => {
    const users = previewData.map(([name, email, password, phone_number]) => ({
      name,
      email,
      password,
      phone_number: phone_number || undefined,
      role: 'Teacher',
    }));
    addMultipleTeachers(
      { users },
      {
        onSuccess: () => {
          setPreviewData([]);
          setShowAddMultipleModal(false);
        },
        onError: (err) => {
          console.error('Add multiple teachers failed:', err);
          alert('Failed to add teachers: ' + err.message);
        },
      }
    );
  };

  const handleEdit = () => {
    if (selectedTeacher) {
      console.log('Selected teacher for edit:', selectedTeacher);
      setEditForm({
        name: selectedTeacher.user.name,
        email: selectedTeacher.user.email,
        phone_number: selectedTeacher.user.phone_number || '',
      });
      setShowEditModal(true);
    }
  };

  const submitEdit = () => {
    if (selectedTeacher) {
      const teacherId = selectedTeacher.user_id?.toString();
      console.log(`Submitting edit for teacher ID: ${teacherId}, Data:`, editForm);
      if (!teacherId || isNaN(Number(teacherId))) {
        console.error('Invalid teacher ID:', teacherId);
        alert('Invalid teacher ID');
        return;
      }
      editTeacher(
        { teacherId, data: editForm },
        {
          onSuccess: () => {
            console.log('Edit teacher successful');
            setShowEditModal(false);
            setSelectedTeacher(null);
          },
          onError: (err) => {
            console.error('Edit teacher failed:', err);
            alert('Failed to edit teacher: ' + err.message);
          },
        }
      );
    }
  };

  const handleDelete = () => {
    if (selectedTeacher) {
      const teacherId = selectedTeacher.user_id?.toString();
      console.log(`Deleting teacher ID: ${teacherId}`);
      if (!teacherId || isNaN(Number(teacherId))) {
        console.error('Invalid teacher ID:', teacherId);
        alert('Invalid teacher ID');
        return;
      }
      deleteTeacher(teacherId, {
        onSuccess: () => {
          console.log('Delete teacher successful');
          setShowConfirmDelete(false);
          setSelectedTeacher(null);
        },
        onError: (err) => {
          console.error('Delete teacher failed:', err);
          alert('Failed to delete teacher: ' + err.message);
        },
      });
    }
  };

  const displayTeachers = searchQuery ? searchedTeachers : teachers;

  if (isLoading || isSearchLoading) return <p className="text-white">Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;

  return (
    <div className="p-4 bg-gray-900 text-white">
      <div className="flex justify-between mb-4">
        <select className="bg-gray-700 text-white p-2 rounded">
          <option>All Teachers</option>
        </select>
        <button
          onClick={() => setShowAddOptions((prev) => !prev)}
          className="bg-blue-500 text-white p-2 rounded"
        >
          + Add Teacher
        </button>
      </div>
      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Search by name"
          value={inputQuery}
          onChange={handleSearchInput}
          className="w-full p-2 bg-gray-700 text-white rounded-l"
        />
        <button
          onClick={handleSearchSubmit}
          className="bg-blue-500 text-white p-2 rounded-r"
        >
          Search
        </button>
      </div>
      {displayTeachers?.map((teacher) => (
        <div
          key={teacher.user_id}
          className="bg-gray-800 p-2 mb-2 rounded flex justify-between items-center"
        >
          <span>
            {teacher.user.name} - {teacher.user.email}
          </span>
          <button
            onClick={() => setSelectedTeacher(teacher)}
            className="text-white text-xl"
          >
            ...
          </button>
        </div>
      ))}
      {showAddOptions && (
        <div className="mt-4 space-x-2">
          <button
            onClick={() => {
              setShowAddSingleModal(true);
              setShowAddOptions(false);
            }}
            className="bg-gray-600 text-white p-2 rounded"
          >
            Add Single
          </button>
          <button
            onClick={() => {
              setShowAddMultipleModal(true);
              setShowAddOptions(false);
            }}
            className="bg-gray-600 text-white p-2 rounded"
          >
            Add Multiple
          </button>
        </div>
      )}
      {showAddSingleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded shadow-md min-w-[300px]">
            <h2 className="text-lg font-semibold mb-4">Add Single Teacher</h2>
            <input
              type="text"
              value={singleTeacherForm.name}
              onChange={(e) => setSingleTeacherForm({ ...singleTeacherForm, name: e.target.value })}
              placeholder="Name"
              className="w-full mb-2 p-2 border rounded text-black border-black"
              required
            />
            <input
              type="email"
              value={singleTeacherForm.email}
              onChange={(e) => setSingleTeacherForm({ ...singleTeacherForm, email: e.target.value })}
              placeholder="Email"
              className="w-full mb-2 p-2 border rounded text-black border-black"
              required
            />
            <input
              type="password"
              value={singleTeacherForm.password}
              onChange={(e) => setSingleTeacherForm({ ...singleTeacherForm, password: e.target.value })}
              placeholder="Password"
              className="w-full mb-2 p-2 border rounded text-black border-black"
              required
            />
            <input
              type="text"
              value={singleTeacherForm.phone_number}
              onChange={(e) => setSingleTeacherForm({ ...singleTeacherForm, phone_number: e.target.value })}
              placeholder="Phone Number (optional)"
              className="w-full mb-4 p-2 border rounded"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAddSingleModal(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={addSingleTeacher}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
      {showAddMultipleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded shadow-md min-w-[400px] max-h-[80vh] overflow-auto">
            <h2 className="text-lg font-semibold mb-4">Add Multiple Teachers</h2>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="mb-4"
            />
            {previewData.length > 0 ? (
              <>
                <h4 className="text-md font-semibold mb-2">Preview</h4>
                <div className="space-y-2 mb-4">
                  {previewData.map(([name, email, password, phone_number], index) => (
                    <div key={index} className="bg-gray-100 p-2 rounded">
                      {name} - {email} {phone_number ? `- ${phone_number}` : ''}
                    </div>
                  ))}
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowAddMultipleModal(false)}
                    className="bg-gray-300 px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addMultipleTeachersHandler}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Add Teachers
                  </button>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-600">
                Upload a CSV with header: <code>name,email,password,phone_number</code>
              </p>
            )}
          </div>
        </div>
      )}
      {showEditModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded shadow-md min-w-[300px]">
            <h2 className="text-lg font-semibold mb-4">Edit Teacher</h2>
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
              type="text"
              value={editForm.phone_number}
              onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
              placeholder="Phone Number (optional)"
              className="w-full mb-4 p-2 border rounded"
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
      {showConfirmDelete && selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-4 rounded shadow-md min-w-[300px] text-center">
            <p className="mb-4">
              Are you sure you want to delete <strong>{selectedTeacher.user.name}</strong>?
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
      {selectedTeacher && !showEditModal && !showConfirmDelete && (
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
            onClick={() => setSelectedTeacher(null)}
            className="block mt-2 text-gray-500 text-sm"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default ManageTeachers;