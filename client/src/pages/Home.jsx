import React, { useState, useMemo, useEffect } from 'react'
import banner from '../assets/agrolink-banner4.svg'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import CardProduct from '../components/CardProduct'
import CategoryWiseProductDisplay from '../components/CategoryWiseProductDisplay'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import CardLoading from '../components/CardLoading'
import isSeller from '../utils/isSeller'


const Home = () => {
  const loadingCategory = useSelector(state => state.product.loadingCategory)
  const categoryData = useSelector(state => state.product.allCategory)
  const subCategoryData = useSelector(state => state.product.allSubCategory)
  const user = useSelector(state => state.user)
  const navigate = useNavigate()


  const [activeCategory, setActiveCategory] = useState('all')
  const [userPreferences, setUserPreferences] = useState([])
  const [prefLoading, setPrefLoading] = useState(false)
  const [preferredProducts, setPreferredProducts] = useState([])


  const seller = isSeller(user.role)


  // fetch preferences once
  useEffect(() => {
    if (seller) return // Skip if seller
   
    const loadPrefs = async () => {
      try {
        const res = await Axios({ ...SummaryApi.getPreferences })
        if (res.data.success) setUserPreferences(res.data.data || [])
      } catch (e) {
        AxiosToastError(e)
      }
    }
    loadPrefs()
  }, [seller])


  // build (categoryId, subCategoryId) pairs from name-only prefs
  useEffect(() => {
    if (seller) return // Skip if seller
   
    const run = async () => {
      if (!userPreferences.length || !categoryData.length || !subCategoryData.length) return
      setPrefLoading(true)
      try {
        const pairs = userPreferences.map(p => {
          const cat = categoryData.find(c => c.name === p.category)
          if (!cat) return null
          const sub = subCategoryData.find(sc =>
            sc.name === p.subCategory && sc.category?.some(c => c._id === cat._id)
          )
          if (!sub) return null
          return { categoryId: cat._id, subCategoryId: sub._id }
        }).filter(Boolean)


        // dedupe pairs
        const uniqMap = new Set()
        const uniqPairs = []
        for (const pr of pairs) {
          const k = pr.categoryId + '-' + pr.subCategoryId
            if (!uniqMap.has(k)) {
              uniqMap.add(k)
              uniqPairs.push(pr)
            }
        }


        // parallel fetch
        const requests = uniqPairs.map(pr =>
          Axios({
            ...SummaryApi.getProductByCategoryAndSubCategory,
            data: { categoryId: pr.categoryId, subCategoryId: pr.subCategoryId }
          }).catch(err => ({ error: err }))
        )


        const results = await Promise.all(requests)
        const collected = []
        results.forEach(r => {
          if (r?.data?.success && Array.isArray(r.data.data)) {
            collected.push(...r.data.data)
          }
        })


        // dedupe products
        const map = new Map()
        for (const prod of collected) {
          if (!map.has(prod._id)) map.set(prod._id, prod)
        }
        setPreferredProducts(Array.from(map.values()))
      } catch (e) {
        AxiosToastError(e)
      } finally {
        setPrefLoading(false)
      }
    }
    run()
  }, [seller, userPreferences, categoryData, subCategoryData])


  const filterPills = useMemo(() => [{ _id: 'all', name: 'All' }, ...categoryData], [categoryData])


  const handleRedirectProductListpage = (id, name) => {
    const sub = subCategoryData.find(s => s.category.some(c => c._id === id))
    if (!sub) return
    navigate(`/category/${id}/${sub._id}`)
  }


  return (
    <section className='bg-white overflow-x-hidden'>
      {/* banner */}
      <div className="w-full relative" style={{ aspectRatio: '4 / 1' }}>
        <img src={banner} alt="banner" className="absolute inset-0 w-full h-full object-cover" />
      </div>


      {/* Headline + preference products - Hide for sellers */}
      {!seller && (
        <div className="container mx-auto px-4 md:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Daily Fresh Finds!</h2>
          </div>


        {/* preference product cards */}
        <div>
          {prefLoading && (
            <div className='flex flex-wrap gap-4'>
              {new Array(8).fill(null).map((_, i) => <CardLoading key={'pref-load-' + i} />)}
            </div>
          )}


            {!prefLoading && userPreferences.length === 0 && (
              <p className='text-sm text-gray-500'>Add preferences in your profile to see personalized picks.</p>
            )}


            {!prefLoading && userPreferences.length > 0 && preferredProducts.length === 0 && (
              <p className='text-sm text-gray-500'>No products found for your preferred subcategories.</p>
            )}


            {!prefLoading && preferredProducts.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {preferredProducts.map(p => (
                  <CardProduct key={p._id} data={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}


      {/* category filter pills */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap gap-3">
          {loadingCategory
            ? new Array(6).fill(null).map((_, i) => (
                <div key={'pill-skel-' + i} className="px-6 py-2 bg-gray-100 rounded-full animate-pulse h-10 w-28" />
              ))
            : filterPills.map(cat => {
                const isActive = activeCategory === cat._id
                return (
                  <button
                    key={cat._id}
                    onClick={() => setActiveCategory(cat._id)}
                    className={isActive
                      ? "px-6 py-2 bg-green-600 text-white rounded-full font-medium shadow"
                      : "px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50"}
                  >
                    {cat.name}
                  </button>
                )
              })}
        </div>
      </div>


      {/* category sections */}
      {activeCategory === 'all'
        ? categoryData.map(c => (
            <CategoryWiseProductDisplay key={c._id} id={c._id} name={c.name} />
          ))
        : <CategoryWiseProductDisplay id={activeCategory} name={categoryData.find(c => c._id === activeCategory)?.name || ''} />
      }


   
    {/* Promotional Banners */}
    {/*
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6">


        <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-2xl  relative overflow-hidden  p-5 md:p-8 aspect-[7/3] md:aspect-auto">
            <div className="relative z-10">
              <div className="inline-block bg-green-600 text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded-full mb-3 md:mb-4">
                Exclusive Offer - 15% OFF
              </div>
              <h3 className="text-lg md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">
                Best Online Deals, Free Stuff
              </h3>
              <p className="text-xs md:text-base text-gray-600 mb-4 md:mb-6">
                Only on this week... Don't miss
              </p>
              <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 md:px-6 md:py-3 rounded-full text-xs md:text-basetransition-colors">
                Get Best Deal →
              </button>
            </div>
          </div>


          <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-2xl  overflow-hidden p-5 md:p-8 aspect-[7/3] md:aspect-auto">
            <div className="relative z-10">
              <p className="text-green-600 font-medium text-[10px] md:text-sm mb-2">
                Regular Offer
              </p>
              <h3 className="text-lg md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">
                10% cash-back on your first order
              </h3>
              <p className="text-xs md:text-base text-gray-600 mb-4 md:mb-6">
                Promo Code: AGROLINKPH12
              </p>
              <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 md:px-6 md:py-3 rounded-full text-xs md:text-basetransition-colors">
                Browse Now →
              </button>
            </div>
          </div>
        </div>
      </div>
    */}
    </section>
  )
}


export default Home

