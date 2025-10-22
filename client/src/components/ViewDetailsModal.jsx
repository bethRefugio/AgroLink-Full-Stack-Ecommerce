import { useState } from 'react'

const ViewDetailsModal = ({ user, onClose, onEdit, onDelete }) => {
  const [showMore, setShowMore] = useState(false)
  if (!user) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-5 w-full max-w-md">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-lg">User Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div className="space-y-3 text-sm text-gray-700">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Role:</strong> {user.role}</p>

          <div className="flex gap-2 mt-2">
            {onEdit && (
              <button onClick={() => onEdit(user)} className="px-3 py-1 border rounded text-sm hover:bg-gray-100">Edit</button>
            )}
            {onDelete && (
              <button onClick={() => onDelete(user)} className="px-3 py-1 border rounded text-sm text-red-600 hover:bg-red-50">Delete</button>
            )}

            <button onClick={() => setShowMore(s => !s)} className="px-3 py-1 border rounded text-sm hover:bg-gray-100">
              {showMore ? 'Hide details' : 'View more'}
            </button>
          </div>

          {showMore && (
            <div className="mt-3 space-y-1">
              <p><strong>Email:</strong> {user.email}</p>
              {user.createdAt && (
                <p><strong>Created At:</strong> {new Date(user.createdAt).toLocaleString()}</p>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 text-right">
          <button onClick={onClose} className="px-3 py-1 border rounded text-sm hover:bg-gray-100">Close</button>
        </div>
      </div>
    </div>
  )
}

export default ViewDetailsModal
