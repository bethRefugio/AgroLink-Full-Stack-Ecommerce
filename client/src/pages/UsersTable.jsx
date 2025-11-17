import React, { useEffect, useMemo, useState } from "react"
import Axios from "../utils/Axios"
import AxiosToastError from "../utils/AxiosToastError"
import toast from "react-hot-toast"
import { createColumnHelper } from "@tanstack/react-table"
import DisplayTable from "../components/DisplayTable"
import ConfirmBox from "../components/CofirmBox"
import SummaryApi from "../common/SummaryApi"
import { HiPencil } from "react-icons/hi"
import { MdDelete, MdVisibility } from "react-icons/md"
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6"
import { IoSearch } from "react-icons/io5"

const UsersTable = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)

  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [editUser, setEditUser] = useState(null)

  const [deleteUser, setDeleteUser] = useState(null)
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false)

  const [openViewDetails, setOpenViewDetails] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [search, setSearch] = useState("")

  const columnHelper = createColumnHelper()

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await Axios({ ...SummaryApi.getUsersTable })
      const { data } = res
      if (data?.success) setUsers(data.data || [])
      else toast.error(data?.message || "Failed to load users")
    } catch (err) {
      AxiosToastError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Search similar to SubCategoryPage: scan multiple fields
  const filteredUsers = useMemo(() => {
    const q = (search || "").trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => {
      const name = (u.name || "").toLowerCase()
      const email = (u.email || "").toLowerCase()
      const role = (u.role || "").toLowerCase()
      return name.includes(q) || email.includes(q) || role.includes(q)
    })
  }, [users, search])

  const handleDelete = async () => {
    if (!deleteUser) return
    try {
      const res = await Axios({
        ...SummaryApi.deleteUser,
        method: "delete",
        data: { _id: deleteUser._id },
      })
      const { data } = res
      if (data?.success) {
        toast.success(data.message)
        fetchUsers()
        setOpenDeleteConfirm(false)
      } else toast.error(data?.message || "Delete failed")
    } catch (err) {
      AxiosToastError(err)
    }
  }

  const columns = [
    columnHelper.display({
      id: "serialNumber",
      header: "No.",
      cell: ({ row }) => (
        <div className="text-gray-700 font-medium">{row.index + 1}</div>
      ),
    }),
    columnHelper.accessor("name", {
      header: "NAME",
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">{row.original.name}</span>
      ),
    }),
    columnHelper.accessor("email", {
      header: "EMAIL",
      cell: ({ row }) => (
        <span className="text-gray-700">{row.original.email}</span>
      ),
    }),
    columnHelper.accessor("role", {
      header: "ROLE",
      cell: ({ row }) => {
        const role = row.original.role?.toUpperCase() || "UNKNOWN"
        const roleStyles = {
          ADMIN: "bg-purple-100 text-purple-700",
          SELLER: "bg-blue-100 text-blue-700",
          BUYER: "bg-green-100 text-green-700",
          COOPERATIVE: "bg-yellow-100 text-yellow-700",
        }
        return (
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              roleStyles[role] || "bg-gray-100 text-gray-700"
            }`}
          >
            {role}
          </span>
        )
      },
    }),
    columnHelper.accessor("_id", {
      header: "ACTION",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedUser(row.original)
              setOpenViewDetails(true)
            }}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="View Details"
          >
            <MdVisibility size={22} />
          </button>

          <button
            onClick={() => {
              setEditUser(row.original)
              setOpenEdit(true)
            }}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Edit"
          >
            <HiPencil size={22} />
          </button>

          <button
            onClick={() => {
              setDeleteUser(row.original)
              setOpenDeleteConfirm(true)
            }}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Delete"
          >
            <MdDelete size={22} />
          </button>
        </div>
      ),
    }),
  ]

  const UserForm = ({ user, onClose, onSaved }) => {
    const [form, setForm] = useState({
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || "BUYER",
      password: user?.password || "",
    })
    const [saving, setSaving] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const handleChange = (e) =>
      setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

    const handleSubmit = async (e) => {
      e.preventDefault()
      try {
        setSaving(true)
        const api = user
          ? {
              ...SummaryApi.adminUpdateUser,
              data: { ...form, _id: user._id },
            }
          : {
              ...SummaryApi.register,
              data: form,
            }
        const res = await Axios(api)
        const { data } = res
        if (data?.success) {
          toast.success(data.message)
          onSaved && onSaved()
          onClose()
        } else toast.error(data?.message || "Save failed")
      } catch (err) {
        AxiosToastError(err)
      } finally {
        setSaving(false)
      }
    }

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-lg text-gray-900">
              {user ? "Edit User" : "Add New User"}
            </h3>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                type="email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder={user ? "Leave blank to keep current" : "Enter password"}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  type={showPassword ? "text" : "password"}
                  required={!user}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaRegEye size={18} /> : <FaRegEyeSlash size={18} />}
                </button>
              </div>
              {user && (
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to keep the current password
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="BUYER">BUYER</option>
                <option value="SELLER">SELLER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="COOPERATIVE">COOPERATIVE</option>
              </select>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const ViewDetailsModal = ({ user, onClose }) => {
    if (!user) return null
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h3 className="font-semibold text-lg text-gray-900">User Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6 space-y-3">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium text-gray-900">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-medium text-gray-900">{user.role}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">User ID</p>
              <p className="font-medium text-gray-900 text-xs">{user._id}</p>
            </div>
            {user.createdAt && (
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium text-gray-900">
                  {new Date(user.createdAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
          <div className="p-6 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="max-w-full p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Users Table</h1>
        <p className="text-sm text-gray-500">Manage your system users</p>
      </div>

      {/* Search and Actions Bar (same style as SubCategoryPage) */}
      <div className="bg-white p-4 mb-6 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xs">
          <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search name, email or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpenCreate(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add User
          </button>
        </div>
      </div>

      {/* Table Container using DisplayTable style */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No users available.</div>
          ) : (
            <DisplayTable data={filteredUsers} column={columns} />
          )}
        </div>
      </div>

      {search && (
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredUsers.length} of {users.length} results
        </div>
      )}

      {openCreate && (
        <UserForm onClose={() => setOpenCreate(false)} onSaved={fetchUsers} />
      )}
      {openEdit && (
        <UserForm
          user={editUser}
          onClose={() => {
            setOpenEdit(false)
            setEditUser(null)
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
        <ViewDetailsModal user={selectedUser} onClose={() => setOpenViewDetails(false)} />
      )}
    </section>
  )
}

export default UsersTable