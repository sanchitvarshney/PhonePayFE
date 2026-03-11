import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "@mui/icons-material";

const Custom404Page = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf5ff] to-[#f3e8ff] flex items-center justify-center px-4 py-8">
      <div className="max-w-7xl w-full">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* Left Side - Content */}
          <div className="flex-1 w-full lg:w-auto text-center lg:text-left">
            {/* Animated 404 */}
            <div className="mb-6">
              <h1 className="text-[100px] md:text-[120px] lg:text-[150px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#5F259F] to-[#7c3aed] leading-none">
                404
              </h1>
            </div>

            {/* Error Message */}
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
                Page Not Found
              </h2>
              <p className="text-base md:text-lg text-gray-600 max-w-lg mx-auto lg:mx-0">
                Oops! The page you're looking for doesn't exist. It might have
                been moved, deleted, or you entered the wrong URL.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-[#5F259F]/30 text-gray-700 rounded-lg font-semibold hover:bg-[#5F259F]/10 hover:border-[#5F259F] hover:text-[#5F259F] transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <ArrowLeft className="text-lg" />
                Go Back
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#5F259F] text-white rounded-lg font-semibold hover:bg-[#4c1d99] transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <Home className="text-lg" />
                Go to Home
              </button>
            </div>

            {/* Helpful Links */}
            {/* <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">
                You might be looking for:
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <button
                  onClick={() => navigate("/")}
                  className="text-sm text-[#0d9489] hover:text-[#0b8378] hover:underline"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate("/master/client")}
                  className="text-sm text-[#0d9489] hover:text-[#0b8378] hover:underline"
                >
                  Clients
                </button>
                <button
                  onClick={() => navigate("/master/department")}
                  className="text-sm text-[#0d9489] hover:text-[#0b8378] hover:underline"
                >
                  Departments
                </button>
                <button
                  onClick={() => navigate("/request/create")}
                  className="text-sm text-[#0d9489] hover:text-[#0b8378] hover:underline"
                >
                  Create Request
                </button>
              </div>
            </div> */}
          </div>

          {/* Right Side - Image (from public/images) */}
          <div className="flex-1 w-full lg:w-auto flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl">
              <img
                src="/images/404.gif"
                alt="404 Not Found"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Custom404Page;
