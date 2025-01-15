import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const AdminLogin = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Validate input
    if (!email || !password) {
      setError("Please fill in both fields");
      return;
    }

    // Simulate successful login
    if (email === "admin@example.com" && password === "admin123") {
      setError(null);
      navigate("/admin-dashboard");
    } else {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex flex-col justify-center items-center min-h-screen bg-white px-4 sm:px-8 pt-16">
        <h2 className="text-3xl sm:text-4xl text-center font-poppins mb-6  sm:mb-8">
          Hello Admin, Log in Please!
        </h2>
        <div className="bg-white p-6 rounded-lg flex flex-col sm:flex-row w-full sm:w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] justify-center items-center">
          {/* Left Section */}
          <div className="w-full sm:w-1/2 px-4 sm:px-8 mb-6 sm:mb-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 mt-4 bg-black text-white rounded-lg hover:bg-blue-500 transition duration-500"
              >
                Log in
              </button>
              <div className="cursor-pointer flex justify-center hover:text-blue-500 duration-300 ">
                Forgot Password?
              </div>
            </form>
          </div>

          {/* OR Divider */}
          <div className="hidden sm:flex flex-col items-center mx-6">
            <div className="h-full w-[1px] bg-gray-900"></div>
            <p className="text-gray-500 font-medium my-2">OR</p>
            <div className="h-full w-[1px] bg-gray-900"></div>
          </div>

          {/* Right Section */}
          <div className="w-full sm:w-1/2 px-4 sm:px-8 flex flex-col items-center">
            <button
              type="button"
              className="flex justify-center items-center px-4 py-3 w-full border rounded-lg hover:bg-gray-200 transition duration-300"
            >
              <img
                src="https://img.icons8.com/color/48/000000/google-logo.png"
                alt="Google"
                className="w-6 h-6 mr-2"
              />
              Continue with Google
            </button>
            <p className="mt-6 text-gray-500">
              No account?{" "}
              <span className="text-blue-500 cursor-pointer">Sign up</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
