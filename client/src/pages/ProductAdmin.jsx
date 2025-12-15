import React, { useEffect, useMemo, useState } from 'react'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import Loading from '../components/Loading'
import EditProductAdmin from '../components/EditProductAdmin'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { HiPencil } from "react-icons/hi"
import { MdDelete } from "react-icons/md"
import { IoSearch } from "react-icons/io5"
import DisplayTable from '../components/DisplayTable'
import { createColumnHelper } from '@tanstack/react-table'
import ConfirmBox from '../components/ConfirmBox'


const ProductAdmin = () => {
  const [productData, setProductData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(false)
 
  const [search, setSearch] = useState("")
  const [editingProduct, setEditingProduct] = useState(null)


  const user = useSelector(state => state.user)


  // Pagination
  const pageSize = 20
  const [currentPage, setCurrentPage] = useState(1)

  // Confirm delete state
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)


  const columnHelper = createColumnHelper()


  const fetchProductData = async () => {
    try {
      setLoading(true)


      const requestData = {
        page: 1,
        limit: 300,
        search: ""
      }


      if (user?.role === "SELLER") {
        requestData.userId = user._id
      }


      const response = await Axios({
        ...SummaryApi.getProduct,
        data: requestData
      })


      const { data: responseData } = response


      if (responseData.success) {
        const list = responseData.data || []
        setProductData(list)
        setFilteredData(list)
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    fetchProductData()
  }, [])


  // 🔍 Search Filter
  useEffect(() => {
    const q = (search || "").trim().toLowerCase()


    if (!q) {
      setFilteredData(productData)
      setCurrentPage(1)
      return
    }


    const filtered = productData.filter(p => {
      const name = (p.name || "").toLowerCase()
      const unit = (p.unit || "").toLowerCase()
      const sku = (p.sku || "").toLowerCase()
      return name.includes(q) || unit.includes(q) || sku.includes(q)
    })


    setFilteredData(filtered)
    setCurrentPage(1)
  }, [search, productData])


   // open confirm dialog
  const askDelete = (id) => {
    setConfirmDeleteId(id)
    setShowConfirmDelete(true)
  }

  // perform delete after confirm
  const confirmDelete = async () => {
    if (!confirmDeleteId) return
    try {
      const response = await Axios({
        ...SummaryApi.deleteProduct,
        data: { _id: confirmDeleteId }
      })
      const { data: responseData } = response
      if (responseData.success) {
        toast.success(responseData.message)
        fetchProductData()
      }
    } catch (err) {
      AxiosToastError(err)
    } finally {
      setShowConfirmDelete(false)
      setConfirmDeleteId(null)
    }
  }

  const cancelDelete = () => {
    setShowConfirmDelete(false)
    setConfirmDeleteId(null)
  }

  const columns = [
    columnHelper.display({
      id: "serialNumber",
      header: "No.",
      cell: ({ row }) => (
        <div className="text-gray-700 font-medium">{row.index + 1}</div>
      )
    }),
    columnHelper.accessor("name", {
      header: "PRODUCT",
      cell: ({ row }) => {
        const p = row.original
        const img = Array.isArray(p.image) ? p.image[0] : p.image
        return (
          <div className="flex items-center gap-3">
            <img
              src={img || "/placeholder.png"}
              alt={p.name}
              className="w-12 h-12 object-contain rounded-lg border"
              onError={(e) => { e.currentTarget.src = "/placeholder.png" }}
            />
            <div>
              <div className="font-medium text-gray-900">{p.name}</div>
              {p.sku && <div className="text-xs text-gray-500">SKU: {p.sku}</div>}
            </div>
          </div>
        )
      }
    }),
    columnHelper.accessor("unit", {
      header: "UNIT",
      cell: ({ row }) => (
        <span className="text-gray-700">{row.original.unit || "N/A"}</span>
      )
    }),
    columnHelper.accessor("_id", {
      header: "ACTION",
      cell: ({ row }) => {
        const p = row.original
        return (
          <div className="flex items-center gap-3">
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setEditingProduct(p)}
            >
              <HiPencil size={22} />
            </button>

            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => askDelete(p._id)}   // ← open confirm
            >
              <MdDelete size={22} />
            </button>
          </div>
        )
      }
    })
  ]


  // 🔢 PAGINATION VALUES
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [currentPage, pageSize, filteredData])


  return (
    <section className="max-w-5xl mx-auto px-3 pb-20 sm:pb-10 overflow-x-hidden">


      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          {user?.role === "SELLER" ? "My Products" : "All Products"}
        </h2>
        <p className="text-sm text-gray-500 mt-1">Manage products in your store</p>
      </div>


      {/* SEARCH BAR */}
      <div className="bg-white p-4 mb-6 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xs">
          <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search product name, unit or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>


      {/* LOADING */}
      {loading && <Loading />}


      {/* TABLE */}
      <div className="bg-white rounded-lg border overflow-hidden mb-4">
        <div className="overflow-x-auto">
          {filteredData.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No products found.</div>
          ) : (
            <DisplayTable data={paginatedData} column={columns} />
          )}
        </div>
      </div>


      {/* PAGINATION */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 mb-10 text-sm">
        <span className="text-gray-600">
          Showing{" "}
          <span className="font-medium">
            {filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            {" - "}
            {Math.min(currentPage * pageSize, filteredData.length)}
          </span>{" "}
          of <span className="font-medium">{filteredData.length}</span> products
        </span>


        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Prev
          </button>


          <span>
            Page <span className="font-semibold">{currentPage}</span> of{" "}
            <span className="font-semibold">{totalPages}</span>
          </span>


          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>


       {/* EDIT MODAL */}
      {editingProduct && (
        <EditProductAdmin
          data={editingProduct}
          close={() => setEditingProduct(null)}
          fetchProductData={fetchProductData}
        />
      )}

      {/* DELETE CONFIRMATION */}
      {showConfirmDelete && (
        <ConfirmBox
          cancel={cancelDelete}
          confirm={confirmDelete}
          close={cancelDelete}
        />
      )}
    </section>
  )
}


export default ProductAdmin

