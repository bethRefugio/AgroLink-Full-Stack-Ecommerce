import React from 'react'
import banner from '../assets/agrolink-banner4.svg'
import { useSelector } from 'react-redux'
import { valideURLConvert } from '../utils/valideURLConvert'
import {Link, useNavigate} from 'react-router-dom'
import CategoryWiseProductDisplay from '../components/CategoryWiseProductDisplay'

const Home = () => {
  const loadingCategory = useSelector(state => state.product.loadingCategory)
  const categoryData = useSelector(state => state.product.allCategory)
  const subCategoryData = useSelector(state => state.product.allSubCategory)
  const navigate = useNavigate()

  const handleRedirectProductListpage = (id,cat)=>{
      console.log(id,cat)
      const subcategory = subCategoryData.find(sub =>{
        const filterData = sub.category.some(c => {
          return c._id == id
        })

        return filterData ? true : null
      })
      const url = `/${valideURLConvert(cat)}-${id}/${valideURLConvert(subcategory.name)}-${subcategory._id}`

      navigate(url)
      console.log(url)
  }


  return (
   <section className='bg-white'>
       <div className="w-full relative" style={{ aspectRatio: '4 / 1' }}>
        <img
          src={banner}
          alt="banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>  
      
      {/* Featured Categories Section */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Choose Your Featured Categories</h2>
        
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
          {
            loadingCategory ? (
              new Array(5).fill(null).map((c,index)=>{
                return(
                  <div key={index+"loadingcategory"} className='bg-gray-100 rounded-2xl p-6 min-h-40 flex flex-col items-center justify-center gap-3 shadow-sm animate-pulse'>
                    <div className='bg-gray-200 w-20 h-20 rounded-full'></div>
                    <div className='bg-gray-200 h-4 w-24 rounded'></div>
                  </div>
                )
              })
            ) : (
              categoryData.slice(0, 5).map((cat,index)=>{
                const bgColors = [
                  'bg-red-50',
                  'bg-green-50', 
                  'bg-yellow-50',
                  'bg-pink-50',
                  'bg-purple-50'
                ];
                return(
                  <div 
                    key={cat._id+"displayCategory"} 
                    className={`${bgColors[index % 5]} rounded-2xl p-6 min-h-40 flex flex-col items-center justify-center gap-3 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1`}
                    onClick={()=>handleRedirectProductListpage(cat._id,cat.name)}
                  >
                    <div className="w-20 h-20 flex items-center justify-center">
                      <img 
                        src={cat.image}
                        alt={cat.name}
                        className='w-full h-full object-contain'
                      />
                    </div>
                    <h3 className="font-semibold text-gray-800 text-center text-sm">{cat.name}</h3>
                  </div>
                )
              })
            )
          }
        </div>
      </div>

      {/* Best Selling Products Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Today's Best Selling Product!</h2>
        </div>
        
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button className="px-6 py-2 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors">
            All
          </button>
          <button className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors">
            Fruits
          </button>
          <button className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors">
            Meat Stocks
          </button>
          <button className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors">
            Breakfast Dishes
          </button>
          <button className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors">
            Card & Wapers
          </button>
          <button className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors">
            Continental Milk
          </button>
          <button className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors">
            Fruit & Juices
          </button>
        </div>
      </div>

      {/* Category-wise Product Display */}
      {
        categoryData?.map((c,index)=>{
          return(
            <CategoryWiseProductDisplay 
              key={c?._id+"CategorywiseProduct"} 
              id={c?._id} 
              name={c?.name}
            />
          )
        })
      }

      {/* Promotional Banners Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Best Online Deals Banner */}
          <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-2xl p-8 relative overflow-hidden">
            <div className="relative z-10">
              <div className="inline-block bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                Exclusive Offer - 15% OFF
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">
                Best Online Deals, Free Stuff
              </h3>
              <p className="text-gray-600 mb-6">
                Only on this week... Don't miss
              </p>
              <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-full transition-colors">
                Get Best Deal →
              </button>
            </div>
          </div>

          {/* Cash-back Banner */}
          <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-2xl p-8 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-green-600 font-medium text-sm mb-2">Regular Offer</p>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">
                10% cash-back on personal care
              </h3>
              <p className="text-gray-600 mb-6">
                Max cashback: $12. Code: CARE12
              </p>
              <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-full transition-colors">
                Browse Now →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Organic Products CTA Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-yellow-50 to-green-50 rounded-3xl overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-8 items-center p-8 lg:p-12">
            {/* Left Image */}
            <div className="order-2 lg:order-1">
              <img 
                src={banner} 
                alt="Fresh vegetables"
                className="w-full h-auto"
              />
            </div>
            
            {/* Right Content */}
            <div className="order-1 lg:order-2 space-y-6">
              <p className="text-green-600 font-medium text-sm uppercase tracking-wide">
                Organic & Garden Fresh
              </p>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Need Organic & quality product everyday?
              </h2>
              <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-full transition-colors duration-200 shadow-md hover:shadow-lg">
                Browse All →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Call-to-Action Cards Section */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Ready to get started?</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Grow Business Card */}
          <div className="bg-gradient-to-br from-pink-100 to-pink-50 rounded-2xl p-8">
            <div className="w-12 h-12 bg-pink-200 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Grow my business with FoodCart
            </h3>
            <p className="text-gray-600 mb-6">
              Let us help your business reach more buyers and grow revenue
            </p>
            <button className="text-pink-600 font-semibold hover:text-pink-700 transition-colors flex items-center gap-2">
              Learn More →
            </button>
          </div>

          {/* Advertise Card */}
          <div className="bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-2xl p-8">
            <div className="w-12 h-12 bg-cyan-200 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Advertise brand on FoodieCart
            </h3>
            <p className="text-gray-600 mb-6">
              Let us help your business reach more buyers and grow revenue
            </p>
            <button className="text-cyan-600 font-semibold hover:text-cyan-700 transition-colors flex items-center gap-2">
              Learn More →
            </button>
          </div>

          {/* Learn More Card */}
          <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl p-8">
            <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Learn more about FoodieCart
            </h3>
            <p className="text-gray-600 mb-6">
              Let us help your business reach more buyers and grow revenue
            </p>
            <button className="text-purple-600 font-semibold hover:text-purple-700 transition-colors flex items-center gap-2">
              Learn More →
            </button>
          </div>
        </div>
      </div>

   </section>
  )
}

export default Home