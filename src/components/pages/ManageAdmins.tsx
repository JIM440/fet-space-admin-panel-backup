import React, { useState } from "react";
import {
  useGetAdmins,
  useAddAdmin,
  useEditAdmin,
  useDeleteAdmin,
} from "../../hooks/useAdmin";
import FullScreenSpinner from "../commons/loader/FullScreenSpinner";
import ErrorComponent from "../commons/error/ErrorComponent";
import { Ellipsis } from "lucide-react";
import ThemedText from "@/components/commons/typography/ThemedText";

const adminImages = [
  "../../../src/assets/admins/fute.jpg",
  "../../../src/assets/admins/fozin.jpg",
  "../../../src/assets/admins/valerie.jpg",
  "../../../src/assets/admins/sop.jpg",
];

const ManageAdmins: React.FC = () => {
  const isSuperAdmin = localStorage.getItem("isSuperAdmin") || "false";
  console.log("isSuperAdmin:", isSuperAdmin);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { data: admins, isLoading, error, refetch } = useGetAdmins(page, limit);
  const { mutate: addAdmin } = useAddAdmin();
  const { mutate: editAdmin } = useEditAdmin();
  const { mutate: deleteAdmin } = useDeleteAdmin();

  const [showAddSingleModal, setShowAddSingleModal] = useState(false);
  const [singleAdminForm, setSingleAdminForm] = useState({
    name: "",
    email: "",
    phone_number: "",
  });
  const [selectedAdmin, setSelectedAdmin] = useState<any | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone_number: "",
  });

  const addSingleAdmin = () => {
    if (
      singleAdminForm.name &&
      singleAdminForm.email &&
      singleAdminForm.phone_number
    ) {
      addAdmin(
        { ...singleAdminForm, role: "Admin" },
        {
          onSuccess: () => {
            setSingleAdminForm({
              name: "",
              email: "",
              phone_number: "",
            });
            setShowAddSingleModal(false);
          },
          onError: (err) => {
            console.error("Add admin failed:", err);
            alert("Failed to add admin: " + err.message);
          },
        }
      );
    } else {
      alert("Please fill in all required fields.");
    }
  };

  const handleEdit = () => {
    if (selectedAdmin) {
      console.log("Selected admin for edit:", selectedAdmin);
      setEditForm({
        name: selectedAdmin.user.name,
        email: selectedAdmin.user.email,
        phone_number: selectedAdmin.user.phone_number || "",
      });
      setShowEditModal(true);
    }
  };

  const submitEdit = () => {
    if (selectedAdmin) {
      const adminId = selectedAdmin.user_id?.toString();
      console.log(`Submitting edit for admin ID: ${adminId}, Data:`, editForm);
      if (!adminId || isNaN(Number(adminId))) {
        console.error("Invalid admin ID:", adminId);
        alert("Invalid admin ID");
        return;
      }
      editAdmin(
        { adminId, data: editForm },
        {
          onSuccess: () => {
            console.log("Edit admin successful");
            setShowEditModal(false);
            setSelectedAdmin(null);
          },
          onError: (err) => {
            console.error("Edit admin failed:", err);
            alert("Failed to edit admin: " + err.message);
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
        console.error("Invalid admin ID:", adminId);
        alert("Invalid admin ID");
        return;
      }
      deleteAdmin(adminId, {
        onSuccess: () => {
          console.log("Delete admin successful");
          setShowConfirmDelete(false);
          setSelectedAdmin(null);
        },
        onError: (err) => {
          console.error("Delete admin failed:", err);
          alert("Failed to delete admin: " + err.message);
        },
      });
    }
  };

  if (isLoading) return <FullScreenSpinner />;
  if (error)
    return (
      <ErrorComponent
        message={`Error: ${error.message || "Failed to fetch admins"}`}
        onRetry={refetch}
      />
    );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <ThemedText variant="h2">All Admins</ThemedText>
        {isSuperAdmin === "true" && (
          <button
            onClick={() => setShowAddSingleModal(true)}
            className="bg-primary-base text-white p-2 rounded-md"
          >
            + Add Admin
          </button>
        )}
      </div>
      {/* admins list */}
      <div className="mt-5 md:mt-10">
        {admins?.map((admin, index) => (
          <div
            key={admin.user_id}
            className="p-2 mb-2 rounded flex justify-between items-center"
          >
            <div className="flex gap-3">
              <img
                src={adminImages[index] || ''}
                alt=""
                className="w-10 h-10 rounded-full bg-background-neutral object-cover"
              />
              <div>
                <ThemedText variant="h4">{admin.user.name}</ThemedText>
                <ThemedText variant="caption">{admin.user.email}</ThemedText>
              </div>
            </div>
            {isSuperAdmin === "true" && (
              <button
                onClick={() => setSelectedAdmin(admin)}
                className="text-neutral-text-secondary p-1 bg-background-neutral rounded-full"
              >
                <Ellipsis size={20} />
              </button>
            )}
          </div>
        ))}
      </div>
      {showAddSingleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background-main ite p-6 rounded shadow-md min-w-[200px] max-w-[600px] w-[80vw]">
            <ThemedText variant="h2" className="mb-4">
              Add Single Admin
            </ThemedText>
            <label
              htmlFor=""
              className="mb-2 text-xs text-neutral-text-secondary"
            >
              Name:
            </label>
            <input
              type="text"
              value={singleAdminForm.name}
              onChange={(e) =>
                setSingleAdminForm({ ...singleAdminForm, name: e.target.value })
              }
              placeholder="Enter admin name"
              className="w-full mb-2 p-2 rounded bg-background-neutral text-neutral-text-secondary"
              required
            />
            <label
              htmlFor=""
              className="mb-2 text-xs text-neutral-text-secondary"
            >
              Email:
            </label>
            <input
              type="email"
              value={singleAdminForm.email}
              onChange={(e) =>
                setSingleAdminForm({
                  ...singleAdminForm,
                  email: e.target.value,
                })
              }
              placeholder="Enter admin email"
              className="w-full mb-2 p-2 rounded bg-background-neutral text-neutral-text-secondary"
              required
            />
            <label
              htmlFor=""
              className="mb-2 text-xs text-neutral-text-secondary"
            >
              Phone Number:
            </label>
            <input
              type="email"
              value={singleAdminForm.email}
              onChange={(e) =>
                setSingleAdminForm({
                  ...singleAdminForm,
                  email: e.target.value,
                })
              }
              placeholder="Enter admin phone number"
              className="w-full mb-2 p-2 rounded bg-background-neutral text-neutral-text-secondary"
              required
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAddSingleModal(false)}
                className="text-neutral-text-secondary px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={addSingleAdmin}
                className="bg-primary-base text-white px-4 py-2 rounded-md"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md min-w-[300px]">
            <h2 className="text-lg font-semibold mb-4">Edit Admin</h2>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              placeholder="Name"
              className="w-full mb-4 p-2 rounded bg-background-neutral text-neutral-text-secondary"
              required
            />
            <input
              type="email"
              value={editForm.email}
              onChange={(e) =>
                setEditForm({ ...editForm, email: e.target.value })
              }
              placeholder="Email"
              className="w-full mb-4 p-2 rounded bg-background-neutral text-neutral-text-secondary"
              required
            />
            <input
              type="text"
              value={editForm.phone_number}
              onChange={(e) =>
                setEditForm({ ...editForm, phone_number: e.target.value })
              }
              placeholder="Phone Number (optional)"
              className="w-full mb-2 p-2 border rounded"
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
      {showConfirmDelete && selectedAdmin && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-md min-w-[300px] text-center">
            <p className="mb-4">
              Are you sure you want to delete{" "}
              <strong>{selectedAdmin.user.name}</strong>?
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
