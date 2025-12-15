import React, { useEffect, useMemo, useState } from "react"
import Axios from "../utils/Axios"
import AxiosToastError from "../utils/AxiosToastError"
import toast from "react-hot-toast"
import { createColumnHelper } from "@tanstack/react-table"
import DisplayTable from "../components/DisplayTable"
import ConfirmBox from "../components/ConfirmBox"
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
  const [selectedRole, setSelectedRole] = useState("") // ⭐ NEW ROLE FILTER
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20




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




  // ⭐ ROLE LIST (unique roles)
  const roleOptions = useMemo(() => {
    const set = new Set()
    users.forEach((u) => u.role && set.add(u.role))
    return Array.from(set)
  }, [users])




  // ⭐ FILTERING USERS
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)




      const matchesRole = selectedRole ? u.role === selectedRole : true




      return matchesSearch && matchesRole
    })
  }, [users, search, selectedRole])


  // reset page when filters or users change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, selectedRole, users])


  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))


  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredUsers.slice(start, start + pageSize)
  }, [filteredUsers, currentPage])




  // DELETE
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




  // COLUMNS
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
      cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.name}</span>,
    }),
    columnHelper.accessor("email", {
      header: "EMAIL",
      cell: ({ row }) => <span className="text-gray-700">{row.original.email}</span>,
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
            className="text-gray-500 hover:text-gray-700"
            title="View Details"
          >
            <MdVisibility size={22} />
          </button>




          <button
            onClick={() => {
              setEditUser(row.original)
              setOpenEdit(true)
            }}
            className="text-gray-500 hover:text-gray-700"
            title="Edit"
          >
            <HiPencil size={22} />
          </button>




          <button
            onClick={() => {
              setDeleteUser(row.original)
              setOpenDeleteConfirm(true)
            }}
            className="text-gray-500 hover:text-gray-700"
            title="Delete"
          >
            <MdDelete size={22} />
          </button>
        </div>
      ),
    }),
  ]




  // USER FORM COMPONENT
  const UserForm = ({ user, onClose, onSaved }) => {
    const [form, setForm] = useState({
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || "BUYER",
      password: "",
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
          ? { ...SummaryApi.adminUpdateUser, data: { ...form, _id: user._id } }
          : { ...SummaryApi.register, data: form }
        const res = await Axios(api)
        const { data } = res
        if (data?.success) {
          toast.success(data.message)
          onSaved?.()
          onClose()
        } else toast.error(data?.message)
      } catch (err) {
        AxiosToastError(err)
      } finally {
        setSaving(false)
      }
    }




    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-x-hidden">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
          <div className="p-6 border-b">
            <h3 className="font-semibold text-lg">{user ? "Edit User" : "Add New User"}</h3>
          </div>




          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* NAME */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>




            {/* EMAIL */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
                type="email"
                required
              />
            </div>




            {/* PASSWORD */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  className="w-full px-3 py-2 border rounded-lg pr-10"
                  placeholder={user ? "Leave blank to keep current" : "Enter password"}
                  required={!user}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                </button>
              </div>
            </div>




            {/* ROLE */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="BUYER">BUYER</option>
                <option value="SELLER">SELLER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="COOPERATIVE">COOPERATIVE</option>
              </select>
            </div>




            {/* ACTIONS */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }




  // VIEW DETAILS MODAL
  const ViewDetailsModal = ({ user, onClose }) => {
    if (!user) return null




    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
          <div className="flex justify-between items-center p-6 border-b">
            <h3 className="font-semibold text-lg">User Details</h3>
            <button onClick={onClose} className="text-gray-500">✕</button>
          </div>




          <div className="p-6 space-y-3">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>ID:</strong> {user._id}</p>
            {user.createdAt && (
              <p><strong>Created:</strong> {new Date(user.createdAt).toLocaleString()}</p>
            )}
          </div>




          <div className="p-6 border-t flex justify-end">
            <button onClick={onClose} className="px-4 py-2 border rounded-lg">Close</button>
          </div>
        </div>
      </div>
    )
  }




  return (
    <section className="max-w-full p-6">




      {/* PAGE HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Users Table</h1>
        <p className="text-sm text-gray-500">Manage your system users</p>
      </div>




      {/* ⭐ STICKY SEARCH / ROLE FILTER / ADD BUTTON (updated structure) */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b mb-6">
        <div className="py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">




          {/* SEARCH FIELD */}
          <div className="relative w-full max-w-full sm:max-w-sm">
            <IoSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search name, email, role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-blue-500
                        focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>




          {/* ROLE FILTER + ADD USER BUTTON — one row in mobile */}
          <div className="flex w-full sm:w-auto items-center gap-2">




            {/* Role Dropdown */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg
                        text-sm bg-white focus:outline-none focus:ring-2
                        focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>




            {/* Add User Button */}
            <button
              onClick={() => setOpenCreate(true)}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600
                        rounded-lg hover:bg-blue-700 transition-colors flex items-center
                        gap-2 whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add User
            </button>




          </div>
        </div>
      </div>




      {/* TABLE */}
      <div className="bg-white rounded-lg border overflow-hidden mb-6 sm:mb-6">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No users found.</div>
          ) : (
            <DisplayTable data={paginatedUsers} column={columns} />
          )}
        </div>
      </div>


      {/* Pagination controls (rendered outside the table container) */}
      {filteredUsers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-3 mb-6 text-sm">
          <span>
            Showing{" "}
            <strong>
              {filteredUsers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              {" - "}
              {Math.min(currentPage * pageSize, filteredUsers.length)}
            </strong>{" "}
            of {filteredUsers.length}
          </span>


          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}




      {/* RESULTS COUNT */}
      {search && (
        <p className="mt-3 text-sm text-gray-600">
          Showing {filteredUsers.length} of {users.length} results
        </p>
      )}


      {/* Small spacer after pagination/results to keep footer off-screen */}
      {filteredUsers.length > 0 && <div className="h-6" />}




      {/* MODALS */}
      {openCreate && <UserForm onClose={() => setOpenCreate(false)} onSaved={fetchUsers} />}
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
        <ViewDetailsModal
          user={selectedUser}
          onClose={() => setOpenViewDetails(false)}
        />
      )}
    </section>
  )
}




export default UsersTable

