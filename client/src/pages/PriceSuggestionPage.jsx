import React, { useEffect, useState } from 'react'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import toast from 'react-hot-toast'
import { IoSearch } from "react-icons/io5"
import { MdDelete, MdEdit, MdUploadFile } from "react-icons/md"
import { createColumnHelper } from '@tanstack/react-table'
import DisplayTable from '../components/DisplayTable'
import ConfirmBox from '../components/ConfirmBox'
import { IoClose } from "react-icons/io5"


const PriceSuggestionPage = () => {
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState('newest')
  const [deleteEntry, setDeleteEntry] = useState({ _id: "" })
  const [openDeleteConfirmBox, setOpenDeleteConfirmBox] = useState(false)
  const [openAddModal, setOpenAddModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [openUploadCSV, setOpenUploadCSV] = useState(false)
  const [editData, setEditData] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 50
  const [syncing, setSyncing] = useState(false)
 
  const [suggestName, setSuggestName] = useState('')
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [suggestResult, setSuggestResult] = useState(null)
  const [suggestError, setSuggestError] = useState('')
  const [suggestionRequested, setSuggestionRequested] = useState(false)

  const [trainingItem, setTrainingItem] = useState('')
  const [trainingIterations, setTrainingIterations] = useState(10)
  const [isTraining, setIsTraining] = useState(false)
  const [trainingProgress, setTrainingProgress] = useState(null)


  const columnHelper = createColumnHelper()


  const fetchPriceData = async (page = 1) => {
    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.getAllPriceEntries,
        params: {
          page,
          limit: pageSize,
          sort: sortOrder // Add sort parameter
        }
      })
      const { data: responseData } = response


      if (responseData.success) {
        setData(responseData.data)
        setFilteredData(responseData.data)
        setTotal(responseData.total)
        setTotalPages(responseData.totalPages)
        setCurrentPage(responseData.page)
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    fetchPriceData(currentPage)
  }, [currentPage, sortOrder])


  useEffect(() => {
  let filtered = [...data]


  if (searchTerm) {
    filtered = filtered.filter(item =>
      item.commodity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.item?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.month?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.year?.toString().includes(searchTerm)
    )
  }


  // Remove the sorting logic from here since it's handled by backend
  setFilteredData(filtered)
}, [searchTerm, data])


  const handleDeleteEntry = async () => {
    try {
      const response = await Axios({
        url: SummaryApi.deletePriceEntry.url(deleteEntry._id),
        method: SummaryApi.deletePriceEntry.method
      })


      const { data: responseData } = response


      if (responseData.success) {
        toast.success(responseData.message)
        fetchPriceData(currentPage)
        setOpenDeleteConfirmBox(false)
        setDeleteEntry({ _id: "" })
      }
    } catch (error) {
      AxiosToastError(error)
    }
  }


  // Move handleSyncProducts here - at component level
  const handleSyncProducts = async () => {
    try {
      setSyncing(true)
      const response = await Axios({
        ...SummaryApi.syncProductsToPriceAI
      })


      if (response.data.success) {
        toast.success(response.data.message)
        fetchPriceData(1)
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setSyncing(false)
    }
  }


  // Add/Edit Modal
  const AddEditModal = ({ isEdit = false }) => {
    const [formData, setFormData] = useState(
      isEdit && editData
        ? editData
        : {
            year: new Date().getFullYear(),
            month: 'january',
            commodity: 'local rice',
            item: '',
            unit: 'kg',
            price: '',
            source: 'manual'
          }
    )
    const [saving, setSaving] = useState(false)


    const handleSubmit = async (e) => {
      e.preventDefault()
      try {
        setSaving(true)
        const response = await Axios({
          ...(isEdit
            ? {
                url: SummaryApi.updatePriceEntry.url(editData._id),
                method: SummaryApi.updatePriceEntry.method
              }
            : SummaryApi.createPriceEntry),
          data: formData
        })


        if (response.data.success) {
          toast.success(response.data.message)
          fetchPriceData(currentPage)
          isEdit ? setOpenEditModal(false) : setOpenAddModal(false)
          setEditData(null)
        }
      } catch (error) {
        AxiosToastError(error)
      } finally {
        setSaving(false)
      }
    }






    return (
      <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
        <div className='bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden'>
          <div className='flex justify-between items-center p-6 border-b border-gray-200'>
            <h3 className='font-semibold text-lg text-gray-900'>
              {isEdit ? 'Edit Price Entry' : 'Add New Price Entry'}
            </h3>
            <button
              onClick={() => {
                isEdit ? setOpenEditModal(false) : setOpenAddModal(false)
                setEditData(null)
              }}
              className='text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors'
            >
              <IoClose size={24} />
            </button>
          </div>


          <form onSubmit={handleSubmit} className='p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Year *</label>
                <input
                  type='number'
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  required
                  min='2020'
                  max='2100'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>


              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Month *</label>
                <select
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value='january'>January</option>
                  <option value='february'>February</option>
                  <option value='march'>March</option>
                  <option value='april'>April</option>
                  <option value='may'>May</option>
                  <option value='june'>June</option>
                  <option value='july'>July</option>
                  <option value='august'>August</option>
                  <option value='september'>September</option>
                  <option value='october'>October</option>
                  <option value='november'>November</option>
                  <option value='december'>December</option>
                </select>
              </div>
            </div>


            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Commodity *</label>
              <select
                value={formData.commodity}
                onChange={(e) => setFormData({ ...formData, commodity: e.target.value })}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='local rice'>Local Rice</option>
                <option value='lowland vegetables'>Lowland Vegetables</option>
                <option value='high land vegetables'>Highland Vegetables</option>
                <option value='spices'>Spices</option>
                <option value='fruits'>Fruits</option>
                <option value='corn'>Corn</option>
                <option value='rootcrops'>Rootcrops</option>
              </select>
            </div>


            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Item *</label>
              <input
                type='text'
                value={formData.item}
                onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                required
                placeholder='e.g., Special Rice, Tomato, Mango'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>


            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Unit *</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value='kg'>Kilogram (kg)</option>
                  <option value='small bundle'>Small Bundle</option>
                  <option value='piece'>Piece</option>
                  <option value='liter'>Liter</option>
                  <option value='gram'>Gram</option>
                </select>
              </div>


              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Price (₱) *</label>
                <input
                  type='number'
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  required
                  min='0'
                  step='0.01'
                  placeholder='0.00'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
            </div>


            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Source</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='manual'>Manual</option>
                <option value='import'>Import</option>
                <option value='api'>API</option>
                <option value='prediction'>Prediction</option>
              </select>
            </div>


            <div className='flex justify-end gap-3 pt-4'>
              <button
                type='button'
                onClick={() => {
                  isEdit ? setOpenEditModal(false) : setOpenAddModal(false)
                  setEditData(null)
                }}
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={saving}
                className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
              >
                {saving ? 'Saving...' : isEdit ? 'Update' : 'Add Entry'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }


  // CSV Upload Modal
  const CSVUploadModal = () => {
    const [file, setFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState([])
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isDragging, setIsDragging] = useState(false)


    const handleFileChange = (e) => {
      const selectedFile = e.target.files[0]
      if (selectedFile && selectedFile.type === 'text/csv') {
        setFile(selectedFile)
        previewCSV(selectedFile)
      } else {
        toast.error('Please select a valid CSV file')
      }
    }


    // Handle drag over
    const handleDragOver = (e) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(true)
    }


    // Handle drag leave
    const handleDragLeave = (e) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
    }


    // Handle drop
    const handleDrop = (e) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)


      if (uploading) return


      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile && droppedFile.type === 'text/csv') {
        setFile(droppedFile)
        previewCSV(droppedFile)
      } else {
        toast.error('Please drop a valid CSV file')
      }
    }


    const previewCSV = (file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target.result
        const rows = text.split('\n').slice(1, 6)
        const data = rows
          .map((row) => {
            const cols = row.split(',')
            if (cols.length >= 6) {
              return {
                year: cols[0],
                month: cols[1],
                commodity: cols[2],
                item: cols[3],
                unit: cols[4],
                price: cols[5]
              }
            }
            return null
          })
          .filter(Boolean)
        setPreview(data)
      }
      reader.readAsText(file)
    }


    const chunkArray = (array, size) => {
      const chunks = []
      for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size))
      }
      return chunks
    }


    const handleUpload = async () => {
      if (!file) {
        toast.error('Please select a file')
        return
      }


      try {
        setUploading(true)
        setUploadProgress(0)


        const reader = new FileReader()
        reader.onload = async (e) => {
          const text = e.target.result
          const rows = text.split('\n').slice(1)
         
          const allData = rows
            .map((row) => {
              const cols = row.split(',').map((col) => col.trim())
              if (cols.length >= 6 && cols[5]) {
                return {
                  year: parseInt(cols[0]),
                  month: cols[1].toLowerCase(),
                  commodity: cols[2].toLowerCase(),
                  item: cols[3].toLowerCase(),
                  unit: cols[4].toLowerCase(),
                  price: parseFloat(cols[5]),
                  source: 'import'
                }
              }
              return null
            })
            .filter(Boolean)


          if (allData.length === 0) {
            toast.error('No valid data found in CSV')
            setUploading(false)
            return
          }


          const chunks = chunkArray(allData, 100)
          let successCount = 0


          for (let i = 0; i < chunks.length; i++) {
            try {
              const response = await Axios({
                ...SummaryApi.bulkImportPrices,
                data: { data: chunks[i] }
              })


              if (response.data.success) {
                successCount += chunks[i].length
              }


              setUploadProgress(Math.round(((i + 1) / chunks.length) * 100))
            } catch (error) {
              console.error(`Chunk ${i + 1} failed:`, error)
            }


            await new Promise(resolve => setTimeout(resolve, 100))
          }


          if (successCount > 0) {
            toast.success(`Successfully imported ${successCount} entries`)
            fetchPriceData(1)
            setOpenUploadCSV(false)
            setFile(null)
            setPreview([])
          } else {
            toast.error('Failed to import data')
          }
        }
        reader.readAsText(file)
      } catch (error) {
        AxiosToastError(error)
      } finally {
        setUploading(false)
        setUploadProgress(0)
      }
    }


    return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-3xl'>
        <div className='flex justify-between items-center p-6 border-b border-gray-200'>
          <h3 className='font-semibold text-lg text-gray-900'>Upload CSV File</h3>
          <button
            onClick={() => {
              if (!uploading) {
                setOpenUploadCSV(false)
                setFile(null)
                setPreview([])
              }
            }}
            disabled={uploading}
            className='text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors disabled:opacity-50'
          >
            <IoClose size={24} />
          </button>
        </div>


        <div className='p-6 space-y-4'>
          {/* Drag and Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-500'
            } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
          >
            <MdUploadFile
              className={`mx-auto mb-4 transition-colors ${
                isDragging ? 'text-blue-500' : 'text-gray-400'
              }`}
              size={48}
            />
            <label className={`cursor-pointer ${uploading ? 'pointer-events-none' : ''}`}>
              <span className='text-blue-600 hover:text-blue-700 font-medium'>
                Click to upload
              </span>
              <span className='text-gray-600'> or drag and drop</span>
              <input
                type='file'
                accept='.csv'
                onChange={handleFileChange}
                disabled={uploading}
                className='hidden'
              />
            </label>
            <p className='text-xs text-gray-500 mt-2'>CSV file only</p>
            {isDragging && (
              <p className='text-sm text-blue-600 font-medium mt-2'>
                Drop your CSV file here
              </p>
            )}
          </div>


          {file && (
            <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
              <p className='text-sm text-green-800 font-medium'>
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            </div>
          )}


          {uploading && (
            <div>
              <div className='flex justify-between text-sm text-gray-600 mb-2'>
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}


          {preview.length > 0 && !uploading && (
            <div>
              <h4 className='font-medium text-gray-900 mb-3'>Preview (First 5 rows)</h4>
              <div className='overflow-x-auto border border-gray-200 rounded-lg'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>Year</th>
                      <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>Month</th>
                      <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>Commodity</th>
                      <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>Item</th>
                      <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>Unit</th>
                      <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>Price</th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {preview.map((row, idx) => (
                      <tr key={idx}>
                        <td className='px-4 py-2 text-sm text-gray-900'>{row.year}</td>
                        <td className='px-4 py-2 text-sm text-gray-900 capitalize'>{row.month}</td>
                        <td className='px-4 py-2 text-sm text-gray-900 capitalize'>{row.commodity}</td>
                        <td className='px-4 py-2 text-sm text-gray-900 capitalize'>{row.item}</td>
                        <td className='px-4 py-2 text-sm text-gray-900'>{row.unit}</td>
                        <td className='px-4 py-2 text-sm text-gray-900'>₱{row.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}


          <div className='flex justify-end gap-3 pt-4'>
            <button
              type='button'
              onClick={() => {
                setOpenUploadCSV(false)
                setFile(null)
                setPreview([])
              }}
              disabled={uploading}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50'
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
            >
              {uploading ? `Uploading... ${uploadProgress}%` : 'Upload CSV'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


  const columns = [
    columnHelper.display({
      id: 'serialNumber',
      header: 'No.',
      cell: ({ row }) => (
        <div className='text-gray-700 font-medium'>
          {(currentPage - 1) * pageSize + row.index + 1}
        </div>
      )
    }),
    columnHelper.accessor('year', {
      header: 'YEAR',
      cell: ({ row }) => <span className='text-gray-900 font-medium'>{row.original.year}</span>
    }),
    columnHelper.accessor('month', {
      header: 'MONTH',
      cell: ({ row }) => (
        <span className='text-gray-900 capitalize'>{row.original.month}</span>
      )
    }),
    columnHelper.accessor('commodity', {
      header: 'COMMODITY',
      cell: ({ row }) => (
        <span className='text-gray-700 capitalize'>{row.original.commodity}</span>
      )
    }),
    columnHelper.accessor('item', {
      header: 'ITEM',
      cell: ({ row }) => (
        <span className='text-gray-700 capitalize'>{row.original.item}</span>
      )
    }),
    columnHelper.accessor('unit', {
      header: 'UNIT',
      cell: ({ row }) => <span className='text-gray-700'>{row.original.unit}</span>
    }),
    columnHelper.accessor('price', {
      header: 'PRICE',
      cell: ({ row }) => (
        <span className='text-gray-900 font-semibold'>₱{row.original.price.toFixed(2)}</span>
      )
    }),
    columnHelper.accessor('source', {
      header: 'SOURCE',
      cell: ({ row }) => (
        <span className='px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 capitalize'>
          {row.original.source}
        </span>
      )
    }),
    columnHelper.accessor('_id', {
      header: 'ACTION',
      cell: ({ row }) => {
        return (
          <div className='flex items-center gap-3'>
            <button
              onClick={() => {
                setEditData(row.original)
                setOpenEditModal(true)
              }}
              className='text-gray-500 hover:text-gray-700 transition-colors'
              title='Edit'
            >
              <MdEdit size={22} />
            </button>
            <button
              onClick={() => {
                setOpenDeleteConfirmBox(true)
                setDeleteEntry(row.original)
              }}
              className='text-gray-500 hover:text-gray-700 transition-colors'
              title='Delete'
            >
              <MdDelete size={22} />
            </button>
          </div>
        )
      }
    })
  ]


  const handleAISuggestPrice = async () => {
    if (!suggestName.trim()) {
      toast.error('Enter a product name')
      return
    }
    setSuggestLoading(true)
    setSuggestResult(null)
    setSuggestError('')
    setSuggestionRequested(true)
    try {
      const res = await Axios({
        ...SummaryApi.suggestPrice,
        data: { item_name: suggestName.trim() }
      })
      const payload = res.data
      if (!payload.success) {
        setSuggestError(payload.message || 'Failed to get suggestion')
        return
      }


      // Python returns:
      // payload.suggestedPrice (already includes 5% markup)
      // payload.bestModel
      // payload.data (contains next_preds, recommended, metrics, etc.)
      const full = payload.data
      const best = full.bestModel
      const basePred = full.next_preds?.[best]
      const finalWithMarkup = full.suggestedPrice            // already has 5% markup
      const markupAmount = basePred != null ? (finalWithMarkup - basePred) : null
      const metrics = full.metrics || {}


      // Build reason
      let reason = 'Chosen due to lowest RMSE among available models.'
      if (metrics && metrics[best] && metrics[best].RMSE != null) {
        // Compare RMSEs
        const rmseEntries = Object.entries(metrics)
          .filter(([m, v]) => v && v.RMSE != null)
          .sort((a, b) => a[1].RMSE - b[1].RMSE)
        if (rmseEntries.length > 0) {
            const ordered = rmseEntries.map(([m, v]) => `${m}: ${v.RMSE.toFixed(2)}`).join(', ')
            reason = `Selected because it has the lowest RMSE (${metrics[best].RMSE.toFixed(2)}). RMSE comparison -> ${ordered}.`
        }
      }


      setSuggestResult({
        item: full.item,
        bestModel: best,
        basePrediction: basePred,
        finalSuggestedPrice: finalWithMarkup,
        markupAmount,
        metrics,
        recommendedAll: full.recommended,
        nextPredsAll: full.next_preds,
        dataPoints: full.dataPoints,
        reason
      })
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Request failed'
      setSuggestError(msg)
    } finally {
      setSuggestLoading(false)
    }
  }

  const handleTrainModels = async () => {
  if (!trainingItem.trim()) {
    toast.error('Enter item name to train')
    return
  }

  setIsTraining(true)
  setTrainingProgress({ current: 0, total: trainingIterations })
  setSuggestionRequested(false) // ✅ Clear previous results
  setSuggestResult(null)
  setSuggestError('')

  try {
    const res = await Axios({
      ...SummaryApi.trainModels,
      data: {
        item: trainingItem.trim(),
        iterations: trainingIterations,
        testSize: 2
      }
    })

    if (res.data.success) {
      const modelSummary = Object.entries(res.data.bestModels)
        .filter(([_, model]) => model)
        .map(([name, model]) => `${name} (RMSE: ${model.rmse.toFixed(2)})`)
        .join(', ')
      
      toast.success(`✅ Training complete!\n${modelSummary}`)
      
      // Show results
      setSuggestResult({
        item: trainingItem,
        metrics: {
          Prophet: res.data.bestModels.Prophet?.accuracy || {},
          XGBoost: res.data.bestModels.XGBoost?.accuracy || {},
          LSTM: res.data.bestModels.LSTM?.accuracy || {}
        },
        bestModel: 'Training complete - best models saved',
        finalSuggestedPrice: 0,
        reason: 'Models trained and saved to database. Use "Get AI Price Suggestion" to see predictions.',
        dataPoints: 'N/A'
      })
    }
  } catch (error) {
    AxiosToastError(error)
  } finally {
    setIsTraining(false)
    setTrainingProgress(null)
  }
}

// In the return JSX, add this BEFORE the AI Suggestion Panel:

{/* MODEL TRAINING PANEL */}
<div className='bg-white border border-purple-200 rounded-lg p-5 mb-6 bg-purple-50'>
  <h2 className='text-lg font-semibold text-gray-900 mb-3'>Model Training</h2>
  <p className='text-sm text-gray-600 mb-4'>Train Prophet, XGBoost, and LSTM models to find the best one for price prediction</p>
  
  <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mb-4'>
    <div>
      <label className='text-sm font-medium text-gray-700 mb-1 block'>Item Name</label>
      <input
        type='text'
        value={trainingItem}
        onChange={(e) => setTrainingItem(e.target.value)}
        placeholder='e.g., Squash'
        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500'
      />
    </div>

    <div>
      <label className='text-sm font-medium text-gray-700 mb-1 block'>Iterations</label>
      <input
        type='number'
        value={trainingIterations}
        onChange={(e) => setTrainingIterations(Math.max(1, parseInt(e.target.value) || 1))}
        min='1'
        max='50'
        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500'
      />
    </div>
  </div>

  <button
    onClick={handleTrainModels}
    disabled={isTraining}
    className='w-full px-4 py-3 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2'
  >
    {isTraining ? (
      <>
        <span className='animate-spin'>⏳</span>
        Training ({trainingProgress?.current || 0}/{trainingProgress?.total || trainingIterations})
      </>
    ) : (
      <>
        🎯 Start Training
      </>
    )}
  </button>
