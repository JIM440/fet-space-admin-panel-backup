import React, { useState, useRef, useEffect } from "react";
import {
  useGetStudents,
  useSearchStudents,
  useAddStudent,
  useAddMultipleStudents,
  useEditStudent,
  useDeleteStudent,
} from "../../hooks/useAdmin";
import FullScreenSpinner from "../commons/loader/FullScreenSpinner";
import ErrorComponent from "../commons/error/ErrorComponent";
import { Ellipsis, Search } from "lucide-react";
import ThemedText from "../commons/typography/ThemedText";

const studentImages = [
  "../../../src/assets/students/student1.jpg",
  "../../../src/assets/students/student12.jpg",
  "../../../src/assets/students/student3.jpg",
  "../../../src/assets/students/student13.jpg",
  "../../../src/assets/students/student4.jpg",
  "../../../src/assets/students/student5.jpg",
  "../../../src/assets/students/student6.jpg",
  "../../../src/assets/students/student7.jpg",
  "../../../src/assets/students/student8.jpg",
  "../../../src/assets/students/student9.jpg",
  "../../../src/assets/students/student10.jpg",
  "../../../src/assets/students/student11.jpg",
  "../../../src/assets/students/student7.jpg",
  "../../../src/assets/students/student8.jpg",
  "../../../src/assets/students/student9.jpg",
  "../../../src/assets/students/student10.jpg",
  "../../../src/assets/students/student11.jpg",
  "../../../src/assets/students/student1.jpg",
  "../../../src/assets/students/student12.jpg",
  "../../../src/assets/students/student3.jpg",
  "../../../src/assets/students/student13.jpg",
  "../../../src/assets/students/student4.jpg",
  "../../../src/assets/students/student5.jpg",
  "../../../src/assets/students/student6.jpg",
  "../../../src/assets/students/student7.jpg",
  "../../../src/assets/students/student8.jpg",
  "../../../src/assets/students/student9.jpg",
  "../../../src/assets/students/student10.jpg",
  "../../../src/assets/students/student11.jpg",
  "../../../src/assets/students/student7.jpg",
  "../../../src/assets/students/student8.jpg",
  "../../../src/assets/students/student9.jpg",
  "../../../src/assets/students/student10.jpg",
  "../../../src/assets/students/student11.jpg",
];

