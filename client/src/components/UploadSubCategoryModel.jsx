import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import uploadImage from "../utils/UploadImage";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import toast from "react-hot-toast";
import AxiosToastError from "../utils/AxiosToastError";
import { useSelector } from "react-redux";


const UploadSubCategoryModel = ({ close, fetchData }) => {
  const allCategory = useSelector((state) => state.product.allCategory);


  const [subCategoryData, setSubCategoryData] = useState({
    name: "",
    description: "",
    image: "",
    category: [],
  });


  const [loading, setLoading] = useState(false);


  const handleChange = (e) => {
    const { name, value } = e.target;


    setSubCategoryData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleUploadSubCategoryImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;


    const response = await uploadImage(file);
    const { data } = response;


    setSubCategoryData((prev) => ({
      ...prev,
      image: data.data.url,
    }));
  };


  const handleRemoveCategory = (id) => {
    setSubCategoryData((prev) => ({
      ...prev,
      category: prev.category.filter((c) => c._id !== id),
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();


    if (!subCategoryData.name || !subCategoryData.image || subCategoryData.category.length === 0) return;


    try {
      setLoading(true);


      const response = await Axios({
        ...SummaryApi.createSubCategory,
        data: subCategoryData,
      });


      const { data } = response;
      if (data.success) {
        toast.success(data.message);
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


        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center rounded-t-xl">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add Subcategory</h2>
            <p className="text-sm text-gray-500 mt-1">
              Provide subcategory details below
            </p>
          </div>


          <button
            onClick={close}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition"
          >
            <IoClose size={24} />
          </button>
        </div>


        {/* FORM CONTENT */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">


          {/* Name */}
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-700">
              Subcategory Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={subCategoryData.name}
              onChange={handleChange}
              className="border px-4 py-2.5 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-green-500
                         border-gray-300 bg-white hover:border-gray-400"
              placeholder="Enter subcategory name"
            />
          </div>


          {/* Description */}
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={subCategoryData.description}
              onChange={handleChange}
              className="border px-4 py-2.5 rounded-lg text-sm resize-none
                         focus:outline-none focus:ring-2 focus:ring-green-500
                         border-gray-300 bg-white hover:border-gray-400"
              rows="3"
              placeholder="Enter subcategory description"
            />
          </div>


          {/* Image Upload */}
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-700">
              Subcategory Image <span className="text-red-500">*</span>
            </label>


            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="border bg-gray-50 h-36 w-full sm:w-36 flex items-center justify-center rounded-lg overflow-hidden">
                {subCategoryData.image ? (
                  <img src={subCategoryData.image} className="w-full h-full object-contain" />
                ) : (
                  <p className="text-sm text-gray-500">No image</p>
                )}
              </div>


              <label>
                <div className="
                    px-4 py-2 rounded border cursor-pointer text-green-700
                    border-green-300 hover:bg-green-100 transition font-medium
                ">
                  Upload Image
                </div>
                <input type="file" className="hidden" onChange={handleUploadSubCategoryImage} />
              </label>
            </div>
          </div>


          {/* Select Categories */}
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-700">Select Categories</label>


            {/* Selected chips */}
            <div className="flex flex-wrap gap-2">
              {subCategoryData.category.map((cat) => (
                <div
                  key={cat._id}
                  className="flex items-center bg-green-50 px-2 py-1 rounded-lg shadow-sm text-sm gap-1"
                >
                  {cat.name}
                  <button
                    onClick={() => handleRemoveCategory(cat._id)}
                    type="button"
                    className="text-gray-500 hover:text-red-600"
                  >
                    <IoClose size={18} />
                  </button>
                </div>
              ))}
            </div>


            {/* Category dropdown */}
            <select
              className="border px-3 py-2 rounded-lg text-sm bg-white
                         focus:outline-none focus:ring-2 focus:ring-green-500
                         border-gray-300 hover:border-gray-400"
              onChange={(e) => {
                const id = e.target.value;
                if (!id) return;


                const selected = allCategory.find((c) => c._id === id);
                if (!selected) return;


                // Prevent duplicate selection
                if (subCategoryData.category.some((c) => c._id === id)) return;


                setSubCategoryData((prev) => ({
                  ...prev,
                  category: [...prev.category, selected],
                }));
              }}
            >
              <option value="">Select category</option>
              {allCategory.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </form>


        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-xl">
          <button
            onClick={close}
            type="button"
            className="px-5 py-2.5 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>


          <button
            disabled={
              loading ||
              !subCategoryData.name ||
              !subCategoryData.image ||
              subCategoryData.category.length === 0
            }
            onClick={handleSubmit}
            className="
              px-5 py-2.5 text-sm font-medium text-white rounded-lg flex items-center gap-2
              bg-green-600 hover:bg-green-700 transition-all
              disabled:bg-gray-400 disabled:cursor-not-allowed
            "
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="4" stroke="white" fill="none" />
                </svg>
                Saving…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Save Subcategory
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};


export default UploadSubCategoryModel;

