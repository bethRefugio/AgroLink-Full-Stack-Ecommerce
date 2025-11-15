import toast from "react-hot-toast";

const AxiosToastError = (error) => {
  // prefer server-provided message
  const serverMsg = error?.response?.data?.message;
  // fallback to other possible shapes
  const detail =
    serverMsg ||
    (error?.response && typeof error.response.data === "string"
      ? error.response.data
      : error?.response
      ? JSON.stringify(error.response.data).slice(0, 300)
      : null) ||
    error?.message ||
    (typeof error === "string" ? error : null) ||
    "An unexpected error occurred";

  // Dismiss any existing error toast to prevent duplicates
  toast.dismiss("global-error");
  toast.error(detail, {
    id: "global-error",
    duration: 6000,
    position: "top-right",
    style: { whiteSpace: "pre-wrap" },
  });

  // helpful console output for debugging
  console.error("AxiosToastError:", {
    message: detail,
    original: error,
  });
};

export default AxiosToastError;