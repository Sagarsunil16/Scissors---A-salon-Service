import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import { useEffect, useState } from "react";
import SalonCard from "../../Components/SalonCard";
import { useSearchParams } from "react-router-dom";
import { ISalon } from "../../interfaces/interface";
import axios from "axios";
import { getSalons } from "../../Services/UserAPI";

const Salons = () => {
  const [salonsData, setSalonsData] = useState<ISalon[]>([]);
  const [search, setSearch] = useState("");
  const [pincode, setPincode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<string>("rating_desc");
  const [filters, setFilters] = useState<{
    maxPrice: number;
    ratings: number[];
    discount: number;
  }>({
    maxPrice: 100000,
    ratings: [],
    discount: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSalons, setTotalSalons] = useState(0);
  const itemsPerPage = 6;
  const [searchParams, setSearchParams] = useSearchParams();
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const services = [
    { name: "Hair Cut" },
    { name: "Hair Styling" },
    { name: "Nail Art" },
    { name: "Beard Cut" },
    { name: "Massage" },
    { name: "Pedicure" },
    { name: "Lip Tinting" },
  ];

  // Fetch salons from backend
  const getNearbySalons = async () => {
    try {
      const params: {
        longitude?: number;
        latitude?: number;
        radius?: number;
        search: string;
        maxPrice: number;
        ratings: string;
        discount: number;
        page: number;
        limit: number;
        sort?: string;
      } = {
        search,
        maxPrice: filters.maxPrice,
        ratings: filters.ratings.join(","),
        discount: filters.discount,
        page: currentPage,
        limit: itemsPerPage,
        sort: sortOption,
      };
      // Only include location params if coordinates are available
      if (coordinates) {
        params.longitude = coordinates.longitude;
        params.latitude = coordinates.latitude;
        params.radius = 5000;
      }
      const response = await getSalons(params);
      setSalonsData(response.data.salons);
      setTotalPages(response.data.paginations.totalPages);
      setTotalSalons(response.data.paginations.totalSalons);
      setError(null);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch salons. Please try again."
      );
      console.error("Salons fetch error:", err);
    }
  };

  // Get user location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ latitude, longitude });
        },
        (err) => {
          setError("Location access denied. Showing all salons.");
          setCoordinates(null); // Allow fetching all salons
          console.error("Geolocation error:", err);
        },
        { timeout: 10000 }
      );
    } else {
      setError("Geolocation is not supported. Showing all salons.");
      setCoordinates(null); // Allow fetching all salons
    }
  };

  // Convert pincode to coordinates
  const handlePincodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode.match(/^\d{6}$/)) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }
    try {
      const response = await axios.get(
        "https://maps.googleapis.com/maps/api/geocode/json",
        {
          params: {
            address: `${pincode}, India`,
            key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
          },
        }
      );
      if (response.data.status === "OK" && response.data.results[0]) {
        const { lat, lng } = response.data.results[0].geometry.location;
        setCoordinates({ latitude: lat, longitude: lng });
      } else {
        setError("Invalid pincode. Showing all salons.");
        setCoordinates(null); // Fallback to all salons
      }
    } catch (err: any) {
      setError("Failed to geocode pincode. Showing all salons.");
      console.error("Pincode geocoding error:", err);
      setCoordinates(null); // Fallback to all salons
    }
  };

  // Fetch salons on mount or when filters change
  useEffect(() => {
    getNearbySalons(); // Always fetch salons, with or without coordinates
  }, [coordinates, search, filters, currentPage,sortOption]);

  // Try to get user location on mount
  useEffect(() => {
    getUserLocation();
  }, []);

  // Sync URL search params
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (pincode) params.set("pincode", pincode);
    if (filters.maxPrice !== 100000)
      params.set("maxPrice", String(filters.maxPrice));
    if (filters.ratings.length > 0)
      params.set("ratings", filters.ratings.join(","));
    if (filters.discount > 0) params.set("discount", String(filters.discount));
    params.set("page", String(currentPage));
    setSearchParams(params);
  }, [search, pincode, filters, currentPage, setSearchParams]);

  // Load URL search params on mount
  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    if (params.search) setSearch(params.search);
    if (params.pincode) setPincode(params.pincode);
    if (params.maxPrice)
      setFilters((prev) => ({ ...prev, maxPrice: Number(params.maxPrice) }));
    if (params.ratings)
      setFilters((prev) => ({
        ...prev,
        ratings: params.ratings.split(",").map(Number),
      }));
    if (params.discount)
      setFilters((prev) => ({ ...prev, discount: Number(params.discount) }));
    if (params.page) setCurrentPage(Number(params.page));
  }, [searchParams]);

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maxPrice = Number(e.target.value);
    setFilters((prev) => ({ ...prev, maxPrice }));
  };

  const handleRatingChange = (star: number) => {
    setFilters((prev) => {
      const updatedRatings = prev.ratings.includes(star)
        ? prev.ratings.filter((rating) => rating !== star)
        : [...prev.ratings, star];
      return { ...prev, ratings: updatedRatings };
    });
  };

  const handleDiscountChange = (discount: number) => {
    setFilters((prev) => ({
      ...prev,
      discount: prev.discount === discount ? 0 : discount,
    }));
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="bg-gray-50">
      <Navbar />
      <div className="flex flex-col min-h-screen pt-28 px-4 mb-10">
        {/* Search Box */}
        <div className="flex justify-center">
          <div className="w-full max-w-lg px-4">
            <input
              type="text"
              className="border border-gray-500 rounded-lg w-full py-2 px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search for salons or services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Pincode Input and Service Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center mt-5 gap-6 px-4">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <span className="text-gray-700 font-medium">Location:</span>
            <form
              onSubmit={handlePincodeSubmit}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="border border-gray-500 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter 6-digit pincode (e.g., 691502)"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Search
              </button>
            </form>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {services.map((service, index) => (
              <button
                key={index}
                onClick={() => setSearch(service.name)}
                className="flex items-center gap-2 bg-gray-100 text-black px-4 py-2 rounded-lg shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span>{service.name}</span>
              </button>
            ))}
          </div>
        </div>
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}

        {/* Filters Section */}
        <div className="flex flex-col md:flex-row mt-5">
          <div className="w-full md:w-[20%] p-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Filters
            </h2>
            <div className="mb-4 bg-white shadow-lg p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Price Range
              </h3>
              <div className="flex flex-col gap-4">
                <input
                  type="range"
                  min="100"
                  max="100000"
                  step="100"
                  value={filters.maxPrice}
                  onChange={handleMaxPriceChange}
                  className="w-full appearance-none rounded-lg bg-black"
                />
                <div className="flex justify-between text-gray-700">
                  <span>₹100</span>
                  <span>₹{filters.maxPrice}</span>
                </div>
              </div>
            </div>
            <div className="mb-4 bg-white shadow-lg p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-600 mb-2">Rating</h3>
              <div className="flex flex-col gap-2">
                {[5, 4, 3].map((star) => (
                  <label key={star} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.ratings.includes(star)}
                      onChange={() => handleRatingChange(star)}
                      className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-400"
                    />
                    <span className="text-gray-700">{`${star} Star${
                      star > 1 ? "s" : ""
                    }`}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mb-4 bg-white shadow-lg p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Special Offers
              </h3>
              <div className="flex flex-col gap-2">
                {[20, 50].map((discount) => (
                  <button
                    key={discount}
                    onClick={() => handleDiscountChange(discount)}
                    className={`py-2 px-3 border rounded-lg ${
                      filters.discount === discount
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    {discount}% Off Deals
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full md:w-3/4 ml-0 md:ml-4">
            <div className="flex justify-end mb-4">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm"
              >
                <option value="rating_desc">Top Rated</option>
                <option value="name_asc">Name: A-Z</option>
                <option value="name_desc">Name: Z-A</option>
              </select>
            </div>

            {/* Main Content */}
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Salon Listings ({totalSalons} found)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {salonsData.length > 0 ? (
                salonsData.map((salon, index) => (
                  <SalonCard
                    key={index}
                    name={salon.salonName}
                    image={
                      salon.images && salon.images.length > 0
                        ? salon.images[0].url
                        : "https://content.jdmagicbox.com/comp/ernakulam/g1/0484px484.x484.220123012003.f7g1/catalogue/chop-shop-barber-and-brand-panampilly-nagar-ernakulam-salons-1lafuvkusk.jpg"
                    }
                    rating={salon.rating.toFixed(0)}
                    comment={`${salon.address.areaStreet}, ${salon.address.city}`}
                    id={salon._id}
                  />
                ))
              ) : (
                <p className="text-gray-500 col-span-full">
                  No salons found. Try a different pincode or adjust filters.
                </p>
              )}
            </div>
            <div className="flex justify-center items-center mt-6">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="px-4 py-2 text-black rounded-lg bg-gray-100 m-2"
              >
                Back
              </button>
              <span className="text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-black rounded-lg bg-gray-100 m-2"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Salons;