const ManageStudents: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputQuery, setInputQuery] = useState("");
  const {
    data: students,
    isLoading,
    error,
    refetch,
  } = useGetStudents(page, limit);
  const { data: searchedStudents, isLoading: isSearchLoading } =
    useSearchStudents(searchQuery);
  const { mutate: addStudent } = useAddStudent();
  const { mutate: addMultipleStudents, isPending: isAddingMultipleStudents } =
    useAddMultipleStudents();
  const { mutate: editStudent } = useEditStudent();
  const { mutate: deleteStudent } = useDeleteStudent();

  const [showAddChoiceModal, setShowAddChoiceModal] = useState(false);
  const [showAddSingleModal, setShowAddSingleModal] = useState(false);
  const [showAddMultipleModal, setShowAddMultipleModal] = useState(false);
  const [singleStudentForm, setSingleStudentForm] = useState({
    name: "",
    email: "",
    matricule_number: "",
    level: "",
    institutional_email: "",
    phone_number: "",
    nationality: "",
  });
  const [previewData, setPreviewData] = useState<string[][]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    matricule_number: "",
    level: "",
    institutional_email: "",
    phone_number: "",
    nationality: "",
  });
  const [addButtonPosition, setAddButtonPosition] = useState({
    top: 0,
    left: 0,
  });
  const [ellipsisPosition, setEllipsisPosition] = useState({ top: 0, left: 0 });
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const ellipsisRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

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
          .filter((row) => row.length >= 7);
        if (rows.length <= 1) {
          alert(
            "CSV file must contain at least one data row after the header."
          );
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
      singleStudentForm.matricule_number &&
      singleStudentForm.level &&
      singleStudentForm.institutional_email &&
      singleStudentForm.nationality
    ) {
      addStudent(
        { ...singleStudentForm, role: "Student" },
        {
          onSuccess: () => {
            setSingleStudentForm({
              name: "",
              email: "",
              matricule_number: "",
              level: "",
              institutional_email: "",
              phone_number: "",
              nationality: "",
            });
            setShowAddSingleModal(false);
            alert(
              "Student added successfully. Their default password is their matricule number."
            );
          },
          onError: (err) => {
            console.error("Add student failed:", err);
            alert("Failed to add student: " + err.message);
          },
        }
      );
    } else {
      alert("Please fill in all required fields.");
    }
  };

  const addMultipleStudentsHandler = () => {
    const users = previewData.map(
      ([
        name,
        email,
        matricule_number,
        level,
        institutional_email,
        phone_number,
        nationality,
      ]) => ({
        name,
        email,
        matricule_number,
        level: level.startsWith("L") ? level : `L${level}`,
        institutional_email,
        phone_number: phone_number || undefined,
        nationality: nationality || undefined,
        role: "Student",
      })
    );
    console.log("Sending payload:", { users });
    addMultipleStudents(
      { users },
      {
        onSuccess: () => {
          setPreviewData([]);
          setShowAddMultipleModal(false);
          alert(
            "Students added successfully. Their default password is their matricule number."
          );
        },
        onError: (err) => {
          console.error("Add multiple students failed:", err);
          alert("Failed to add students: " + err.message);
        },
      }
    );
  };

  const handleEdit = () => {
    if (selectedStudent) {
      console.log("Selected student for edit:", selectedStudent);
      setEditForm({
        name: selectedStudent.user.name,
        email: selectedStudent.user.email,
        matricule_number: selectedStudent.matricule_number,
        level: selectedStudent.level,
        institutional_email: selectedStudent.institutional_email,
        phone_number: selectedStudent.user.phone_number || "",
        nationality: selectedStudent.nationality || "",
      });
      setShowEditModal(true);
    }
  };

  const submitEdit = () => {
    if (selectedStudent) {
      const studentId = selectedStudent.user_id?.toString();
      console.log(
        `Submitting edit for student ID: ${studentId}, Data:`,
        editForm
      );
      if (!studentId || isNaN(Number(studentId))) {
        console.error("Invalid student ID:", studentId);
        alert("Invalid student ID");
        return;
      }
      editStudent(
        { studentId, data: editForm },
        {
          onSuccess: () => {
            console.log("Edit student successful");
            setShowEditModal(false);
            setSelectedStudent(null);
          },
          onError: (err) => {
            console.error("Edit student failed:", err);
            alert("Failed to edit student: " + err.message);
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
        console.error("Invalid student ID:", studentId);
        alert("Invalid student ID");
        return;
      }
      deleteStudent(studentId, {
        onSuccess: () => {
          console.log("Delete student successful");
          setShowConfirmDelete(false);
          setSelectedStudent(null);
        },
        onError: (err) => {
          console.error("Delete student failed:", err);
          alert("Failed to delete student: " + err.message);
        },
      });
    }
  };

  // Calculate position for Add Choice pop-up
  useEffect(() => {
    if (showAddChoiceModal && addButtonRef.current) {
      const rect = addButtonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const popupWidth = 200; // Approximate width of the pop-up
      const offsetX = 10; // Space from button
      const offsetY = 5; // Space below button
      let left = rect.right + offsetX;
      const top = rect.bottom + offsetY;

      // Prevent pop-up from going off-screen
      if (left + popupWidth > viewportWidth) {
        left = rect.left - popupWidth - offsetX;
      }

      setAddButtonPosition({ top, left });
    }
  }, [showAddChoiceModal]);

  // Calculate position for Edit/Delete pop-up
  const handleEllipsisClick = (student: any, studentId: number) => {
    const ellipsisButton = ellipsisRefs.current.get(studentId);
    if (ellipsisButton) {
      const rect = ellipsisButton.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const popupWidth = 200; // Approximate width of the pop-up
      const offsetX = 10; // Space from button
      const offsetY = 5; // Space below button
      let left = rect.right + offsetX;
      const top = rect.bottom + offsetY;

      // Prevent pop-up from going off-screen
      if (left + popupWidth > viewportWidth) {
        left = rect.left - popupWidth - offsetX;
      }

      setEllipsisPosition({ top, left });
    }
    setSelectedStudent(student);
  };

  const displayStudents = searchQuery ? searchedStudents : students;

  if (isLoading || isSearchLoading) return <FullScreenSpinner />;
  if (error)
    return (
      <ErrorComponent message={`Error: ${error.message}`} onRetry={refetch} />
    );

  return (
    <div>
      <div className="flex justify-between mb-4 gap-4">
        <select className="bg-background-neutral text-neutral-text-secondary p-2 rounded-md">
          <option>All Students</option>
        </select>
        <button
          ref={addButtonRef}
          onClick={() => setShowAddChoiceModal(true)}
          className="bg-primary-base text-white p-2 rounded-md"
        >
          + Add Student
        </button>
      </div>
      <div className="flex mb-4 bg-background-neutral mt-5 md:mt-10 text-neutral-text-secondary rounded-full px-4">
        <input
          type="text"
          placeholder="Search by name or matricule"
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
      <ThemedText variant="h3" className="mb-4 ml-2">
        {displayStudents.length || 0} Students
      </ThemedText>
      {displayStudents?.map((student, index) => (
        <div
          key={student.user_id}
          className="p-2 mb-2 rounded flex justify-between items-center"
        >
          <div className="flex gap-3">
            <img
              src={studentImages[index]}
              alt=""
              className="w-10 h-10 rounded-full bg-background-neutral object-cover border-1 border-background-neutral"
            />
            <div>
              <ThemedText variant="h4">{student.user.name}</ThemedText>
              <ThemedText variant="caption">
                {student.matricule_number.toUpperCase() + " - "}
              </ThemedText>
              <ThemedText variant="caption">
                {student.institutional_email}
              </ThemedText>
            </div>
          </div>
          <button
            ref={(el) => {
              if (el) {
                ellipsisRefs.current.set(student.user_id, el);
              } else {
                ellipsisRefs.current.delete(student.user_id);
              }
            }}
            onClick={() => handleEllipsisClick(student, student.user_id)}
            className="text-neutral-text-secondary p-1 bg-background-neutral rounded-full"
          >
            <Ellipsis size={20} />
          </button>
        </div>
      ))}
      {showAddChoiceModal && (
        <div
          className="absolute bg-white p-4 rounded shadow-md z-20"
          style={{
            top: `${addButtonPosition.top}px`,
            left: `${addButtonPosition.left}px`,
            width: "200px",
          }}
        >
          <button
            onClick={() => {
              setShowAddSingleModal(true);
              setShowAddChoiceModal(false);
            }}
            className="block mb-2 text-left w-full text-black"
          >
            Add Single
          </button>
          <button
            onClick={() => {
              setShowAddMultipleModal(true);
              setShowAddChoiceModal(false);
            }}
            className="block mb-2 text-left w-full text-black"
          >
            Add Multiple
          </button>
          <button
            onClick={() => setShowAddChoiceModal(false)}
            className="block mt-2 text-gray-500 text-sm"
          >
            Close
          </button>
        </div>
      )}
      {showAddSingleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background-main p-6 rounded shadow-md min-w-[200px] w-[80%] max-w-[600px] h-[80vh] max-h-[500px] overflow-y-auto">
            <ThemedText variant="h2" className="mb-4">
              Add Single Student
            </ThemedText>
            <label
              htmlFor=""
              className="text-sm text-neutral-text-secondary mb-2"
            >
              Name:
            </label>
            <input
              type="text"
              value={singleStudentForm.name}
              onChange={(e) =>
                setSingleStudentForm({
                  ...singleStudentForm,
                  name: e.target.value,
                })
              }
              placeholder="Name"
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
              value={singleStudentForm.email}
              onChange={(e) =>
                setSingleStudentForm({
                  ...singleStudentForm,
                  email: e.target.value,
                })
              }
              placeholder="Email"
              className="w-full p-2 rounded text-neutral-text-secondary bg-background-neutral mb-4"
              required
            />
            <label className="text-sm text-neutral-text-secondary mb-2">
              Matricule:
            </label>
            <input
              type="text"
              value={singleStudentForm.matricule_number}
              onChange={(e) =>
                setSingleStudentForm({
                  ...singleStudentForm,
                  matricule_number: e.target.value,
                })
              }
              placeholder="Matricule Number"
              className="w-full p-2 rounded text-neutral-text-secondary bg-background-neutral mb-4"
              required
            />
            <label className="text-sm text-neutral-text-secondary mb-2">
              Level:
            </label>
            <input
              type="text"
              value={singleStudentForm.level}
              onChange={(e) =>
                setSingleStudentForm({
                  ...singleStudentForm,
                  level: e.target.value,
                })
              }
              placeholder="Level (e.g., 200)"
              className="w-full p-2 rounded text-neutral-text-secondary bg-background-neutral mb-4"
              required
            />
            <label className="text-sm text-neutral-text-secondary mb-2">
              Institutional Email:
            </label>
            <input
              type="email"
              value={singleStudentForm.institutional_email}
              onChange={(e) =>
                setSingleStudentForm({
                  ...singleStudentForm,
                  institutional_email: e.target.value,
                })
              }
              placeholder="Enter Institutional Email"
              className="w-full p-2 rounded text-neutral-text-secondary bg-background-neutral mb-4"
              required
            />
            <label className="text-sm text-neutral-text-secondary mb-2">
              Phone:
            </label>
            <input
              type="text"
              value={singleStudentForm.phone_number}
              onChange={(e) =>
                setSingleStudentForm({
                  ...singleStudentForm,
                  phone_number: e.target.value,
                })
              }
              placeholder="Enter phone number (optional)"
              className="w-full p-2 rounded text-neutral-text-secondary bg-background-neutral mb-4"
            />
            <label className="text-sm text-neutral-text-secondary mb-2">
              Nationality:
            </label>
            <input
              type="text"
              value={singleStudentForm.nationality}
              onChange={(e) =>
                setSingleStudentForm({
                  ...singleStudentForm,
                  nationality: e.target.value,
                })
              }
              placeholder="Enter nationality"
              className="w-full p-2 rounded text-neutral-text-secondary bg-background-neutral mb-4"
              required
            />
            <ThemedText className="text-sm text-neutral-text-secondary mb-4">
              Note: The default password will be the matricule number.
            </ThemedText>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAddSingleModal(false)}
                className="px-4 py-2 rounded text-neutral-text-secondary"
              >
                Cancel
              </button>
              <button
                onClick={addSingleStudent}
                className="bg-primary-base text-white px-4 py-2 rounded-md"
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
              Add Multiple Students
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
                  Preview ({previewData.length} students){" "}
                </ThemedText>
                <div className="space-y-2 mb-4 max-h-[200px] overflow-y-auto">
                  {previewData.map(
                    (
                      [
                        name,
                        email, // Skip password field
                        ,
                        matricule_number,
                        level,
                        institutional_email,
                        phone_number,
                        nationality,
                      ],
                      index
                    ) => (
                      <div key={index} className="p-2 rounded">
                        <div className="flex gap-3">
                          <img
                            src={studentImages[index]}
                            alt=""
                            className="w-10 h-10 rounded-full bg-background-neutral object-cover border-1 border-background-neutral"
                          />
                          <div>
                            <ThemedText variant="h4">{name}</ThemedText>
                            <ThemedText variant="caption">
                              {email + " - "}
                            </ThemedText>
                            <ThemedText variant="caption">
                              {matricule_number} -{" "}
                            </ThemedText>
                            <ThemedText variant="caption">
                              {level} - {institutional_email}{" "}
                              {phone_number ? `- ${phone_number}` : ""}{" "}
                              {nationality ? `- ${nationality}` : ""}
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
                    onClick={addMultipleStudentsHandler}
                    className="bg-primary-base text-white px-4 py-2 rounded-md"
                    disabled={
                      previewData.length === 0 || isAddingMultipleStudents
                    }
                  >
                    Add Students
                  </button>
                </div>
              </>
            ) : (
              <ThemedText className="text-sm text-neutral-text-secondary">
                Upload a CSV with header:{" "}
                <code>
                  name,email,matricule_number,level,institutional_email,phone_number,nationality
                </code>
                <br />
                Note: The default password for each student will be their
                matricule number.
              </ThemedText>
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
              value={editForm.matricule_number}
              onChange={(e) =>
                setEditForm({ ...editForm, matricule_number: e.target.value })
              }
              placeholder="Matricule Number"
              className="w-full mb-2 p-2 border rounded text-black border-black"
              required
            />
            <input
              type="text"
              value={editForm.level}
              onChange={(e) =>
                setEditForm({ ...editForm, level: e.target.value })
              }
              placeholder="Level"
              className="w-full mb-2 p-2 border rounded text-black border-black"
              required
            />
            <input
              type="email"
              value={editForm.institutional_email}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  institutional_email: e.target.value,
                })
              }
              placeholder="Institutional Email"
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
              className="w-full p-2 rounded text-neutral-text-secondary bg-background-neutral mb-4"
            />
            <input
              type="text"
              value={editForm.nationality}
              onChange={(e) =>
                setEditForm({ ...editForm, nationality: e.target.value })
              }
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
                className="bg-primary-base text-white px-4 py-2 rounded"
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
              Are you sure you want to delete{" "}
              <strong>{selectedStudent.user.name}</strong>?
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
        <div
          className="absolute bg-white p-4 rounded shadow-md z-20"
          style={{
            top: `${ellipsisPosition.top}px`,
            left: `${ellipsisPosition.left}px`,
            width: "200px",
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
