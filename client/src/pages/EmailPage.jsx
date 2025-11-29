import React, { useEffect, useState, useCallback, useMemo } from 'react'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import toast from 'react-hot-toast'
import { IoSearch, IoClose } from "react-icons/io5"
import { MdDelete, MdReply, MdVisibility } from "react-icons/md"
import { createColumnHelper } from '@tanstack/react-table'
import DisplayTable from '../components/DisplayTable'
import ConfirmBox from '../components/CofirmBox'


/* ---------------------- REPLY MODAL ---------------------- */
const ReplyModal = ({ selectedMessage, replyData, setReplyData, onClose, onSubmit, sending }) => {
  if (!selectedMessage) return null


  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden'>
        {/* Header */}
        <div className='flex justify-between items-center p-4 sm:p-6 border-b border-gray-200'>
          <h3 className='font-semibold text-lg text-gray-900'>Reply to {selectedMessage.name}</h3>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors'
            type='button'
          >
            <IoClose size={24} />
          </button>
        </div>


        {/* Body / Form */}
        <form onSubmit={onSubmit} className='flex-1 overflow-y-auto p-4 sm:p-6 space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>To</label>
            <input
              type='text'
              value={selectedMessage.email}
              disabled
              className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600'
            />
          </div>


          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Subject</label>
            <input
              type='text'
              value={replyData.subject}
              onChange={(e) => setReplyData(prev => ({ ...prev, subject: e.target.value }))}
              required
              placeholder='Enter subject'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
            />
          </div>


          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Message</label>
            <textarea
              value={replyData.message}
              onChange={(e) => setReplyData(prev => ({ ...prev, message: e.target.value }))}
              required
              rows={8}
              placeholder='Write your reply...'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none'
            />
          </div>


          <div className='bg-gray-50 p-4 rounded-lg'>
            <p className='text-xs font-medium text-gray-500 mb-2'>Original Message:</p>
            <p className='text-sm text-gray-700 whitespace-pre-wrap'>{selectedMessage.message}</p>
          </div>


          {/* Footer buttons (non-sticky here, outer container already scrolls) */}
          <div className='pt-4 border-t border-gray-200 flex justify-end gap-3'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={sending}
              className='px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2'
            >
              {sending ? 'Sending...' : (
                <>
                  <MdReply size={18} />
                  Send Reply
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


/* ---------------------- VIEW MODAL ---------------------- */
const ViewMessageModal = ({ selectedMessage, onClose, onReply }) => {
  if (!selectedMessage) return null


  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col'>
        <div className='flex justify-between items-center p-6 border-b border-gray-200'>
          <div>
            <h3 className='font-semibold text-lg text-gray-900'>Message Details</h3>
            <div className='flex items-center gap-2 mt-1'>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                selectedMessage.status === 'unread'
                  ? 'bg-blue-100 text-blue-700'
                  : selectedMessage.status === 'read'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {selectedMessage.status.toUpperCase()}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors'
          >
            <IoClose size={24} />
          </button>
        </div>


        <div className='flex-1 overflow-y-auto p-6 space-y-6'>
          {/* Original Message */}
          <div className='bg-white border border-gray-200 rounded-lg p-4'>
            <div className='space-y-3'>
              <div>
                <label className='text-sm font-medium text-gray-500'>From</label>
                <p className='text-gray-900 font-medium'>{selectedMessage.name}</p>
              </div>


              <div>
                <label className='text-sm font-medium text-gray-500'>Email</label>
                <p className='text-gray-900'>{selectedMessage.email}</p>
              </div>


              {selectedMessage.subject && (
                <div>
                  <label className='text-sm font-medium text-gray-500'>Subject</label>
                  <p className='text-gray-900'>{selectedMessage.subject}</p>
                </div>
              )}


              <div>
                <label className='text-sm font-medium text-gray-500'>Message</label>
                <p className='text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-lg mt-1'>
                  {selectedMessage.message}
                </p>
              </div>


              <div>
                <label className='text-sm font-medium text-gray-500'>Date</label>
                <p className='text-gray-900'>
                  {new Date(selectedMessage.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>


          {/* Replies */}
          {selectedMessage.replies && selectedMessage.replies.length > 0 && (
            <div>
              <h4 className='font-semibold text-gray-900 mb-3'>
                Replies ({selectedMessage.replies.length})
              </h4>
              <div className='space-y-3'>
                {selectedMessage.replies.map((reply, index) => (
                  <div key={reply._id || index} className='bg-green-50 border border-green-200 rounded-lg p-4'>
                    <div className='flex justify-between items-start mb-2'>
                      <div>
                        <p className='text-sm font-medium text-gray-900'>
                          {reply.repliedBy?.name || 'Admin'}
                        </p>
                        <p className='text-xs text-gray-500'>
                          {reply.repliedBy?.email || ''}
                        </p>
                      </div>
                      <p className='text-xs text-gray-500'>
                        {new Date(reply.repliedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className='mt-2'>
                      <p className='text-sm font-medium text-gray-700 mb-1'>
                        Subject: {reply.subject}
                      </p>
                      <p className='text-sm text-gray-700 whitespace-pre-wrap'>
                        {reply.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>


        <div className='p-6 border-t border-gray-200 flex justify-end gap-3'>
          <button
            onClick={onReply}
            className='px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2'
          >
            <MdReply size={18} />
            Reply
          </button>
          <button
            onClick={onClose}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}


/* ---------------------- MAIN PAGE ---------------------- */
const EmailPage = () => {
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteMessage, setDeleteMessage] = useState({ _id: "" })
  const [openDeleteConfirmBox, setOpenDeleteConfirmBox] = useState(false)
  const [openViewModal, setOpenViewModal] = useState(false)
  const [openReplyModal, setOpenReplyModal] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [replyData, setReplyData] = useState({ subject: '', message: '' })
  const [sending, setSending] = useState(false)


  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20


  const columnHelper = createColumnHelper()


  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true)
      const response = await Axios({ ...SummaryApi.listContacts })
      const { data: responseData } = response


      if (responseData.success) {
        setData(responseData.data)
        setFilteredData(responseData.data)
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }, [])


  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])


  // Filter + reset page on search
  useEffect(() => {
    if (searchTerm) {
      const lower = searchTerm.toLowerCase()
      const filtered = data.filter(item =>
        item.name?.toLowerCase().includes(lower) ||
        item.email?.toLowerCase().includes(lower) ||
        item.subject?.toLowerCase().includes(lower) ||
        item.message?.toLowerCase().includes(lower)
      )
      setFilteredData(filtered)
      setCurrentPage(1)
    } else {
      setFilteredData(data)
      setCurrentPage(1)
    }
  }, [searchTerm, data])


  // Pagination derived values
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))


  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, currentPage, pageSize])


  const handleDeleteMessage = useCallback(async () => {
    try {
      const response = await Axios({
        url: SummaryApi.deleteContact.url(deleteMessage._id),
        method: SummaryApi.deleteContact.method
      })


      const { data: responseData } = response


      if (responseData.success) {
        toast.success(responseData.message)
        fetchMessages()
        setOpenDeleteConfirmBox(false)
        setDeleteMessage({ _id: "" })
      }
    } catch (error) {
      AxiosToastError(error)
    }
  }, [deleteMessage._id, fetchMessages])


  const markAsRead = useCallback(async (messageId) => {
    try {
      await Axios({
        url: SummaryApi.markContactAsRead.url(messageId),
        method: SummaryApi.markContactAsRead.method
      })
      fetchMessages()
    } catch (error) {
      console.error(error)
    }
  }, [fetchMessages])


  const handleReplyClose = useCallback(() => {
    setOpenReplyModal(false)
    setReplyData({ subject: '', message: '' })
    setSelectedMessage(null)
  }, [])


  const handleViewClose = useCallback(() => {
    setOpenViewModal(false)
    setSelectedMessage(null)
  }, [])


  const handleReply = useCallback(async (e) => {
    e.preventDefault()
    try {
      setSending(true)
      const response = await Axios({
        ...SummaryApi.replyContact,
        data: {
          messageId: selectedMessage._id,
          subject: replyData.subject,
          message: replyData.message
        }
      })


      const { data: responseData } = response


      if (responseData.success) {
        toast.success("Reply sent successfully")
        handleReplyClose()
        fetchMessages()
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setSending(false)
    }
  }, [selectedMessage, replyData, handleReplyClose, fetchMessages])


  const handleViewToReply = useCallback(() => {
    setOpenViewModal(false)
    setOpenReplyModal(true)
    setReplyData({
      subject: `Re: ${selectedMessage?.subject || 'Your message'}`,
      message: ''
    })
  }, [selectedMessage])


  const columns = [
    columnHelper.display({
      id: 'serialNumber',
      header: 'No.',
      cell: ({ row }) => (
        <div className='text-gray-700 font-medium'>{row.index + 1}</div>
      )
    }),
    columnHelper.accessor('status', {
      header: "STATUS",
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            status === 'unread'
              ? 'bg-blue-100 text-blue-700'
              : status === 'read'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-green-100 text-green-700'
          }`}>
            {status.toUpperCase()}
          </span>
        )
      }
    }),
    columnHelper.accessor('name', {
      header: "NAME",
      cell: ({ row }) => (
        <span className='font-medium text-gray-900'>{row.original.name}</span>
      )
    }),
    columnHelper.accessor('email', {
      header: "EMAIL",
      cell: ({ row }) => (
        <span className='text-gray-700'>{row.original.email}</span>
      )
    }),
    columnHelper.accessor('subject', {
      header: "SUBJECT",
      cell: ({ row }) => (
        <span className='text-gray-700'>{row.original.subject || 'No subject'}</span>
      )
    }),
    columnHelper.accessor('message', {
      header: "MESSAGE",
      cell: ({ row }) => {
        const message = row.original.message || "No message"
        return (
          <div className='max-w-[120px]'>
            <div className='text-gray-600 truncate' title={message}>
              {message}
            </div>
          </div>
        )
      }
    }),
    columnHelper.accessor('replies', {
      header: "REPLIES",
      cell: ({ row }) => (
        <span className='text-gray-700 text-center block'>
          {row.original.replies?.length || 0}
        </span>
      )
    }),
    columnHelper.accessor('createdAt', {
      header: "DATE",
      cell: ({ row }) => (
        <span className='text-gray-700 text-sm'>
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      )
    }),
    columnHelper.accessor("_id", {
      header: "ACTION",
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <button
            onClick={() => {
              setSelectedMessage(row.original)
              setOpenViewModal(true)
              if (row.original.status === 'unread') {
                markAsRead(row.original._id)
              }
            }}
            className='text-gray-500 hover:text-gray-700 transition-colors'
            title='View'
          >
            <MdVisibility size={22} />
          </button>
          <button
            onClick={() => {
              setSelectedMessage(row.original)
              setOpenReplyModal(true)
              setReplyData({
                subject: `Re: ${row.original.subject || 'Your message'}`,
                message: ''
              })
              if (row.original.status === 'unread') {
                markAsRead(row.original._id)
              }
            }}
            className='text-gray-500 hover:text-gray-700 transition-colors'
            title='Reply'
          >
            <MdReply size={22} />
          </button>
          <button
            onClick={() => {
              setOpenDeleteConfirmBox(true)
              setDeleteMessage(row.original)
            }}
            className='text-gray-500 hover:text-gray-700 transition-colors'
            title='Delete'
          >
            <MdDelete size={22} />
          </button>
        </div>
      )
    })
  ]


  return (
    <section className='max-w-5xl mx-auto px-3 overflow-x-hidden pb-20 sm:pb-10'>
      {/* Header */}
      <div className='mb-3 sm:mb-4'>
        <h1 className='text-xl sm:text-2xl font-semibold text-gray-900 mb-1'>Messages</h1>
        <p className='text-sm text-gray-500'>Manage contact form submissions</p>
      </div>


      {/* Sticky Search Bar */}
      <div className='sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-gray-200 mb-4'>
        <div className='py-3 sm:py-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between'>
          {/* SEARCH FIELD */}
          <div className="relative w-full max-w-full sm:max-w-sm">
            <IoSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search name, email, subject or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-blue-500
                        focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>
        </div>
      </div>


      {/* Table */}
      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden mb-4 pb-1'>
        <div className='overflow-x-auto sm:overflow-x-visible pb-4 sm:pb-2'>
          {loading ? (
            <div className='p-8 text-center text-gray-500'>Loading...</div>
          ) : filteredData.length === 0 ? (
            <div className='p-8 text-center text-gray-500'>No messages found.</div>
          ) : (
            <DisplayTable data={paginatedData} column={columns} />
          )}
        </div>
      </div>


      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 mb-10 text-sm">
        <span className="text-gray-600">
          Showing{" "}
          <span className="font-medium">
            {filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            {" - "}
            {Math.min(currentPage * pageSize, filteredData.length)}
          </span>{" "}
          of <span className="font-medium">{filteredData.length}</span> results
        </span>


        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="px-3 py-1.5 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Prev
          </button>
          <span>
            Page <span className="font-semibold">{currentPage}</span> of{" "}
            <span className="font-semibold">{totalPages}</span>
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>


      {/* Modals */}
      {openDeleteConfirmBox && (
        <ConfirmBox
          cancel={() => setOpenDeleteConfirmBox(false)}
          close={() => setOpenDeleteConfirmBox(false)}
          confirm={handleDeleteMessage}
        />
      )}


      {openViewModal && (
        <ViewMessageModal
          selectedMessage={selectedMessage}
          onClose={handleViewClose}
          onReply={handleViewToReply}
        />
      )}


      {openReplyModal && (
        <ReplyModal
          selectedMessage={selectedMessage}
          replyData={replyData}
          setReplyData={setReplyData}
          onClose={handleReplyClose}
          onSubmit={handleReply}
          sending={sending}
        />
      )}
    </section>
  )
}


export default EmailPage

