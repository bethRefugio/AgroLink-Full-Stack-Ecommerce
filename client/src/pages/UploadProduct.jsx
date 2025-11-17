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
    discount: "0",
    description: "",
    more_details: {},
  });

  const [openSubDropdown, setOpenSubDropdown] = useState(false);
  const [openCatDropdown, setOpenCatDropdown] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [ViewImageURL, setViewImageURL] = useState("");
  const [selectCategory, setSelectCategory] = useState("");
  const [selectSubCategory, setSelectSubCategory] = useState("");
  const [openUnitDropdown, setOpenUnitDropdown] = useState(false);
  const [openAddField, setOpenAddField] = useState(false);
  const [fieldName, setFieldName] = useState("");
  const [hoveredSubCategory, setHoveredSubCategory] = useState(null);

  const allCategory = useSelector(state => state.product.allCategory);
  const allSubCategory = useSelector(state => state.product.allSubCategory);
  const user = useSelector(state => state.user);

  const [filteredSubCategories, setFilteredSubCategories] = useState([]);

  const [isSuggestingPrice, setIsSuggestingPrice] = useState(false);
  const [suggestedPrice, setSuggestedPrice] = useState(null);
  const [bestModel, setBestModel] = useState("");
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [suggestionError, setSuggestionError] = useState("");
  const [showSuggestionErrorModal, setShowSuggestionErrorModal] = useState(false);

  useEffect(() => {
    const fetchFilteredSubCategories = async () => {
      if (!selectCategory || !selectCategory._id) {
        setFilteredSubCategories([]);
        return;
      }

      try {
        const res = await Axios({
          ...SummaryApi.getSubCategory,
          data: { _id: selectCategory._id }
        });

        if (res.data.success) {
          setFilteredSubCategories(res.data.data || []);
        }
      } catch (error) {
        AxiosToastError(error);
        setFilteredSubCategories([]);
      }
    };

    fetchFilteredSubCategories();
  }, [selectCategory]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'discount') {
      const discountValue = value.trim() === '' ? '0' : value;
      setData(prev => ({
        ...prev,
        [name]: discountValue
      }));
    } else {
      setData(prev => ({
        ...prev,
        [name]: value
      }));
    }
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

    if (selectCategory && updatedCategories.length === 0) {
      setSelectCategory("");
      setFilteredSubCategories([]);
    }
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
          discount: "0",
          description: "",
          more_details: {},
        });
        setSelectCategory("");
        setSelectSubCategory("");
        setFilteredSubCategories([]);
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  const handleSuggestPrice = async () => {
    if (!data.name || data.name.trim() === "") {
      AxiosToastError({ message: "Please enter a product name first." });
      return;
    }

    setIsSuggestingPrice(true);
    setSuggestedPrice(null);
    setBestModel("");
    setSuggestionError("");
    setShowSuggestionErrorModal(false);

    try {
      const res = await Axios({
        ...SummaryApi.suggestPrice,
        data: { item_name: data.name.trim() }
      });

      const { data: resData } = res;

      if (resData?.suggestedPrice != null) {
        setSuggestedPrice(Number(resData.suggestedPrice));
        setBestModel(resData.bestModel || "");
        setShowSuggestionModal(true);
      } else {
        const msg = resData?.message || "Could not generate a price suggestion.";
        if (/not found/i.test(msg) || /no historical data/i.test(msg)) {
          setSuggestionError(`I cannot suggest a price for "${data.name}" because there is no historical data for this item.`);
          setShowSuggestionErrorModal(true);
        } else {
          AxiosToastError({ message: msg });
        }
      }
    } catch (err) {
      const serverMsg = err?.response?.data?.message || err?.message || String(err);
      if (err?.response?.status === 404 || /not found/i.test(serverMsg) || /no historical data/i.test(serverMsg)) {
        setSuggestionError(`I cannot suggest a price for "${data.name}" because there is no historical data for this item.`);
        setShowSuggestionErrorModal(true);
      } else {
        AxiosToastError(err);
      }
    } finally {
      setIsSuggestingPrice(false);
    }
  };

  return (
    <section className='max-w-6xl mx-auto p-6'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-2xl font-semibold text-gray-900'>Add New Product</h1>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left Column - Description & Details */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Description Section */}
          <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <h2 className='font-semibold text-gray-900 mb-4'>Description</h2>
            
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Product Name</label>
                <input
                  type='text'
                  placeholder='Enter product name'
                  name='name'
                  value={data.name}
                  onChange={handleChange}
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Business Description</label>
                <textarea
                  placeholder='Enter product description'
                  name='description'
                  value={data.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
                />
              </div>
            </div>
          </div>

          {/* Category Section */}
          <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <h2 className='font-semibold text-gray-900 mb-4'>Category</h2>
            
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Product Category</label>
                <div className='relative'>
                  <button
                    type="button"
                    onClick={() => setOpenCatDropdown(prev => !prev)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg text-left bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  >
                    {selectCategory ? selectCategory.name : "Select Category"}
                  </button>

                  {openCatDropdown && (
                    <div className='absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto'>
                      {allCategory.map((c) => (
                        <div
                          key={c._id}
                          className='px-3 py-2 hover:bg-gray-100 cursor-pointer'
                          onClick={() => {
                            setData(prev => ({
                              ...prev,
                              category: [c],
                              subCategory: []
                            }));
                            setSelectCategory(c);
                            setSelectSubCategory("");
                            setOpenCatDropdown(false);
                          }}
                        >
                          {c.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Product Sub Category</label>
                <div className='relative'>
                  <button
                    type="button"
                    onClick={() => setOpenSubDropdown(!openSubDropdown)}
                    disabled={!selectCategory}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-left bg-white ${!selectCategory ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}`}
                  >
                    {selectSubCategory ? selectSubCategory.name : selectCategory ? "Select Subcategory" : "Select Category First"}
                  </button>

                  {openSubDropdown && selectCategory && (
                    <div className='absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto'>
                      {filteredSubCategories.length > 0 ? (
                        filteredSubCategories.map((c) => (
                          <div
                            key={c._id}
                            className='px-3 py-2 hover:bg-gray-100 cursor-pointer'
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
                          </div>
                        ))
                      ) : (
                        <div className='px-3 py-2 text-gray-500 text-sm text-center'>
                          No subcategories available
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className='flex flex-wrap gap-2 mt-3'>
                  {data.subCategory.map((c, index) => (
                    <span
                      key={c._id + index}
                      className='inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full'
                    >
                      {c.name}
                      <button
                        onClick={() => handleRemoveSubCategory(index)}
                        className='hover:text-red-600'
                      >
                        <IoClose size={16} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Section */}
          <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <h2 className='font-semibold text-gray-900 mb-4'>Inventory</h2>
            
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Quantity</label>
                <input
                  type='number'
                  placeholder='Enter stock quantity'
                  name='stock'
                  value={data.stock}
                  onChange={handleChange}
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Unit</label>
                <div className='relative'>
                  <button
                    type="button"
                    onClick={() => setOpenUnitDropdown(prev => !prev)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg text-left bg-white hover:border-gray-400'
                  >
                    {data.unit || "Select Unit"}
                  </button>

                  {openUnitDropdown && (
                    <div className='absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto'>
                      {["kilograms", "grams", "dozen", "tray", "bundle", "piece"].map((unit) => (
                        <div
                          key={unit}
                          className='px-3 py-2 hover:bg-gray-100 cursor-pointer'
                          onClick={() => {
                            setData(prev => ({
                              ...prev,
                              unit: unit
                            }));
                            setOpenUnitDropdown(false);
                          }}
                        >
                          {unit}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <h2 className='font-semibold text-gray-900 mb-4'>Pricing</h2>
            
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Price</label>
                <div className='relative'>
                  <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>₱</span>
                  <input
                    type='number'
                    placeholder='0.00'
                    name='price'
                    value={data.price}
                    onChange={handleChange}
                    required
                    className='w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSuggestPrice}
                  disabled={isSuggestingPrice}
                  className='mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium'
                >
                  {isSuggestingPrice ? "Suggesting..." : "Suggest Price"}
                </button>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Discount (%)</label>
                <input
                  type='number'
                  placeholder='0'
                  name='discount'
                  value={data.discount}
                  onChange={handleChange}
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
            </div>
          </div>

          {/* Additional Fields */}
          {Object.keys(data?.more_details).length > 0 && (
            <div className='bg-white rounded-lg border border-gray-200 p-6'>
              <h2 className='font-semibold text-gray-900 mb-4'>Additional Details</h2>
              <div className='space-y-4'>
                {Object.keys(data?.more_details).map((k, index) => (
                  <div key={k + index}>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>{k}</label>
                    <input
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
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Images */}
        <div className='space-y-6'>
          <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='font-semibold text-gray-900'>Product Images</h2>
              <button className='text-gray-400 hover:text-gray-600'>
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
              </button>
            </div>

            <label htmlFor='productImage' className='block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors'>
              <div className='flex flex-col items-center'>
                {imageLoading ? (
                  <Loading />
                ) : (
                  <>
                    <div className='w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-3'>
                      <FaCloudUploadAlt size={24} className='text-gray-600' />
                    </div>
                    <p className='text-sm font-medium text-blue-600 mb-1'>Click to upload</p>
                    <p className='text-xs text-gray-500'>or drag and drop</p>
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

            {/* Image Gallery */}
            <div className='grid grid-cols-2 gap-3 mt-4'>
              {data.image.map((img, index) => (
                <div key={img + index} className='relative group aspect-square bg-gray-100 rounded-lg overflow-hidden'>
                  <img
                    src={img}
                    alt={`Product ${index + 1}`}
                    className='w-full h-full object-cover cursor-pointer'
                    onClick={() => setViewImageURL(img)}
                  />
                  <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2'>
                    <button
                      onClick={() => setViewImageURL(img)}
                      className='px-3 py-1 bg-white text-gray-700 text-xs rounded hover:bg-gray-100'
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteImage(index)}
                      className='px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700'
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='mt-6 flex justify-end gap-3 sticky bottom-0 bg-gray-50 p-4 border-t border-gray-200 -mx-6'>
        <button
          type="button"
          onClick={() => setOpenAddField(true)}
          className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
        >
          Add Custom Field
        </button>
        <button
          type="button"
          className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
        >
          Discard
        </button>
        <button
          onClick={handleSubmit}
          className='px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors'
        >
          Add Product
        </button>
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

      {showSuggestionModal && suggestedPrice != null && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-xl shadow-2xl w-full max-w-md p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-3'>Price Suggestion</h3>
            <p className='text-gray-700 mb-4'>
              The recommended price for <strong>{data.name}</strong> is <strong>₱{suggestedPrice.toFixed(2)}</strong> based on previous sales data.
            </p>
            <p className='text-sm text-gray-600 mb-6'>
              Do you want to apply this suggested price?
            </p>
            <div className='flex justify-end gap-3'>
              <button
                onClick={() => setShowSuggestionModal(false)}
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setData(prev => ({
                    ...prev,
                    price: suggestedPrice.toFixed(2)
                  }));
                  setShowSuggestionModal(false);
                  successAlert("Suggested price applied!");
                }}
                className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700'
              >
                Apply Price
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuggestionErrorModal && suggestionError && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-xl shadow-2xl w-full max-w-md p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-3'>Price Suggestion</h3>
            <p className='text-gray-700 mb-6'>{suggestionError}</p>
            <div className='flex justify-end'>
              <button
                onClick={() => setShowSuggestionErrorModal(false)}
                className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default UploadProduct;