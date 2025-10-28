import React, { useEffect, useState, useMemo } from "react";
import Axios from "../utils/Axios";
import AxiosToastError from "../utils/AxiosToastError";
import toast from "react-hot-toast";
import { createColumnHelper } from "@tanstack/react-table";
import UsersDisplayTable from "../components/UsersDisplayTable";
import ConfirmBox from "../components/CofirmBox";
import SummaryApi from "../common/SummaryApi";
import { HiPencil } from "react-icons/hi";
import { MdDelete, MdVisibility } from "react-icons/md";

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const [deleteUser, setDeleteUser] = useState(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  const [openViewDetails, setOpenViewDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");

  const columnHelper = createColumnHelper();

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await Axios({...SummaryApi.getUsersTable });
      const { data } = res;
      console.debug('fetchUsers response:', data)
      if (data?.success) setUsers(data.data || []);
      else toast.error(data?.message || "Failed to load users");
    } catch (err) {
      AxiosToastError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const name = (u.name || "").toLowerCase();
      return (
        name.includes(q) 
      );
    });
  }, [users, search]);

  // debug counts
  useEffect(() => {
    console.debug('users count:', users.length, 'filtered count:', filteredUsers.length)
  }, [users, filteredUsers])

  const handleDelete = async () => {
    if (!deleteUser) return;
    try {
      const res = await Axios({
        ...SummaryApi.deleteUser,
        method: "delete",
        data: { _id: deleteUser._id },
      });
      const { data } = res;
      if (data?.success) {
        toast.success(data.message);
        fetchUsers();
        setOpenDeleteConfirm(false);
      } else toast.error(data?.message || "Delete failed");
    } catch (err) {
      AxiosToastError(err);
    }
  };

  // Table columns
  const columns = [
    columnHelper.accessor("name", {
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium text-gray-800">{row.original.name}</span>
      ),
    }),
    columnHelper.accessor("role", {
      header: "Role",
      cell: ({ row }) => {
        const role = row.original.role?.toUpperCase() || "UNKNOWN";
        const roleStyles = {
          ADMIN: "bg-purple-100 text-purple-700",
          SELLER: "bg-blue-100 text-blue-700",
          BUYER: "bg-green-100 text-green-700",
          COOPERATIVE: "bg-yellow-100 text-yellow-700",
        };
        return (
          <span
            className={`px-2 py-1 text-xs font-semibold rounded ${
              roleStyles[role] || "bg-gray-100 text-gray-700"
            }`}
          >
            {role}
          </span>
        );
      },
    }),
    columnHelper.accessor("_id", {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => {
              setSelectedUser(row.original);
              setOpenViewDetails(true);
            }}
            className="p-2 bg-gray-100 rounded-full text-gray-600 hover:text-gray-800"
            title="View Details"
          >
            <MdVisibility size={18} />
          </button>

          <button
            onClick={() => {
              setEditUser(row.original);
              setOpenEdit(true);
            }}
            className="p-2 bg-green-100 rounded-full hover:text-green-600"
            title="Edit"
          >
            <HiPencil size={18} />
          </button>

          <button
            onClick={() => {
              setDeleteUser(row.original);
              setOpenDeleteConfirm(true);
            }}
            className="p-2 bg-red-100 rounded-full text-red-500 hover:text-red-600"
            title="Delete"
          >
            <MdDelete size={18} />
          </button>
        </div>
      ),
    }),
  ];

  // Create / Edit form
  const UserForm = ({ user, onClose, onSaved }) => {
    const [form, setForm] = useState({
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || "BUYER",
      password: user?.password || "",
    });
    const [saving, setSaving] = useState(false);

    const handleChange = (e) =>
      setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        setSaving(true);
        const api = user
          ? {
              url: "/api/user/update-user",
              method: "put",
              data: { ...form, _id: user._id },
            }
          : {
              url: "/api/user/register",
              method: "post",
              data: form,
            };
        const res = await Axios(api);
        const { data } = res;
        if (data?.success) {
          toast.success(data.message);
          onSaved && onSaved();
          onClose();
        } else toast.error(data?.message || "Save failed");
      } catch (err) {
        AxiosToastError(err);
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-5 rounded w-full max-w-md shadow-lg"
        >
          <h3 className="font-semibold mb-3 text-lg">
            {user ? "Edit User" : "Add New User"}
          </h3>

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
            className="w-full p-2 mb-2 border rounded"
            required
          />
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full p-2 mb-2 border rounded"
            type="email"
            required
          />
          {!user && (
            <input
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full p-2 mb-2 border rounded"
              type="password"
              required
            />
          )}
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full p-2 mb-4 border rounded"
          >
            <option value="BUYER">BUYER</option>
            <option value="SELLER">SELLER</option>
            <option value="ADMIN">ADMIN</option>
            <option value="COOPERATIVE">COOPERATIVE</option>
          </select>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    );
  };

  // View details modal (includes email)
  const ViewDetailsModal = ({ user, onClose }) => {
    if (!user) return null;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-5 w-full max-w-md">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg">User Details</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Role:</strong> {user.role}
            </p>
            <p>
              <strong>ID:</strong> {user._id}
            </p>
            {user.createdAt && (
              <p>
                <strong>Created At:</strong>{" "}
                {new Date(user.createdAt).toLocaleString()}
              </p>
            )}
          </div>
          <div className="mt-4 text-right">
            <button
              onClick={onClose}
              className="px-3 py-1 border rounded text-sm hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-3 mb-4 rounded-md shadow">
        <div className="flex items-center gap-4">
          <h2 className="font-semibold text-lg">Users Table</h2>
        </div>
        <div className="flex gap-2 items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name"
            className="p-2 border rounded w-64"
          />
          <button
            onClick={() => setOpenCreate(true)}
            className="px-4 py-1 text-sm border border-yellow-400 text-yellow-600 rounded-full hover:bg-yellow-50"
          >
            Add User
          </button>
          <button
            onClick={fetchUsers}
            className="px-4 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Table box */}
      <div className="border-2 border-dashed border-blue-100 bg-blue-50/50 rounded-md p-4 min-h-[200px]">
        {filteredUsers.length === 0 ? (
          <p className="text-center text-gray-500">No users available.</p>
        ) : (
          <UsersDisplayTable data={filteredUsers} column={columns} loading={loading} />
        )}
      </div>

      {/* Modals */}
      {openCreate && (
        <UserForm onClose={() => setOpenCreate(false)} onSaved={fetchUsers} />
      )}
      {openEdit && (
        <UserForm
          user={editUser}
          onClose={() => {
            setOpenEdit(false);
            setEditUser(null);
          }}
          onSaved={fetchUsers}
        />
      )}
      {openDeleteConfirm && (
        <ConfirmBox
          cancel={() => setOpenDeleteConfirm(false)}
          close={() => setOpenDeleteConfirm(false)}
          confirm={handleDelete}
        />
      )}
      {openViewDetails && (
        <ViewDetailsModal
          user={selectedUser}
          onClose={() => setOpenViewDetails(false)}
        />
      )}
    </section>
  );
};

export default UsersTable;
