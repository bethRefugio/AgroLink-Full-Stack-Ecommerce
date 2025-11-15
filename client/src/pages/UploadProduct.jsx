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

  // NEW: State for filtered subcategories
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);

  const [isSuggestingPrice, setIsSuggestingPrice] = useState(false);
  const [suggestedPrice, setSuggestedPrice] = useState(null);
  const [bestModel, setBestModel] = useState("");
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [suggestionError, setSuggestionError] = useState("");
  const [showSuggestionErrorModal, setShowSuggestionErrorModal] = useState(false);

  // NEW: Fetch filtered subcategories when category is selected
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

    // Reset selected category if it's being removed
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
                          category: [c],
                          subCategory: [] // Reset subcategories when category changes
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

          {/* Sub Category Selection with Filtered Results */}
          <div className='grid gap-1 relative'>
            <label className='font-medium'>Sub Category</label>
            <div className='relative'>
              <button
                type="button"
                onClick={() => setOpenSubDropdown(!openSubDropdown)}
                disabled={!selectCategory}
                className={`bg-blue-50 border w-full p-2 rounded text-left ${!selectCategory ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {selectSubCategory ? selectSubCategory.name : selectCategory ? "Select Subcategory" : "Select Category First"}
              </button>

              {openSubDropdown && selectCategory && (
                <div className='absolute left-0 mt-1 w-full bg-white border rounded shadow-lg z-50 max-h-48 overflow-y-auto'>
                  {filteredSubCategories.length > 0 ? (
                    filteredSubCategories.map((c) => (
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

                        {/* Hover Tooltip */}
                        {hoveredSubCategory === c.name && (
                          <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded w-64 z-50 shadow-lg">
                            <div className="font-semibold mb-1 text-white border-b border-gray-600 pb-1">{c.name}</div>
                            <div className="text-gray-200 leading-relaxed">
                              {c.description || "No description available"}
                            </div>
                            <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className='px-3 py-2 text-gray-500 text-center'>
                      No subcategories available for this category
                    </div>
                  )}
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

                  {/* Show description on hover for selected subcategories */}
                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs px-3 py-2 rounded w-64 z-50 shadow-lg">
                    <div className="font-semibold mb-1 text-white border-b border-gray-600 pb-1">{c.name}</div>
                    <div className="text-gray-200 leading-relaxed">
                      {c.description || "No description available"}
                    </div>
                    <div className="absolute top-full left-4 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Unit Field */}
          <div className='grid gap-1 relative'>
            <label className='font-medium'>Unit</label>
            <div className='relative'>
              <button
                type="button"
                onClick={() => setOpenUnitDropdown(prev => !prev)}
                className='bg-blue-50 border w-full p-2 rounded text-left'
              >
                {data.unit || "Select Unit"}
              </button>

              {openUnitDropdown && (
                <div className='absolute left-0 mt-1 w-full bg-white border rounded shadow-lg z-50 max-h-48 overflow-y-auto'>
                  {["kilograms", "grams", "dozen", "tray", "bundle", "piece"].map((unit) => (
                    <div
                      key={unit}
                      className='px-3 py-2 hover:bg-blue-100 cursor-pointer'
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

          {/* Price Field with Suggest button */}
          <div className='grid gap-1'>
            <label htmlFor='price' className='font-medium'>Price</label>
            <div className='flex gap-2 items-center'>
              <input
                id='price'
                type='number'
                placeholder='Enter product price'
                name='price'
                value={data.price}
                onChange={handleChange}
                required
                className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded flex-grow'
              />
              <button
                type="button"
                onClick={handleSuggestPrice}
                disabled={isSuggestingPrice}
                className={`bg-green-500 text-white p-2 rounded text-sm font-medium transition-colors w-36 flex justify-center items-center ${isSuggestingPrice ? 'opacity-60 cursor-not-allowed' : 'hover:bg-green-600'}`}
              >
                {isSuggestingPrice ? <Loading /> : "Suggest Price"}
              </button>
            </div>
          </div>

          {/* Discount Field */}
          <div className='grid gap-1'>
            <label htmlFor='discount' className='font-medium'>Discount</label>
            <input
              id='discount'
              type='number'
              placeholder='0'
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

      {/* Price Suggestion Modal */}
      {showSuggestionModal && suggestedPrice != null && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]'>
          <div className='bg-white p-6 rounded-lg shadow-2xl w-96'>
            <h3 className='text-lg font-bold mb-3'>Price Suggestion</h3>
            <p className='mb-4'>
              The recommended price for <strong>{data.name}</strong> is <strong>₱{suggestedPrice.toFixed(2)}</strong> (based on previous sales data + 5% markup).
            </p>
            <p className='text-sm text-gray-600 mb-4'>
              Do you want to apply this suggested price?
            </p>
            <div className='flex justify-end gap-3'>
              <button
                type="button"
                onClick={() => setShowSuggestionModal(false)}
                className='px-4 py-2 bg-gray-200 rounded hover:bg-gray-300'
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setData(prev => ({
                    ...prev,
                    price: suggestedPrice.toFixed(2)
                  }));
                  setShowSuggestionModal(false);
                  successAlert("Suggested price applied!");
                }}
                className='px-4 py-2 bg-primary-100 text-white rounded hover:bg-primary-200 font-semibold'
              >
                Yes, Apply Price
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suggestion Error Modal */}
      {showSuggestionErrorModal && suggestionError && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]'>
          <div className='bg-white p-6 rounded-lg shadow-2xl w-96'>
            <h3 className='text-lg font-bold mb-3'>Price Suggestion</h3>
            <p className='mb-4 text-gray-700'>
              {suggestionError}
            </p>
            <div className='flex justify-end'>
              <button
                type="button"
                onClick={() => setShowSuggestionErrorModal(false)}
                className='px-4 py-2 bg-primary-100 text-white rounded hover:bg-primary-200 font-semibold'
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