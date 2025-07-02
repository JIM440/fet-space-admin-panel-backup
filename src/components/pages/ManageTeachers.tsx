import React, { useState, useRef } from "react";
import {
  useGetTeachers,
  useSearchTeachers,
  useAddTeacher,
  useAddMultipleTeachers,
  useEditTeacher,
  useDeleteTeacher,
} from "../../hooks/useAdmin";
import { Ellipsis, Search } from "lucide-react";
import ThemedText from "../commons/typography/ThemedText";
import FullScreenSpinner from "../commons/loader/FullScreenSpinner";
import ErrorComponent from "../commons/error/ErrorComponent";

const teacherImages = [
  "../../../src/assets/teachers/teacher8.png",
  "../../../src/assets/teachers/teacher10.jpg",
  "../../../src/assets/teachers/teacher7.png",
  "../../../src/assets/teachers/teacher2.jpg",
  "../../../src/assets/teachers/teacher3.jpg",
  "../../../src/assets/teachers/teacher4.jpg",
  "../../../src/assets/teachers/teacher5.png",
  "../../../src/assets/teachers/teacher6.png",
  "../../../src/assets/teachers/teacher1.jpg",
];

const ManageTeachers: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputQuery, setInputQuery] = useState("");
  const { data: teachers, isLoading, error, refetch } = useGetTeachers(page, limit);
  const { data: searchedTeachers, isLoading: isSearchLoading } =
    useSearchTeachers(searchQuery);
  const { mutate: addTeacher, isPending: isAddingSingleTeacher } =
    useAddTeacher();
  const { mutate: addMultipleTeachers } = useAddMultipleTeachers();
  const { mutate: editTeacher } = useEditTeacher();
  const { mutate: deleteTeacher } = useDeleteTeacher();

  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showAddSingleModal, setShowAddSingleModal] = useState(false);
  const [showAddMultipleModal, setShowAddMultipleModal] = useState(false);
  const [singleTeacherForm, setSingleTeacherForm] = useState({
    name: "",
    email: "",
    phone_number: "",
  });
  const [previewData, setPreviewData] = useState<string[][]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone_number: "",
  });

  // Refs for positioning pop-ups
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const ellipsisButtonRef = useRef<HTMLButtonElement>(null);

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
          .split("\n")
          .map((row) => row.split(",").map((cell) => cell.trim()))
          .filter((row) => row.length >= 3); // Allow rows with 3+ values (name, email, password required)
        if (rows.length <= 1) {
          alert(
            "CSV file must contain at least one data row after the header."
          );
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
      singleTeacherForm.email
    ) {
      addTeacher(
        { ...singleTeacherForm, role: "Teacher" },
        {
          onSuccess: () => {
            setSingleTeacherForm({
              name: "",
              email: "",
              phone_number: "",
            });
            setShowAddSingleModal(false);
          },
          onError: (err) => {
            console.error("Add teacher failed:", err);
            alert("Failed to add teacher: " + err.message);
          },
        }
      );
    } else {
      alert("Please fill in all required fields.");
    }
  };

  const addMultipleTeachersHandler = () => {
    const users = previewData.map(([name, email, phone_number]) => ({
      name,
      email,
      phone_number: phone_number || undefined,
      role: "Teacher",
    }));
    addMultipleTeachers(
      { users },
      {
        onSuccess: () => {
          setPreviewData([]);
          setShowAddMultipleModal(false);
        },
        onError: (err) => {
          console.error("Add multiple teachers failed:", err);
          alert("Failed to add teachers: " + err.message);
        },
      }
    );
  };

  const handleEdit = () => {
    if (selectedTeacher) {
      console.log("Selected teacher for edit:", selectedTeacher);
      setEditForm({
        name: selectedTeacher.user.name,
        email: selectedTeacher.user.email,
        phone_number: selectedTeacher.user.phone_number || "",
      });
      setShowEditModal(true);
    }
  };

  const submitEdit = () => {
    if (selectedTeacher) {
      const teacherId = selectedTeacher.user_id?.toString();
      console.log(
        `Submitting edit for teacher ID: ${teacherId}, Data:`,
        editForm
      );
      if (!teacherId || isNaN(Number(teacherId))) {
        console.error("Invalid teacher ID:", teacherId);
        alert("Invalid teacher ID");
        return;
      }
      editTeacher(
        { teacherId, data: editForm },
        {
          onSuccess: () => {
            console.log("Edit teacher successful");
            setShowEditModal(false);
            setSelectedTeacher(null);
          },
          onError: (err) => {
            console.error("Edit teacher failed:", err);
            alert("Failed to edit teacher: " + err.message);
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
        console.error("Invalid teacher ID:", teacherId);
        alert("Invalid teacher ID");
        return;
      }
      deleteTeacher(teacherId, {
        onSuccess: () => {
          console.log("Delete teacher successful");
          setShowConfirmDelete(false);
          setSelectedTeacher(null);
        },
        onError: (err) => {
          console.error("Delete teacher failed:", err);
          alert("Failed to delete teacher: " + err.message);
        },
      });
    }
  };

  const displayTeachers = searchQuery ? searchedTeachers : teachers;

  if (isLoading || isSearchLoading) return <FullScreenSpinner />;
  if (error) return <ErrorComponent message={`Error: ${error.message}`} onRetry={refetch} />;

  return (
    <div>
      <div className="flex justify-between mb-4 gap-4">
        <select className="bg-background-neutral text-neutral-text-secondary p-2 rounded-md">
          <option>All Teachers</option>
        </select>
        <button
          ref={addButtonRef}
          onClick={() => setShowAddOptions(true)}
          className="bg-primary-base rounded-md text-white p-2"
        >
          + Add Teacher
        </button>
      </div>
      <div className="flex mb-4 bg-background-neutral mt-5 md:mt-10 text-neutral-text-secondary rounded-full px-4">
        <input
          type="text"
          placeholder="Search by name"
          value={inputQuery}
          onChange={handleSearchInput}
          className="w-full p-2 bg-background-neutral text-neutral-text-tertiary rounded-full"
        />
        <button
          onClick={handleSearchSubmit}
          className="text-neutral-text-secondary p-2 rounded-full"
        >
          <Search />
        </button>
      </div>
      {displayTeachers?.map((teacher, index) => (
        <div
          key={teacher.user_id}
          className="p-2 mb-2 rounded flex justify-between items-center"
        >
          <div className="flex gap-3">
            <img
              src={teacherImages[index]}
              alt=""
              className="w-10 h-10 rounded-full bg-background-neutral object-cover border-1 border-background-neutral"
            />
            <div>
              <ThemedText variant="h4">{teacher.user.name}</ThemedText>
              <ThemedText variant="caption">{teacher.user.email}</ThemedText>
            </div>
          </div>
          <button
            ref={ellipsisButtonRef}
            onClick={() => setSelectedTeacher(teacher)}
            className="text-neutral-text-secondary p-1 bg-background-neutral rounded-full"
          >
            <Ellipsis size={20} />
          </button>
        </div>
      ))}
      {showAddOptions && !showAddSingleModal && !showAddMultipleModal && addButtonRef.current && (
        <div
          className="fixed bg-white p-4 rounded shadow-md z-20"
          style={{
            top: addButtonRef.current.getBoundingClientRect().bottom + window.scrollY + 5 + "px",
            left: addButtonRef.current.getBoundingClientRect().left + window.scrollX + "px",
          }}
        >
          <button
            onClick={() => {
              setShowAddOptions(false);
              setShowAddSingleModal(true);
            }}
            className="block mb-2 text-left w-full text-black"
          >
            Add Single
          </button>
          <button
            onClick={() => {
              setShowAddOptions(false);
              setShowAddMultipleModal(true);
            }}
            className="block text-left w-full text-black"
          >
            Add Multiple
          </button>
          <button
            onClick={() => setShowAddOptions(false)}
            className="block mt-2 text-gray-500 text-sm"
          >
            Close
          </button>
        </div>
      )}
      {selectedTeacher && !showEditModal && !showConfirmDelete && ellipsisButtonRef.current && (
        <div
          className="fixed bg-white p-4 rounded shadow-md z-20"
          style={{
            top: ellipsisButtonRef.current.getBoundingClientRect().bottom + window.scrollY + 5 + "px",
            left: ellipsisButtonRef.current.getBoundingClientRect().left + window.scrollX + "px",
          }}
        >
          <button
            onClick={handleEdit}
            className="block mb-2 text-left w-full text-black"
          >
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
      {showAddSingleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background-main p-6 rounded shadow-md min-w-[200px] w-[80%] max-w-[600px]">
            <ThemedText variant="h2" className="mb-4">
              Add Single Teacher
            </ThemedText>
            <label
              htmlFor=""
              className="text-sm text-neutral-text-secondary mb-2"
            >
              Name:
            </label>
            <input
              type="text"
              value={singleTeacherForm.name}
              onChange={(e) =>
                setSingleTeacherForm({
                  ...singleTeacherForm,
                  name: e.target.value,
                })
              }
              placeholder="Enter teacher name"
              className="w-full p-2 rounded text-neutral-text-secondary bg-background-neutral mb-4"
              required
            />
            <label
              htmlFor=""
              className="text-sm text-neutral-text-secondary mb-2"
            >
              Email:
            </label>
            <input
              type="email"
              value={singleTeacherForm.email}
              onChange={(e) =>
                setSingleTeacherForm({
                  ...singleTeacherForm,
                  email: e.target.value,
                })
              }
              placeholder="Email"
              className="w-full p-2 rounded text-neutral-text-secondary bg-background-neutral mb-4"
              required
            />
            <label
              htmlFor=""
              className="text-sm text-neutral-text-secondary mb-2"
            >
              Phone:
            </label>
            <input
              type="text"
              value={singleTeacherForm.phone_number}
              onChange={(e) =>
                setSingleTeacherForm({
                  ...singleTeacherForm,
                  phone_number: e.target.value,
                })
              }
              placeholder="Phone Number (optional)"
              className="w-full p-2 rounded text-neutral-text-secondary bg-background-neutral mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAddSingleModal(false)}
                className="px-4 py-2 rounded text-neutral-text-secondary"
              >
                Cancel
              </button>
              <button
                onClick={addSingleTeacher}
                className="bg-primary-base text-white px-4 py-2 rounded-md"
                disabled={isAddingSingleTeacher}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
      {showAddMultipleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background-main p-6 rounded shadow-md w-[80%] max-w-[600px] min-w-[200px] max-h-[80vh] overflow-auto">
            <ThemedText variant="h2" className="mb-4">
              Add Multiple Teachers
            </ThemedText>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="mb-4 text-neutral-text-secondary bg-background-neutral px-2 py-2 rounded w-full"
            />
            {previewData.length > 0 ? (
              <>
                <ThemedText variant="h4" className="mb-2">
                  Preview ({previewData.length} teachers)
                </ThemedText>
                <div className="space-y-2 mb-4 max-h-[200px] overflow-y-auto">
                  {previewData.map(
                    ([name, email, phone_number], index) => (
                      <div key={index} className="p-2">
                        <div className="flex gap-3">
                          <img
                            src={teacherImages[index]}
                            alt=""
                            className="w-10 h-10 rounded-full bg-background-neutral object-cover border-1 border-background-neutral"
                          />
                          <div>
                            <ThemedText variant="h4">{name}</ThemedText>
                            <ThemedText variant="caption">{email}</ThemedText>
                            <ThemedText variant="caption">
                              {phone_number ? ` - ${phone_number}` : ""}
                            </ThemedText>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowAddMultipleModal(false)}
                    className="px-4 py-2 rounded text-neutral-text-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addMultipleTeachersHandler}
                    className="bg-primary-base text-white px-4 py-2 rounded-md"
                  >
                    Add Teachers
                  </button>
                </div>
              </>
            ) : (
              <ThemedText className="text-sm text-neutral-text-secondary">
                Upload a CSV with header:{" "}
                <code>name,email,phone_number</code>
              </ThemedText>
            )}
          </div>
        </div>
      )}
      {showEditModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md min-w-[300px]">
            <h2 className="text-lg font-semibold mb-4">Edit Teacher</h2>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              placeholder="Name"
              className="w-full mb-2 p-2 border rounded text-black border-black"
              required
            />
            <input
              type="email"
              value={editForm.email}
              onChange={(e) =>
                setEditForm({ ...editForm, email: e.target.value })
              }
              placeholder="Email"
              className="w-full mb-2 p-2 border rounded text-black border-black"
              required
            />
            <input
              type="text"
              value={editForm.phone_number}
              onChange={(e) =>
                setEditForm({ ...editForm, phone_number: e.target.value })
              }
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-md min-w-[300px] text-center">
            <p className="mb-4">
              Are you sure you want to delete{" "}
              <strong>{selectedTeacher.user.name}</strong>?
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
    </div>
  );
};

export default ManageTeachers;