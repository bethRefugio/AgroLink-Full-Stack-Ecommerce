import React, { useEffect, useState, useMemo } from 'react'
import UploadSubCategoryModel from '../components/UploadSubCategoryModel'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import DisplayTable from '../components/DisplayTable'
import { createColumnHelper } from '@tanstack/react-table'
import ViewImage from '../components/ViewImage'
import { HiPencil } from "react-icons/hi"
import { MdDelete } from "react-icons/md"
import EditSubCategory from '../components/EditSubCategory'
import ConfirmBox from '../components/ConfirmBox'
import toast from 'react-hot-toast'
import { IoSearch } from "react-icons/io5"


const SubCategoryPage = () => {
  const [openAddSubCategory, setOpenAddSubCategory] = useState(false)
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(false)
  const columnHelper = createColumnHelper()
  const [ImageURL, setImageURL] = useState("")
  const [openEdit, setOpenEdit] = useState(false)
  const [editData, setEditData] = useState({ _id: "" })
  const [deleteSubCategory, setDeleteSubCategory] = useState({ _id: "" })
  const [openDeleteConfirmBox, setOpenDeleteConfirmBox] = useState(false)
  const [openDescriptionModal, setOpenDescriptionModal] = useState(false)
  const [selectedDescription, setSelectedDescription] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")


  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10


  const fetchSubCategory = async () => {
    try {
      setLoading(true)
      const response = await Axios({ ...SummaryApi.getSubCategory })
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
  }


  useEffect(() => {
    fetchSubCategory()
  }, [])


  // Build category options from data
  const categoryOptions = useMemo(() => {
    const set = new Set()
    data.forEach(item => {
      item.category.forEach(c => set.add(c.name))
    })
    return Array.from(set)
  }, [data])


  // Filter by search + category
  useEffect(() => {
    let result = data


    if (searchTerm) {
      const lower = searchTerm.toLowerCase()
      result = result.filter(item =>
        item.name.toLowerCase().includes(lower) ||
        item.description?.toLowerCase().includes(lower) ||
        item.category.some(cat => cat.name.toLowerCase().includes(lower))
      )
    }


    if (selectedCategory) {
      result = result.filter(item =>
        item.category.some(cat => cat.name === selectedCategory)
      )
    }


    setFilteredData(result)
    setCurrentPage(1) // reset page when filters change
  }, [searchTerm, selectedCategory, data])


  // Pagination derived values
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))


  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, currentPage, pageSize])


  const DescriptionModal = () => (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="font-semibold text-lg text-gray-900">Description</h3>
          <button
            onClick={() => setOpenDescriptionModal(false)}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6 max-h-96 overflow-y-auto">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {selectedDescription || "No description provided"}
          </p>
        </div>
      </div>
    </div>
  )


  const column = [
    columnHelper.display({
      id: "serialNumber",
      header: "No.",
      cell: ({ row }) => <div>{row.index + 1}</div>
    }),
    columnHelper.accessor("name", {
      header: "SUB CATEGORY",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <img
            src={row.original.image}
            alt={row.original.name}
            className="w-12 h-12 object-cover rounded-lg border cursor-pointer"
            onClick={() => setImageURL(row.original.image)}
          />
          <span className="font-medium text-gray-900">{row.original.name}</span>
        </div>
      )
    }),
    columnHelper.accessor("category", {
      header: "CATEGORY",
      cell: ({ row }) => (
        <span className="text-gray-700">
          {row.original.category.map((c, index) => (
            <span key={c._id}>
              {c.name}
              {index < row.original.category.length - 1 ? ", " : ""}
            </span>
          ))}
        </span>
      )
    }),
    columnHelper.accessor("description", {
      header: "DESCRIPTION",
      cell: ({ row }) => {
        const description = row.original.description || "No description provided"
        const isLong = description.length > 60


        return (
          <div className="max-w-xs">
            <div className="truncate text-gray-600" title={description}>
              {description}
            </div>
            {isLong && (
              <button
                onClick={() => {
                  setSelectedDescription(description)
                  setOpenDescriptionModal(true)
                }}
                className="text-blue-600 text-sm hover:underline"
              >
                See More
              </button>
            )}
          </div>
        )
      }
    }),
    columnHelper.accessor("_id", {
      header: "ACTION",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setOpenEdit(true)
              setEditData(row.original)
            }}
            className="text-gray-600 hover:text-gray-800"
            title="Edit"
          >
            <HiPencil size={20} />
          </button>
          <button
            onClick={() => {
              setOpenDeleteConfirmBox(true)
              setDeleteSubCategory(row.original)
            }}
            className="text-gray-600 hover:text-gray-800"
            title="Delete"
          >
            <MdDelete size={20} />
          </button>
        </div>
      )
    })
  ]


  const handleDeleteSubCategory = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.deleteSubCategory,
        data: deleteSubCategory
      })


      const { data: responseData } = response


      if (responseData.success) {
        toast.success(responseData.message)
        fetchSubCategory()
        setOpenDeleteConfirmBox(false)
        setDeleteSubCategory({ _id: "" })
      }
    } catch (error) {
      AxiosToastError(error)
    }
  }


  return (
    <section className="max-w-5xl mx-auto px-3 overflow-x-hidden pb-20 sm:pb-10">


      {/* Page Title */}
      <div className="mb-3 sm:mb-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Sub Category</h1>
        <p className="text-sm text-gray-500">Manage your product sub categories</p>
      </div>


      {/* Sticky search/filter bar */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-gray-200 mb-4">
        <div className="py-3 sm:py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">


          {/* SEARCH FIELD */}
          <div className="relative w-full max-w-full sm:max-w-sm">
            <IoSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-blue-500
                        focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>


          {/* DROPDOWN + ADD BUTTON — now one row on mobile */}
          <div className="flex w-full sm:w-auto items-center gap-2">


            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg
                        text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All categories</option>
              {categoryOptions.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>


            {/* Add Sub Category Button */}
            <button
              onClick={() => setOpenAddSubCategory(true)}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600
                        rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg"
                  fill="none" viewBox="0 0 24 24" strokeWidth={2}
                  stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Sub Category
            </button>
          </div>
        </div>
      </div>


      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4 pb-1">
        <div className="overflow-x-auto pb-4 sm:pb-2">
          <DisplayTable
            data={paginatedData}
            column={column}
          />
        </div>
      </div>


      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 mb-10 text-sm">
        <span className="text-gray-600">
          Showing{" "}
          <span className="font-medium">
            {filteredData.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
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
      {openAddSubCategory && (
        <UploadSubCategoryModel
          close={() => setOpenAddSubCategory(false)}
          fetchData={fetchSubCategory}
        />
      )}


      {ImageURL && (
        <ViewImage
          url={ImageURL}
          close={() => setImageURL("")}
        />
      )}


      {openEdit && (
        <EditSubCategory
          data={editData}
          close={() => setOpenEdit(false)}
          fetchData={fetchSubCategory}
        />
      )}


      {openDeleteConfirmBox && (
        <ConfirmBox
          cancel={() => setOpenDeleteConfirmBox(false)}
          close={() => setOpenDeleteConfirmBox(false)}
          confirm={handleDeleteSubCategory}
        />
      )}


      {openDescriptionModal && <DescriptionModal />}
    </section>
  )
}


export default SubCategoryPage

