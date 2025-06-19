import React, { useState } from 'react';
import { useGetStudents, useSearchStudents, useAddStudent, useAddMultipleStudents, useEditStudent, useDeleteStudent } from '../../hooks/useAdmin';

const ManageStudents: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputQuery, setInputQuery] = useState('');
  const { data: students, isLoading, error } = useGetStudents(page, limit);
  const { data: searchedStudents, isLoading: isSearchLoading } = useSearchStudents(searchQuery);
  const { mutate: addStudent } = useAddStudent();
  const { mutate: addMultipleStudents } = useAddMultipleStudents();
  const { mutate: editStudent } = useEditStudent();
  const { mutate: deleteStudent } = useDeleteStudent();

  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showAddSingleModal, setShowAddSingleModal] = useState(false);
  const [showAddMultipleModal, setShowAddMultipleModal] = useState(false);
  const [singleStudentForm, setSingleStudentForm] = useState({
    name: '',
    email: '',
    password: '',
    matricule_number: '',
    level: '',
    institutional_email: '',
    phone_number: '',
    nationality: '',
  });
  const [previewData, setPreviewData] = useState<string[][]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    matricule_number: '',
    level: '',
    institutional_email: '',
    phone_number: '',
    nationality: '',
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
          .filter((row) => row.length >= 7); // Require 7+ for nationality
        if (rows.length <= 1) {
          alert('CSV file must contain at least one data row after the header.');
          return;
        }
        setPreviewData(rows.slice(1));
      };
      reader.readAsText(file);
    }
  };

  const addSingleStudent = () => {
    if (
      singleStudentForm.name &&
      singleStudentForm.email &&
      singleStudentForm.password &&
      singleStudentForm.matricule_number &&
      singleStudentForm.level &&
      singleStudentForm.institutional_email &&
      singleStudentForm.nationality
    ) {
      addStudent(
        { ...singleStudentForm, role: 'Student' },
        {
          onSuccess: () => {
            setSingleStudentForm({
              name: '',
              email: '',
              password: '',
              matricule_number: '',
              level: '',
              institutional_email: '',
              phone_number: '',
              nationality: '',
            });
            setShowAddSingleModal(false);
          },
          onError: (err) => {
            console.error('Add student failed:', err);
            alert('Failed to add student: ' + err.message);
          },
        }
      );
    } else {
      alert('Please fill in all required fields.');
    }
  };

  const addMultipleStudentsHandler = () => {
    const users = previewData.map(([name, email, password, matricule_number, level, institutional_email, phone_number, nationality]) => ({
      name,
      email,
      password,
      matricule_number,
      level: level.startsWith('L') ? level : `L${level}`, // Normalize level
      institutional_email,
      phone_number: phone_number || undefined,
      nationality: nationality || undefined,
      role: 'Student',
    }));
    console.log('Sending payload:', { users });
    addMultipleStudents(
      { users },
      {
        onSuccess: () => {
          setPreviewData([]);
          setShowAddMultipleModal(false);
        },
        onError: (err) => {
          console.error('Add multiple students failed:', err);
          alert('Failed to add students: ' + err.message);
        },
      }
    );
  };

  const handleEdit = () => {
    if (selectedStudent) {
      console.log('Selected student for edit:', selectedStudent);
      setEditForm({
        name: selectedStudent.user.name,
        email: selectedStudent.user.email,
        matricule_number: selectedStudent.matricule_number,
        level: selectedStudent.level,
        institutional_email: selectedStudent.institutional_email,
        phone_number: selectedStudent.user.phone_number || '',
        nationality: selectedStudent.nationality || '',
      });
      setShowEditModal(true);
    }
  };

  const submitEdit = () => {
    if (selectedStudent) {
      const studentId = selectedStudent.user_id?.toString();
      console.log(`Submitting edit for student ID: ${studentId}, Data:`, editForm);
      if (!studentId || isNaN(Number(studentId))) {
        console.error('Invalid student ID:', studentId);
        alert('Invalid student ID');
        return;
      }
      editStudent(
        { studentId, data: editForm },
        {
          onSuccess: () => {
            console.log('Edit student successful');
            setShowEditModal(false);
            setSelectedStudent(null);
          },
          onError: (err) => {
            console.error('Edit student failed:', err);
            alert('Failed to edit student: ' + err.message);
          },
        }
      );
    }
  };

  const handleDelete = () => {
    if (selectedStudent) {
      const studentId = selectedStudent.user_id?.toString();
      console.log(`Deleting student ID: ${studentId}`);
      if (!studentId || isNaN(Number(studentId))) {
        console.error('Invalid student ID:', studentId);
        alert('Invalid student ID');
        return;
      }
      deleteStudent(studentId, {
        onSuccess: () => {
          console.log('Delete student successful');
          setShowConfirmDelete(false);
          setSelectedStudent(null);
        },
        onError: (err) => {
          console.error('Delete student failed:', err);
          alert('Failed to delete student: ' + err.message);
        },
      });
    }
  };

  const displayStudents = searchQuery ? searchedStudents : students;

  if (isLoading || isSearchLoading) return <p className="text-white">Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;

  return (
    <div className="p-4 bg-gray-900 text-white">
      <div className="flex justify-between mb-4">
        <select className="bg-gray-700 text-white p-2 rounded">
          <option>All Students</option>
        </select>
        <button
          onClick={() => setShowAddOptions((prev) => !prev)}
          className="bg-blue-500 text-white p-2 rounded"
        >
          + Add Student
        </button>
      </div>
      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Search by name or matricule"
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
      {displayStudents?.map((student) => (
        <div
          key={student.user_id}
          className="bg-gray-800 p-2 mb-2 rounded flex justify-between items-center"
        >
          <span>
            {student.user.name} - {student.matricule_number} ({student.institutional_email})
          </span>
          <button
            onClick={() => setSelectedStudent(student)}
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
            <h2 className="text-lg font-semibold mb-4">Add Single Student</h2>
            <input
              type="text"
              value={singleStudentForm.name}
              onChange={(e) => setSingleStudentForm({ ...singleStudentForm, name: e.target.value })}
              placeholder="Name"
              className="w-full mb-2 p-2 border rounded text-black border-black"
              required
            />
            <input
              type="email"
              value={singleStudentForm.email}
              onChange={(e) => setSingleStudentForm({ ...singleStudentForm, email: e.target.value })}
              placeholder="Email"
              className="w-full mb-2 p-2 border rounded text-black border-black"
              required
            />
            <input
              type="password"
              value={singleStudentForm.password}
              onChange={(e) => setSingleStudentForm({ ...singleStudentForm, password: e.target.value })}
              placeholder="Password"
              className="w-full mb-2 p-2 border rounded text-black border-black"
              required
            />
            <input
              type="text"
              value={singleStudentForm.matricule_number}
              onChange={(e) => setSingleStudentForm({ ...singleStudentForm, matricule_number: e.target.value })}
              placeholder="Matricule Number"
              className="w-full mb-2 p-2 border rounded text-black border-black"
              required
            />
            <input
              type="text"
              value={singleStudentForm.level}
              onChange={(e) => setSingleStudentForm({ ...singleStudentForm, level: e.target.value })}
              placeholder="Level (e.g., L100)"
              className="w-full mb-2 p-2 border rounded text-black border-black"
              required
            />
            <input
              type="email"
              value={singleStudentForm.institutional_email}
              onChange={(e) => setSingleStudentForm({ ...singleStudentForm, institutional_email: e.target.value })}
              placeholder="Institutional Email"
              className="w-full mb-2 p-2 border rounded text-black border-black"
              required
            />
            <input
              type="text"
              value={singleStudentForm.phone_number}
              onChange={(e) => setSingleStudentForm({ ...singleStudentForm, phone_number: e.target.value })}
              placeholder="Phone Number (optional)"
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="text"
              value={singleStudentForm.nationality}
              onChange={(e) => setSingleStudentForm({ ...singleStudentForm, nationality: e.target.value })}
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
                onClick={addSingleStudent}
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
            <h2 className="text-lg font-semibold mb-4">Add Multiple Students</h2>
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
                  {previewData.map(([name, email, password, matricule_number, level, institutional_email, phone_number, nationality], index) => (
                    <div key={index} className="bg-gray-100 p-2 rounded">
                      {name} - {email} - {matricule_number} - {level} - {institutional_email} {phone_number ? `- ${phone_number}` : ''} {nationality ? `- ${nationality}` : ''}
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
                    onClick={addMultipleStudentsHandler}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Add Students
                  </button>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-600">
                Upload a CSV with header: <code>name,email,password,matricule_number,level,institutional_email,phone_number,nationality</code>
              </p>
            )}
          </div>
        </div>
      )}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded shadow-md min-w-[300px]">
            <h2 className="text-lg font-semibold mb-4">Edit Student</h2>
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
              value={editForm.matricule_number}
              onChange={(e) => setEditForm({ ...editForm, matricule_number: e.target.value })}
              placeholder="Matricule Number"
              className="w-full mb-2 p-2 border rounded text-black border-black"
              required
            />
            <input
              type="text"
              value={editForm.level}
              onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
              placeholder="Level"
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
      {showConfirmDelete && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-4 rounded shadow-md min-w-[300px] text-center">
            <p className="mb-4">
              Are you sure you want to delete <strong>{selectedStudent.user.name}</strong>?
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
      {selectedStudent && !showEditModal && !showConfirmDelete && (
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
            onClick={() => setSelectedStudent(null)}
            className="block mt-2 text-gray-500 text-sm"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default ManageStudents;