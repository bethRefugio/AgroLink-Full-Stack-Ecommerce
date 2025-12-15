import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import uploadImage from "../utils/UploadImage";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import toast from "react-hot-toast";
import AxiosToastError from "../utils/AxiosToastError";


const EditCategory = ({ close, fetchData, data: CategoryData }) => {
  const [data, setData] = useState({
    _id: CategoryData._id,
    name: CategoryData.name,
    image: CategoryData.image,
  });


  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);


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


    try {
      setUploadingImage(true);
      const response = await uploadImage(file);
      const { data: ImageResponse } = response;


      setData((prev) => ({
        ...prev,
        image: ImageResponse.data.url,
      }));
    } finally {
      setUploadingImage(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.name || !data.image) return;


    try {
      setLoading(true);


      const response = await Axios({
        ...SummaryApi.updateCategory,
        data,
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">


        {/* HEADER */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center rounded-t-xl">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Category</h2>
            <p className="text-sm text-gray-500 mt-1">Update the category name or image.</p>
          </div>


          <button
            type="button"
            onClick={close}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
          >
            <IoClose size={24} />
          </button>
        </div>


        {/* FORM CONTENT */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">


          {/* Category Name */}
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-700">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={data.name}
              onChange={handleOnChange}
              placeholder="Enter category name"
              className="
                border px-4 py-2.5 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-green-500
                bg-white border-gray-300 hover:border-gray-400 transition
              "
            />
          </div>


          {/* Image Upload */}
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-700">
              Category Image <span className="text-red-500">*</span>
            </label>


            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="border bg-gray-50 h-36 w-full sm:w-36 flex items-center justify-center rounded-lg overflow-hidden">
                {data.image ? (
                  <img src={data.image} alt="category" className="w-full h-full object-contain" />
                ) : (
                  <p className="text-sm text-gray-500">No Image</p>
                )}
              </div>


              <label className="cursor-pointer">
                <div
                  className={`
                    px-4 py-2 border rounded font-medium
                    ${
                      !data.name
                        ? "bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed"
                        : "text-green-700 border-green-300 hover:bg-green-100"
                    }
                    transition
                  `}
                >
                  {uploadingImage ? "Uploading..." : "Upload Image"}
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


        {/* FOOTER */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-xl">
          <button
            type="button"
            onClick={close}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </button>


          <button
            type="button"
            onClick={handleSubmit}
            disabled={!data.name || !data.image || loading}
            className="
              px-5 py-2.5 text-sm font-medium text-white rounded-lg flex items-center gap-2
              bg-green-600 hover:bg-green-700 transition
              disabled:bg-gray-400 disabled:cursor-not-allowed
            "
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                </svg>
                Saving…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Update Category
              </>
            )}
          </button>
        </div>


      </div>
    </section>
  );
};


export default EditCategory;

