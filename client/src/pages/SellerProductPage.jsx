import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import CardProduct from '../components/CardProduct'
import { MdStorefront, MdLocationOn } from 'react-icons/md'

const formatAddress = (addr) => {
  if (!addr) return ''
  const parts = [
    addr.address_line || addr.addressLine || addr.street,
    addr.barangay || addr.area,
    addr.city,
    addr.province || addr.state,
    addr.region,
    addr.zipCode || addr.postalCode
  ].filter(Boolean)
  return parts.join(', ')
}

const SellerProductPage = () => {
  const { sellerId } = useParams()
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [sellerName, setSellerName] = useState('')
  const [sellerAddress, setSellerAddress] = useState('')
  const [total, setTotal] = useState(0)

  const fetchSellerProducts = async () => {
    if (!sellerId) return
    try {
      setLoading(true)
      const res = await Axios({
        ...SummaryApi.getProductBySeller,
        data: { sellerId, limit: 200 }
      })
      if (res.data?.success) {
        const list = res.data.data || []
        setProducts(list)
        setTotal(list.length)

        const user = list?.[0]?.userId
        const maybeName =
          user?.name || user?.fullName || user?.sellerName || ''
        if (maybeName) setSellerName(maybeName)

        // Prefer address_details from populated user
        const addr =
          (Array.isArray(user?.address_details) && user.address_details[0]) ||
          null
        if (addr) setSellerAddress(formatAddress(addr))
      }
    } catch (err) {
      AxiosToastError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSellerProducts()
  }, [sellerId])

  const fetchSellerAddress = async () => {
    if (!sellerId) return
    try {
      const res = await Axios({
        ...SummaryApi.getSellerPickupAddress,
        data: { sellerId }
      })
      if (res.data?.success) {
        const addr = Array.isArray(res.data.data)
          ? res.data.data?.[0]
          : res.data.data
        setSellerAddress(formatAddress(addr) || '')
        // In case name lives on address payload
        const maybeName =
          addr?.contact_name ||
          addr?.name ||
          addr?.sellerName ||
          ''
        if (maybeName && !sellerName) setSellerName(maybeName)
      }
    } catch (err) {
      // Do not toast as error might be normal if address not set
      console.warn('Pickup address not available for seller:', sellerId)
    }
  }


  return (
    <section className="bg-gray-50 min-h-screen py-6">
      <div className="container mx-auto px-4">
        {/* Seller Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                <MdStorefront size={22} />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  {sellerName || 'Seller'}
                </h1>
                <div className="flex items-start gap-2 text-gray-600 text-sm mt-0.5">
                  <MdLocationOn className="text-green-600 mt-0.5" />
                  <span>
                    {sellerAddress || 'Seller address not available'}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {loading ? 'Loading products…' : `${total} item(s)`}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading && products.length === 0 ? (
          <div className="text-center text-gray-500 py-12">Loading…</div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            No products from this seller yet.
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {products.map((p) => (
              <CardProduct key={p._id} data={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default SellerProductPage