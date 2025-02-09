import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import salonBanner from "../../../public/images/salon_banner.png";
import PopularServices from "../../Components/PopularServices";
import SalonCard from "../../Components/SalonCard";

const HomePage = () => {
  return (
    <div>
      <Navbar />

      {/* Banner Section */}
      <div className="relative h-[800px] w-full bg-gradient-to-r from-black via-gray-900 to-gray-400">
        {/* Background Gradient */}

        {/* Salon Banner Image */}
        <div className="absolute top-0 right-0 h-full w-[400px] md:w-[1200px] lg:w-[1400px]">
          {" "}
          {/* Increased width on larger screens */}
          <img
            src={salonBanner}
            alt="Salon Banner"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Form Section */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-4 z-10 w-full md:w-[50%]">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center font-manrope">
            Find the Best
            <br />
            Salon Services Near You
          </h1>
          <form className="flex flex-col md:flex-row gap-4 w-full max-w-md">
            <input
              type="text"
              placeholder="Service"
              className="p-2 rounded-md w-full"
            />
            <input
              type="text"
              placeholder="Enter Your Location"
              className="p-2 rounded-md w-full"
            />
            <button
              type="submit"
              className="bg-green-700 text-black py-2 px-4 rounded-md hover:bg-green-900 w-full md:w-auto"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <PopularServices />

      {/* Image Gallery Section */}
      <div className="py-10">
        <h2 className="text-3xl font-bold text-center mb-6 font-poppins">
          We are Experienced in making you very Beautiful
        </h2>
        <div className="flex flex-wrap gap-4 px-4">
          {/* Left Large Image with Curved Left Side */}
          <div className="relative w-full sm:w-[48%] md:w-[48%] lg:w-[30%] overflow-hidden rounded-l-full shadow-lg bg-black">
            <img
              src="/images/gallery1.jpeg"
              alt="Gallery 1"
              className="w-full object-cover h-[200px] sm:h-[250px] md:h-[350px] lg:h-[400px]" // Adjusted height for larger screens
            />
          </div>

          {/* Grid for the smaller images */}
          <div className="w-full sm:w-[48%] md:w-[48%] lg:w-[66%] grid grid-cols-2 gap-4">
            {[2, 3, 4, 5].map((img) => (
              <div
                key={img}
                className="relative overflow-hidden rounded-lg shadow-md"
              >
                <img
                  src={`/images/gallery${img}.jpeg`}
                  alt={`Gallery ${img}`}
                  className="w-full object-cover rounded-lg h-[150px] md:h-[200px] lg:h-[250px]" // Adjusted height for larger screens
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Services Section */}
      <div className="py-10 bg-white">
        <h2 className="text-3xl font-bold text-center mb-6 font-poppins">
          Recommended Salons
        </h2>
        <div className="flex flex-wrap justify-center gap-10">
          <SalonCard
            name="Salon A"
            image="../../images/salon1.jpeg"
            rating={4.5}
            comment="Excellent services and customer satisfaction."
          />

          <SalonCard
            name="Salon B"
            image="../../images/salon2.jpeg"
            rating={4.2}
            comment="Great atmosphere and professional staff."
          />
          <SalonCard
            name="Salon C"
            image="../../images/salon3.jpeg"
            rating={4.8}
            comment="I loved the haircut and spa experience!"
          />
          <SalonCard
            name="Salon D"
            image="../../images/salon4.jpeg"
            rating={4.3}
            comment="Affordable and great value for money."
          />
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-white py-10 text-black text-center  mx-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          {/* Left Image */}
          <div className="hidden md:block w-1/4">
            <img
              src="../../images/salon4.jpeg" // Add an appropriate image for the left side
              alt="Newsletter Image Left"
              className="w-full rounded-full object-cover shadow-lg"
            />
          </div>

          {/* Newsletter Content */}
          <div className="w-full md:w-1/3 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-lg mb-6">
              Sign up for our newsletter to stay up-to-date on the latest
              promotions, discounts, and new feature releases.
            </p>
            <form className="flex flex-col md:flex-row gap-4 justify-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="p-3 rounded-md text-black w-full md:w-64 border-2 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all duration-500"
              />

              <button
                type="submit"
                className="bg-black text-white py-2 px-4 rounded-md hover:bg-blue-700 w-full md:w-auto "
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;
