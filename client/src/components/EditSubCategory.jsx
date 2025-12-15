import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import uploadImage from "../utils/UploadImage";
import { useSelector } from "react-redux";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import toast from "react-hot-toast";
import AxiosToastError from "../utils/AxiosToastError";


const EditSubCategory = ({ close, data, fetchData }) => {
  const [subCategoryData, setSubCategoryData] = useState({
    _id: data._id,
    name: data.name,
    description: data.description || "",
    image: data.image,
    category: data.category || [],
  });


  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);


  const allCategory = useSelector((state) => state.product.allCategory);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubCategoryData((prev) => ({ ...prev, [name]: value }));
  };


  const handleUploadSubCategoryImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;


    try {
      setUploadingImage(true);
      const response = await uploadImage(file);
      const { data: ImageResponse } = response;


      setSubCategoryData((prev) => ({
        ...prev,
        image: ImageResponse.data.url,
      }));
    } finally {
      setUploadingImage(false);
    }
  };


  const handleRemoveCategorySelected = (categoryId) => {
    setSubCategoryData((prev) => ({
      ...prev,
      category: prev.category.filter((el) => el._id !== categoryId),
    }));
  };


  const handleSubmitSubCategory = async (e) => {
    e.preventDefault();


    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.updateSubCategory,
        data: subCategoryData,
      });


      const { data: responseData } = response;


      if (responseData.success) {
        toast.success(responseData.message);
        close();
        fetchData();
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <section className="bg-black fixed inset-0 z-50 bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto">


        {/* HEADER */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center rounded-t-xl">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Sub Category</h2>
            <p className="text-sm text-gray-500 mt-1">Update the details below.</p>
          </div>


          <button
            onClick={close}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition"
          >
            <IoClose size={24} />
          </button>
        </div>


        {/* FORM */}
        <form onSubmit={handleSubmitSubCategory} className="px-6 py-6 space-y-6">


          {/* Name */}
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              value={subCategoryData.name}
              onChange={handleChange}
              className="border px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2
                         focus:ring-green-500 border-gray-300 hover:border-gray-400 transition text-sm"
              placeholder="Enter subcategory name"
            />
          </div>


          {/* Description */}
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              name="description"
              value={subCategoryData.description}
              onChange={handleChange}
              rows="3"
              className="border px-4 py-2.5 rounded-lg resize-none text-sm focus:ring-2
                         focus:ring-green-500 border-gray-300 hover:border-gray-400 transition"
              placeholder="Enter description"
            />
          </div>


          {/* Image Upload */}
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-700">
              Upload Image <span className="text-red-500">*</span>
            </label>


            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="border bg-gray-50 h-36 w-full sm:w-36 flex items-center justify-center rounded-lg overflow-hidden">
                {subCategoryData.image ? (
                  <img
                    alt="subcategory"
                    src={subCategoryData.image}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <p className="text-sm text-gray-500">No Image</p>
                )}
              </div>


              <label>
                <div
                  className={`px-4 py-2 rounded border cursor-pointer transition font-medium
                    ${
                      uploadingImage
                        ? "bg-gray-200 border-gray-300 text-gray-500"
                        : "text-green-700 border-green-300 hover:bg-green-100"
                    }
                  `}
                >
                  {uploadingImage ? "Uploading..." : "Upload Image"}
                </div>
                <input
                  type="file"
                  id="uploadSubCategoryImage"
                  className="hidden"
                  onChange={handleUploadSubCategoryImage}
                  accept="image/*"
                />
              </label>
            </div>
          </div>


          {/* Category Select */}
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-700">Category</label>


            {/* Selected Category Pills */}
            <div className="flex flex-wrap gap-2">
              {subCategoryData.category.map((cat) => (
                <span
                  key={cat._id}
                  className="px-2 py-1 bg-gray-100 rounded-lg text-sm flex items-center gap-2 shadow"
                >
                  {cat.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveCategorySelected(cat._id)}
                    className="hover:text-red-600"
                  >
                    <IoClose size={18} />
                  </button>
                </span>
              ))}
            </div>


            {/* Dropdown */}
            <select
              className="border px-3 py-2 rounded-lg w-full text-sm
                         focus:ring-2 focus:ring-green-500 border-gray-300"
              onChange={(e) => {
                const value = e.target.value;
                const selectedCat = allCategory.find((el) => el._id === value);


                if (!selectedCat) return;


                setSubCategoryData((prev) => ({
                  ...prev,
                  category: [...prev.category, selectedCat],
                }));
              }}
            >
              <option value="">Select Category</option>
              {allCategory.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </form>


        {/* FOOTER */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-xl">
          <button
            onClick={close}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </button>


          <button
            onClick={handleSubmitSubCategory}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                </svg>
                Updating…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};


export default EditSubCategory;