</div>

  return (
    <section className="max-w-full p-6 overflow-x-hidden">
      {/* PAGE HEADER */}
      <div className='mb-6'>
        <h1 className='text-2xl font-semibold text-gray-900 mb-1'>AI Price Prediction System</h1>
        <p className='text-sm text-gray-500'>Train models first, then get price predictions</p>
      </div>

       {/* ==================== STEP 1: MODEL TRAINING PANEL ==================== */}
    <div className='bg-white border border-gray-200 rounded-lg p-6 mb-6'>
      <div className='flex items-center gap-3 mb-5'>
        <div>
          <h2 className='text-lg font-semibold text-gray-900'>Step 1: Train AI Models</h2>
          <p className='text-xs text-gray-600'>Train Prophet, XGBoost, and LSTM models to find the best predictor</p>
        </div>
      </div>
      
      <div className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='text-sm font-medium text-gray-700 mb-2 block'>
              Item Name <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              value={trainingItem}
              onChange={(e) => setTrainingItem(e.target.value)}
              placeholder='e.g., Squash, Tomato, Cabbage'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
            <p className='text-xs text-gray-500 mt-1'>Enter the exact product name from your database</p>
          </div>

          <div>
            <label className='text-sm font-medium text-gray-700 mb-2 block'>
              Training Iterations
            </label>
            <input
              type='number'
              value={trainingIterations}
              onChange={(e) => setTrainingIterations(Math.max(1, Math.min(50, parseInt(e.target.value) || 10)))}
              min='1'
              max='50'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
            <p className='text-xs text-gray-500 mt-1'>Recommended: 10-20 iterations</p>
          </div>
        </div>

        <button
          onClick={handleTrainModels}
          disabled={isTraining || !trainingItem.trim()}
          className='w-full px-4 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2'
        >
          {isTraining ? (
            <>
              <span className='animate-spin'>⏳</span>
              <span>Training... ({trainingProgress?.current || 0}/{trainingProgress?.total || trainingIterations})</span>
            </>
          ) : (
            <>
              <span>Start Training Models</span>
            </>
          )}
        </button>

        {isTraining && (
          <div className='space-y-2'>
            <div className='flex justify-between text-xs text-gray-600'>
              <span>Progress</span>
              <span>{Math.round(((trainingProgress?.current || 0) / (trainingProgress?.total || trainingIterations)) * 100)}%</span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2 overflow-hidden'>
              <div
                className='bg-purple-600 h-2 rounded-full transition-all duration-300'
                style={{ width: `${((trainingProgress?.current || 0) / (trainingProgress?.total || trainingIterations)) * 100}%` }}
              />
            </div>
            <p className='text-xs text-gray-500 text-center'>This may take 5-10 minutes...</p>
          </div>
        )}

        <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
          <p className='text-xs text-blue-800'>
            <strong>How it works:</strong> System trains 3 AI models ({trainingIterations}x each) and saves the best performer for faster predictions.
          </p>
        </div>
      </div>
    </div>

    {/* ==================== STEP 2: AI PRICE SUGGESTION PANEL ==================== */}
    <div className='bg-white border border-gray-200 rounded-lg p-6 mb-6'>
      <div className='flex items-center gap-3 mb-5'>
        <div>
          <h2 className='text-lg font-semibold text-gray-900'>Step 2: Get AI Price Suggestion</h2>
          <p className='text-xs text-gray-600'>Get instant price predictions using trained models</p>
        </div>
      </div>

      <div className='space-y-4'>
        <div className='flex flex-col sm:flex-row gap-3 items-start sm:items-end w-full'>
          <div className='flex-1 w-full'>
            <label className='text-sm font-medium text-gray-700 mb-2 block'>
              Product Name <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              value={suggestName}
              onChange={(e) => setSuggestName(e.target.value)}
              placeholder='e.g., Squash'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
            />
          </div>

          <button
            onClick={handleAISuggestPrice}
            disabled={suggestLoading || !suggestName.trim()}
            className='px-4 py-2 h-[38px] text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto transition-colors flex items-center justify-center gap-2'
          >
            {suggestLoading ? (
              <>
                <span className='animate-spin'>🔄</span>
                <span>Predicting...</span>
              </>
            ) : (
              <>
                <span>Suggest Price</span>
              </>
            )}
          </button>
        </div>

        {/* ERROR STATE */}
        {suggestError && (
          <div className='p-4 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg'>
            ❌ {suggestError}
          </div>
        )}

        {/* RESULT STATE */}
        {suggestionRequested && suggestResult && (
          <div className='space-y-4 mt-4'>
            {/* Summary Box */}
            <div className='p-4 bg-gray-50 border border-gray-200 rounded-lg'>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-3 text-sm'>
                <div>
                  <p className='text-gray-600 text-xs'>Item</p>
                  <p className='font-semibold text-gray-900 truncate'>{suggestResult.item}</p>
                </div>
                <div>
                  <p className='text-gray-600 text-xs'>Best Model</p>
                  <p className='font-semibold text-gray-900'>{suggestResult.bestModel}</p>
                </div>
                <div>
                  <p className='text-gray-600 text-xs'>Data Points</p>
                  <p className='font-semibold text-gray-900'>{suggestResult.dataPoints}</p>
                </div>
                <div>
                  <p className='text-gray-600 text-xs'>Final Price</p>
                  <p className='font-semibold text-green-600'>₱{suggestResult.finalSuggestedPrice?.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Predictions Grid */}
            <div className='grid md:grid-cols-2 gap-4'>
              <div className='p-4 border border-gray-200 rounded-lg'>
                <h4 className='font-semibold text-gray-900 mb-3 text-sm'>Predictions (Next)</h4>
                <div className='space-y-2 text-sm'>
                  {Object.entries(suggestResult.nextPredsAll || {}).map(([m, v]) => (
                    <div key={m} className='flex justify-between items-center'>
                      <span className='text-gray-600'>{m}</span>
                      <span className='font-medium text-gray-900'>₱{Number(v).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className='p-4 border border-gray-200 rounded-lg'>
                <h4 className='font-semibold text-gray-900 mb-3 text-sm'>Recommended (5% Markup)</h4>
                <div className='space-y-2 text-sm'>
                  {Object.entries(suggestResult.recommendedAll || {}).map(([m, v]) => (
                    <div key={m} className='flex justify-between items-center'>
                      <span className='text-gray-600'>{m}</span>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium text-gray-900'>₱{Number(v).toFixed(2)}</span>
                        {m === suggestResult.bestModel && (
                          <span className='px-2 py-0.5 text-xs font-semibold text-green-700 bg-green-100 rounded'>
                            ✓ Chosen
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Model Accuracy Table */}
            <div className='p-4 border border-gray-200 rounded-lg'>
              <h4 className='font-semibold text-gray-900 mb-3 text-sm'>Model Accuracy</h4>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b border-gray-200'>
                      <th className='text-left py-2 px-2 font-medium text-gray-700'>Model</th>
                      <th className='text-right py-2 px-2 font-medium text-gray-700'>MAE</th>
                      <th className='text-right py-2 px-2 font-medium text-gray-700'>RMSE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(suggestResult.metrics || {}).map(([m, vals]) => (
                      <tr key={m} className='border-b border-gray-100 hover:bg-gray-50'>
                        <td className='py-2 px-2'>
                          <div className='flex items-center gap-2'>
                            <span className='text-gray-900'>{m}</span>
                            {m === suggestResult.bestModel && (
                              <span className='text-xs text-green-600 font-semibold'>BEST</span>
                            )}
                          </div>
                        </td>
                        <td className='py-2 px-2 text-right text-gray-900'>{vals.MAE?.toFixed(2) || '—'}</td>
                        <td className='py-2 px-2 text-right font-semibold text-gray-900'>{vals.RMSE?.toFixed(2) || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Final Price Box */}
            <div className='p-4 bg-green-50 border border-green-200 rounded-lg'>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Base Prediction</span>
                  <span className='font-medium text-gray-900'>₱{suggestResult.basePrediction?.toFixed(2)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Markup (5%)</span>
                  <span className='font-medium text-gray-900'>₱{suggestResult.markupAmount?.toFixed(2)}</span>
                </div>
                <div className='pt-2 border-t border-green-200 flex justify-between'>
                  <span className='font-semibold text-gray-900'>Final Suggested Price</span>
                  <span className='font-bold text-lg text-green-700'>₱{suggestResult.finalSuggestedPrice?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800'>
              <p><strong>Why this model?</strong> {suggestResult.reason}</p>
            </div>
          </div>
        )}
      </div>
    </div>

      {/* PAGE HEADER */}
      <div className='mb-6'>
        <h1 className='text-2xl font-semibold text-gray-900 mb-1'>Price Suggestion Data</h1>
        <p className='text-sm text-gray-500'>{total} total entries</p>
      </div>


      {/* SEARCH + ACTION BAR */}
      <div className='bg-white p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div className='relative flex-1 max-w-xs w-full'>
          <IoSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={20} />
          <input
            type='text'
            placeholder='Search commodity, item, month, year...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>


        <div className='flex flex-wrap gap-3 w-full sm:w-auto'>
          <button
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50'
          >
            {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
          </button>


          <button
            onClick={handleSyncProducts}
            disabled={syncing}
            className='px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-300 rounded-lg hover:bg-purple-100 disabled:opacity-50'
          >
            {syncing ? 'Syncing...' : 'Sync Products'}
          </button>


          <button
            onClick={() => setOpenUploadCSV(true)}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50'
          >
            Upload CSV
          </button>


          <button
            onClick={() => setOpenAddModal(true)}
            className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700'
          >
            Add Entry
          </button>
        </div>
      </div>


      {/* TABLE */}
      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto sm:overflow-visible'>
          {loading ? (
            <div className='p-8 text-center text-gray-500'>Loading...</div>
          ) : filteredData.length === 0 ? (
            <div className='p-8 text-center text-gray-500'>No price data found.</div>
          ) : (
            <DisplayTable data={filteredData} column={columns} />
          )}
        </div>
      </div>


      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className='mt-4 mb-24 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>


          <div className='text-sm text-gray-600'>
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, total)} of {total}
          </div>


          <div className='flex items-center gap-2 overflow-x-auto sm:overflow-visible w-full sm:w-auto py-1'>
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className='px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg disabled:opacity-50'
            >
              Previous
            </button>


            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1
              if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 text-sm rounded-lg ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                )
              }
              if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className='px-2 text-gray-500'>...</span>
              }
              return null
            })}


            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className='px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg disabled:opacity-50'
            >
              Next
            </button>
          </div>
        </div>
      )}


      {/* MODALS */}
      {openDeleteConfirmBox && (
        <ConfirmBox cancel={() => setOpenDeleteConfirmBox(false)} close={() => setOpenDeleteConfirmBox(false)} confirm={handleDeleteEntry} />
      )}


      {openAddModal && <AddEditModal isEdit={false} />}
      {openEditModal && <AddEditModal isEdit={true} />}
      {openUploadCSV && <CSVUploadModal />}
    </section>
  )
}


export default PriceSuggestionPage

