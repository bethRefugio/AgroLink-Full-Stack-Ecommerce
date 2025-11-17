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

const ProductAdmin = () => {
  const [productData, setProductData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [editingProduct, setEditingProduct] = useState(null)
  const user = useSelector(state => state.user)

  const columnHelper = createColumnHelper()

  const fetchProductData = async () => {
    try {
      setLoading(true)

      const requestData = {
        page: 1,
        limit: 200, // fetch a larger batch; we're filtering client-side
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // SubCategoryPage-like search (client-side filter)
  useEffect(() => {
    const q = (search || "").trim().toLowerCase()
    if (!q) {
      setFilteredData(productData)
      return
    }
    const filtered = productData.filter(p => {
      const name = (p.name || "").toLowerCase()
      const unit = (p.unit || "").toLowerCase()
      const sku = (p.sku || "").toLowerCase()
      return name.includes(q) || unit.includes(q) || sku.includes(q)
    })
    setFilteredData(filtered)
  }, [search, productData])

  const handleDelete = async (id) => {
    try {
      const response = await Axios({
        ...SummaryApi.deleteProduct,
        data: { _id: id }
      })
      const { data: responseData } = response
      if (responseData.success) {
        toast.success(responseData.message)
        fetchProductData()
      }
    } catch (err) {
      AxiosToastError(err)
    }
  }

  const columns = [
    columnHelper.display({
      id: 'serialNumber',
      header: 'No.',
      cell: ({ row }) => (
        <div className='text-gray-700 font-medium'>{row.index + 1}</div>
      )
    }),
    columnHelper.accessor('name', {
      header: 'PRODUCT',
      cell: ({ row }) => {
        const p = row.original
        const img = Array.isArray(p.image) ? p.image[0] : p.image
        return (
          <div className='flex items-center gap-3'>
            <img
              src={img || "/placeholder.png"}
              alt={p.name}
              className='w-12 h-12 object-contain rounded-lg border border-gray-200'
              onError={(e) => { e.currentTarget.src = "/placeholder.png" }}
            />
            <div>
              <div className='font-medium text-gray-900'>{p.name || "N/A"}</div>
              {p.sku && <div className='text-xs text-gray-500'>SKU: {p.sku}</div>}
            </div>
          </div>
        )
      }
    }),
    columnHelper.accessor('unit', {
      header: 'UNIT',
      cell: ({ row }) => (
        <span className='text-gray-700'>{row.original.unit || "N/A"}</span>
      )
    }),
    columnHelper.accessor('_id', {
      header: 'ACTION',
      cell: ({ row }) => {
        const p = row.original
        return (
          <div className='flex items-center gap-3'>
            <button
              className='text-gray-500 hover:text-gray-700 transition-colors'
              onClick={() => setEditingProduct(p)}
              title='Edit'
            >
              <HiPencil size={22} />
            </button>
            <button
              className='text-gray-500 hover:text-gray-700 transition-colors'
              onClick={() => handleDelete(p._id)}
              title='Delete'
            >
              <MdDelete size={22} />
            </button>
          </div>
        )
      }
    }),
  ]

  return (
    <section className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          {user?.role === "SELLER" ? "My Products" : "All Products"}
        </h2>
        <p className="text-sm text-gray-500 mt-1">Manage products in your store</p>
      </div>

      {/* Search bar (same style as SubCategoryPage; no filter/sort) */}
      <div className="bg-white p-4 mb-6 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xs">
          <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search product name, unit or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {/* No filter/sort buttons */}
      </div>

      {/* Loading */}
      {loading && <Loading />}

      {/* Table using DisplayTable */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {filteredData.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No products found.</div>
          ) : (
            <DisplayTable data={filteredData} column={columns} />
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <EditProductAdmin
          data={editingProduct}
          close={() => setEditingProduct(null)}
          fetchProductData={fetchProductData}
        />
      )}
    </section>
  )
}

export default ProductAdmin