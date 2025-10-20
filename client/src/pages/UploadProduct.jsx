import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaCloudUploadAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import Axios from '../utils/Axios';
import uploadImage from '../utils/UploadImage';
import successAlert from '../utils/SuccessAlert';
import AxiosToastError from '../utils/AxiosToastError';
import SummaryApi from '../common/SummaryApi';
import Loading from '../components/Loading';
import ViewImage from '../components/ViewImage';
import AddFieldComponent from '../components/AddFieldComponent';

const UploadProduct = () => {
  const [data, setData] = useState({
    name: "",
    image: [],
    category: [],
    subCategory: [],
    unit: "",
    stock: "",
    price: "",
    discount: "",
    description: "",
    more_details: {},
  });

  const [openSubDropdown, setOpenSubDropdown] = useState(false);
  const [openCatDropdown, setOpenCatDropdown] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [ViewImageURL, setViewImageURL] = useState("");
  const [selectCategory, setSelectCategory] = useState("");
  const [selectSubCategory, setSelectSubCategory] = useState("");
  const [openAddField, setOpenAddField] = useState(false);
  const [fieldName, setFieldName] = useState("");
  const [hoveredSubCategory, setHoveredSubCategory] = useState(null);

  const allCategory = useSelector(state => state.product.allCategory);
  const allSubCategory = useSelector(state => state.product.allSubCategory);
  const user = useSelector(state => state.user);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageLoading(true);
    try {
      const response = await uploadImage(file);
      const { data: ImageResponse } = response;
      const imageUrl = ImageResponse.data.url;

      setData(prev => ({
        ...prev,
        image: [...prev.image, imageUrl]
      }));
    } catch (error) {
      console.error("Image upload failed:", error);
    } finally {
      setImageLoading(false);
    }
  };

  const handleDeleteImage = (index) => {
    const updatedImages = [...data.image];
    updatedImages.splice(index, 1);
    setData(prev => ({
      ...prev,
      image: updatedImages
    }));
  };

  const handleRemoveCategory = (index) => {
    const updatedCategories = [...data.category];
    updatedCategories.splice(index, 1);
    setData(prev => ({
      ...prev,
      category: updatedCategories
    }));
  };

  const handleRemoveSubCategory = (index) => {
    const updatedSubCategories = [...data.subCategory];
    updatedSubCategories.splice(index, 1);
    setData(prev => ({
      ...prev,
      subCategory: updatedSubCategories
    }));
  };

  const handleAddField = () => {
    if (!fieldName.trim()) return;

    setData(prev => ({
      ...prev,
      more_details: {
        ...prev.more_details,
        [fieldName]: ""
      }
    }));
    setFieldName("");
    setOpenAddField(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("data", data);

    try {
      const response = await Axios({
        ...SummaryApi.createProduct,
        data: {
          ...data,
          userId: user?._id
        }
      });

      const { data: responseData } = response;

      if (responseData.success) {
        successAlert(responseData.message);
        setData({
          name: "",
          image: [],
          category: [],
          subCategory: [],
          unit: "",
          stock: "",
          price: "",
          discount: "",
          description: "",
          more_details: {},
        });
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  // Helper function to get description for a subcategory
  const getSubCategoryDescription = (subCategoryName) => {
    const subCategory = allSubCategory.find(sc => sc.name === subCategoryName);
    return subCategory?.description || "No description available";
  };

  return (
    <section className=''>
      <div className='p-2 bg-white shadow-md flex items-center justify-between'>
        <h2 className='font-semibold'>Upload Product</h2>
      </div>

      <div className='grid p-3'>
        <form className='grid gap-4' onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className='grid gap-1'>
            <label htmlFor='name' className='font-medium'>Name</label>
            <input
              id='name'
              type='text'
              placeholder='Enter product name'
              name='name'
              value={data.name}
              onChange={handleChange}
              required
              className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
            />
          </div>

          {/* Description Field */}
          <div className='grid gap-1'>
            <label htmlFor='description' className='font-medium'>Description</label>
            <textarea
              id='description'
              type='text'
              placeholder='Enter product description'
              name='description'
              value={data.description}
              onChange={handleChange}
              required
              multiple
              rows={3}
              className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded resize-none'
            />
          </div>

          {/* Image Upload */}
          <div>
            <p className='font-medium'>Image</p>
            <div>
              <label htmlFor='productImage' className='bg-blue-50 h-24 border rounded flex justify-center items-center cursor-pointer'>
                <div className='text-center flex justify-center items-center flex-col'>
                  {imageLoading ? (
                    <Loading />
                  ) : (
                    <>
                      <FaCloudUploadAlt size={35} />
                      <p>Upload Image</p>
                    </>
                  )}
                </div>
                <input
                  type='file'
                  id='productImage'
                  className='hidden'
                  accept='image/*'
                  onChange={handleUploadImage}
                />
              </label>
              
              {/* Display Uploaded Images */}
              <div className='flex flex-wrap gap-4'>
                {data.image.map((img, index) => (
                  <div key={img + index} className='h-20 mt-1 w-20 min-w-20 bg-blue-50 border relative group'>
                    <img
                      src={img}
                      alt={img}
                      className='w-full h-full object-scale-down cursor-pointer'
                      onClick={() => setViewImageURL(img)}
                    />
                    <div
                      onClick={() => handleDeleteImage(index)}
                      className='absolute bottom-0 right-0 p-1 bg-red-600 hover:bg-red-600 rounded text-white hidden group-hover:block cursor-pointer'
                    >
                      <MdDelete />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category Selection */}
          <div className='grid gap-1 relative'>
            <label className='font-medium'>Category</label>
            <div className='relative'>
              <button
                type="button"
                onClick={() => setOpenCatDropdown(prev => !prev)}
                className='bg-blue-50 border w-full p-2 rounded text-left'
              >
                {selectCategory ? selectCategory.name : "Select Category"}
              </button>

              {openCatDropdown && (
                <div className='absolute left-0 mt-1 w-full bg-white border rounded shadow-lg z-50 max-h-48 overflow-y-auto'>
                  {allCategory.map((c) => (
                    <div
                      key={c._id}
                      className='px-3 py-2 hover:bg-blue-100 cursor-pointer'
                      onClick={() => {
                        setData(prev => ({
                          ...prev,
                          category: [...prev.category, c],
                        }));
                        setSelectCategory(c);
                        setOpenCatDropdown(false);
                      }}
                    >
                      {c.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className='flex flex-wrap gap-3 mt-2'>
              {data.category.map((c, index) => (
                <div
                  key={c._id + index}
                  className='text-sm flex items-center gap-1 bg-blue-50 px-2 py-1 rounded'
                >
                  <p>{c.name}</p>
                  <IoClose
                    onClick={() => handleRemoveCategory(index)}
                    className='cursor-pointer hover:text-red-500'
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Sub Category Selection with Hover Descriptions */}
          <div className='grid gap-1 relative'>
            <label className='font-medium'>Sub Category</label>
            <div className='relative'>
              <button
                type="button"
                onClick={() => setOpenSubDropdown(!openSubDropdown)}
                className='bg-blue-50 border w-full p-2 rounded text-left'
              >
                {selectSubCategory ? selectSubCategory.name : "Select Subcategory"}
              </button>

              {openSubDropdown && (
                <div className='absolute left-0 mt-1 w-full bg-white border rounded shadow-lg z-50 max-h-48 overflow-y-auto'>
                  {allSubCategory.map((c) => (
                    <div
                      key={c._id}
                      className='px-3 py-2 hover:bg-blue-100 cursor-pointer relative group'
                      onMouseEnter={() => setHoveredSubCategory(c.name)}
                      onMouseLeave={() => setHoveredSubCategory(null)}
                      onClick={() => {
                        setData(prev => ({
                          ...prev,
                          subCategory: [...prev.subCategory, c],
                        }));
                        setSelectSubCategory(c);
                        setOpenSubDropdown(false);
                      }}
                    >
                      {c.name}
                      
                      {/* Hover Tooltip - Show description from API */}
                      {hoveredSubCategory === c.name && (
                        <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded w-64 z-50 shadow-lg">
                          <div className="font-semibold mb-1 text-white border-b border-gray-600 pb-1">{c.name}</div>
                          <div className="text-gray-200 leading-relaxed">
                            {c.description || "No description available"}
                          </div>
                          {/* Tooltip arrow */}
                          <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Display Selected Subcategories */}
            <div className='flex flex-wrap gap-3 mt-2'>
              {data.subCategory.map((c, index) => (
                <div 
                  key={c._id + index} 
                  className='text-sm flex items-center gap-1 bg-blue-50 px-2 py-1 rounded group relative'
                >
                  <p>{c.name}</p>
                  <IoClose
                    onClick={() => handleRemoveSubCategory(index)}
                    className='cursor-pointer hover:text-red-500'
                  />
                  
                  {/* Show description on hover for selected subcategories too */}
                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs px-3 py-2 rounded w-64 z-50 shadow-lg">
                    <div className="font-semibold mb-1 text-white border-b border-gray-600 pb-1">{c.name}</div>
                    <div className="text-gray-200 leading-relaxed">
                      {c.description || "No description available"}
                    </div>
                    {/* Tooltip arrow pointing down */}
                    <div className="absolute top-full left-4 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Unit Field */}
          <div className='grid gap-1'>
            <label htmlFor='unit' className='font-medium'>Unit</label>
            <input
              id='unit'
              type='text'
              placeholder='Enter product unit'
              name='unit'
              value={data.unit}
              onChange={handleChange}
              required
              className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
            />
          </div>

          {/* Stock Field */}
          <div className='grid gap-1'>
            <label htmlFor='stock' className='font-medium'>Number of Stock</label>
            <input
              id='stock'
              type='number'
              placeholder='Enter product stock'
              name='stock'
              value={data.stock}
              onChange={handleChange}
              required
              className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
            />
          </div>

          {/* Price Field */}
          <div className='grid gap-1'>
            <label htmlFor='price' className='font-medium'>Price</label>
            <input
              id='price'
              type='number'
              placeholder='Enter product price'
              name='price'
              value={data.price}
              onChange={handleChange}
              required
              className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
            />
          </div>

          {/* Discount Field */}
          <div className='grid gap-1'>
            <label htmlFor='discount' className='font-medium'>Discount</label>
            <input
              id='discount'
              type='number'
              placeholder='Enter product discount'
              name='discount'
              value={data.discount}
              onChange={handleChange}
              required
              className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
            />
          </div>

          {/* Additional Fields */}
          {Object.keys(data?.more_details).map((k, index) => (
            <div key={k + index} className='grid gap-1'>
              <label htmlFor={k} className='font-medium'>{k}</label>
              <input
                id={k}
                type='text'
                value={data?.more_details[k]}
                onChange={(e) => {
                  const value = e.target.value;
                  setData(prev => ({
                    ...prev,
                    more_details: {
                      ...prev.more_details,
                      [k]: value
                    }
                  }));
                }}
                required
                className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
              />
            </div>
          ))}

          {/* Add Fields Button */}
          <div
            onClick={() => setOpenAddField(true)}
            className='hover:bg-primary-200 bg-white py-1 px-3 w-32 text-center font-semibold border border-primary-200 hover:text-neutral-900 cursor-pointer rounded'
          >
            Add Fields
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className='bg-primary-100 hover:bg-primary-200 py-2 rounded font-semibold'
          >
            Submit
          </button>
        </form>
      </div>

      {/* Modals */}
      {ViewImageURL && (
        <ViewImage url={ViewImageURL} close={() => setViewImageURL("")} />
      )}

      {openAddField && (
        <AddFieldComponent
          value={fieldName}
          onChange={(e) => setFieldName(e.target.value)}
          submit={handleAddField}
          close={() => setOpenAddField(false)}
        />
      )}
    </section>
  );
};

export default UploadProduct;