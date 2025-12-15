import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import uploadImage from "../utils/UploadImage";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import toast from "react-hot-toast";
import AxiosToastError from "../utils/AxiosToastError";


const UploadCategoryModel = ({ close, fetchData }) => {
  const [data, setData] = useState({
    name: "",
    image: "",
  });


  const [loading, setLoading] = useState(false);


  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleUploadCategoryImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;


    const response = await uploadImage(file);
    const { data: imageResponse } = response;


    setData((prev) => ({
      ...prev,
      image: imageResponse.data.url,
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.name || !data.image) return;


    try {
      setLoading(true);


      const response = await Axios({
        ...SummaryApi.addCategory,
        data,
      });


      const { data: responseData } = response;


      if (responseData.success) {
        toast.success(responseData.message);
        fetchData();
        close();
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <section className="bg-black fixed inset-0 z-50 bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">


        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add Category</h2>
            <p className="text-sm text-gray-500 mt-1">
              Provide the category name and upload an image.
            </p>
          </div>
          <button
            onClick={close}
            type="button"
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
          >
            <IoClose size={24} />
          </button>
        </div>


        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">


          {/* Category Name */}
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-700">
              Category Name <span className="text-red-500">*</span>
            </label>


            <input
              type="text"
              name="name"
              placeholder="Enter category name"
              value={data.name}
              onChange={handleOnChange}
              className="
                border px-4 py-2.5 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-green-500
                transition-all
                border-gray-300 bg-white hover:border-gray-400
              "
            />
          </div>


          {/* Image Upload */}
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-700">
              Category Image <span className="text-red-500">*</span>
            </label>


            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="border bg-gray-50 h-36 w-full sm:w-36 flex items-center justify-center rounded-lg overflow-hidden">
                {data.image ? (
                  <img src={data.image} alt="category" className="w-full h-full object-contain" />
                ) : (
                  <p className="text-sm text-neutral-500">No Image</p>
                )}
              </div>


              <label>
                <div
                  className={`
                    px-4 py-2 rounded cursor-pointer border
                    font-medium transition-colors
                    ${
                      !data.name
                        ? "bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-white border-green-300 hover:bg-green-100 text-green-700"
                    }
                  `}
                >
                  Upload Image
                </div>


                <input
                  type="file"
                  disabled={!data.name}
                  onChange={handleUploadCategoryImage}
                  className="hidden"
                  accept="image/*"
                />
              </label>
            </div>
          </div>
        </form>


        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-xl">
          <button
            onClick={close}
            type="button"
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </button>


          <button
            disabled={!data.name || !data.image || loading}
            onClick={handleSubmit}
            className="
              px-5 py-2.5 text-sm font-medium text-white rounded-lg
              transition-all flex items-center gap-2
              disabled:bg-gray-400 disabled:cursor-not-allowed
              bg-green-600 hover:bg-green-700
            "
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                  <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0..." />
                </svg>
                Saving…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Add Category
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};


export default UploadCategoryModel;

