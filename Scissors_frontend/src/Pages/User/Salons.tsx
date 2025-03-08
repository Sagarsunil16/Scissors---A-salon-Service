import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import { useEffect, useState } from "react";
import SalonCard from "../../Components/SalonCard";
import { getAllSalons } from "../../Services/UserAPI";
import { useSearchParams } from "react-router-dom";
import { ISalon } from "../../interfaces/interface";

const Salons = () => {
  const [salonsData, setSalonsData] = useState<ISalon[]>([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [filters, setFilters] = useState<{ maxPrice: string;
    ratings: number[]; 
    offers: string;}>({
    maxPrice: "100000",
    ratings: [],
    offers: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [searchParams, setSearchParams] = useSearchParams();

  const services = [
    { name: "Hair Cut" },
    { name: "Hair Styling" },
    { name: "Nail Art" },
    { name: "Beard Cut" },
    { name: "Massage" },
    { name: "Pedicure" },
    { name: "Lip Tinting" },
  ];

  // Update URL with current state
  useEffect(() => {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (location) params.set("location", location);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.ratings.length > 0) params.set("ratings", filters.ratings.join(","));
    if (filters.offers) params.set("offers", filters.offers);
    params.set("page", String(currentPage));

    // Update the URL without reloading the page
    setSearchParams(params);
  }, [search, location, filters, currentPage, setSearchParams]);

  // Fetch salon data
  useEffect(() => {
    const fetchSalonData = async () => {
      try {
        const queryParams = new URLSearchParams({
          search,
          location,
          maxPrice: filters.maxPrice.toString(),
          rating: filters.ratings.join(","),
          offers: filters.offers,
          page: currentPage.toString(),
        });

        // Replace this with your actual API call
        const response = await getAllSalons(queryParams);
        console.log(response,"getaLLSalons")
        setSalonsData(response.data.data.salons); // Assuming response.data contains the salon data
      } catch (error:any) {
        console.error(error.message);
      }
    };
    const delayDebounceFn = setTimeout(() => {
      fetchSalonData();
    }, 500); // Delay API call to optimize performance
  
    return () => clearTimeout(delayDebounceFn);
  }, [filters, search, location, currentPage]);

  // Read state from URL on component mount
  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());

    if (params.search) setSearch(params.search);
    if (params.location) setLocation(params.location);
    if (params.maxPrice) setFilters((prev:any) => ({ ...prev, maxPrice: Number(params.maxPrice) }));
    if (params.ratings)
      setFilters((prev:any) => ({
        ...prev,
        ratings: params.ratings.split(",").map(Number),
      }));
    if (params.offers) setFilters((prev) => ({ ...prev, offers: params.offers }));
    if (params.page) setCurrentPage(Number(params.page));
  }, [searchParams]);

  const handleMaxPriceChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    const maxPrice = Number(e.target.value);
    setFilters((prev:any) => ({
      ...prev,
      maxPrice,
    }));
  };

  const handleRatingChange = (star:number) => {
    setFilters((prev:any) => {
      const updatedRatings = prev.ratings.includes(star)
        ? prev.ratings.filter((rating:any) => rating !== star) // Remove if already selected
        : [...prev.ratings, star]; // Add if not already selected
      return {
        ...prev,
        ratings: updatedRatings,
      };
    });
  };

  // Filter salons based on criteria
  const filteredSalons = salonsData.filter((salon:any)=>{
    const matchesSearch =  salon.salonName.toLowerCase().includes(search.toLowerCase()) || salon.services.some((service:any)=>service.name.toLowerCase().includes(search.toLowerCase()));
    const matchesLocation =  salon.address.city.toLowerCase().includes(location.toLowerCase()) || salon.address.areaStreet.toLowerCase().includes(location.toLowerCase());

    const matchesPrice = salon.services.some((service:any)=>service.price<=filters.maxPrice);
    const matchesRating = filters.ratings.length===0 || filters.ratings.includes(Math.floor(salon.rating || 0));

    return matchesSearch && matchesLocation && matchesPrice && matchesRating
  })

  // Calculate pagination values
  const totalPages = Math.ceil(filteredSalons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSalons = filteredSalons.slice(startIndex, startIndex + itemsPerPage);

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
    <div className="  bg-gray-50">
      <Navbar />
      <div className="flex flex-col min-h-screen pt-28 px-4 mb-10">
        {/* Search Box */}
        <div className="flex justify-center">
          <div className="w-full max-w-lg px-4">
            <input
              type="text"
              className="border border-gray-500 rounded-lg w-full py-2 px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search for salons or services..."
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Location Input and Service Buttons */}
        <div className="flex justify-center items-center mt-5 gap-6 px-4">
          {/* Location Input */}
          <div className="flex items-center gap-2">
            <span className="text-gray-700 font-medium">Location:</span>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border border-gray-500 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter location"
            />
          </div>

          {/* Service Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            {services.map((service, index) => (
              <button
                key={index}
                className="flex items-center gap-2 bg-gray-100 text-black px-4 py-2 rounded-lg shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="text-lg"></span>
                <span>{service.name}</span>
              </button>
            ))}
          </div>
          </div>
        {/* Filters Section */}
        <div className="flex flex-col md:flex-row mt-5">
          <div className="w-full md:w-[20%] p-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Filters</h2>

            {/* Price Range Filter */}
            <div className="mb-4 bg-white shadow-lg p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-600 mb-2">Price Range</h3>
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

            {/* Rating Filter */}
            <div className="mb-4 bg-white shadow-lg p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-600 mb-2">Rating</h3>
              <div className="flex flex-col gap-2">
                {[5, 4, 3].map((star:number) => (
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

            {/* Special Offers Filter */}
            <div className="mb-4 bg-white shadow-lg p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-600 mb-2">Special Offers</h3>
              <div className="flex flex-col gap-2">
                {["20%", "50%"].map((offer) => (
                  <button
                    key={offer}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        offers: prev.offers === offer ? "" : offer, // Toggle the offer
                      }))
                    }
                    className={`py-2 px-3 border rounded-lg ${
                      filters.offers === offer
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    {offer} Off Deals
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full md:w-3/4 ml-0 md:ml-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Salon Listings
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentSalons.length > 0 ? (
                currentSalons.map((salon, index) => (
                  <SalonCard
                    key={index}
                    name={salon.salonName}
                    image={salon.images[0].url}
                    rating={salon.rating}
                    comment={`${salon.address.areaStreet}, ${salon.address.city}`} 
                    id={salon._id}
                  />
                ))
              ) : (
                <p className="text-gray-500">No salons found.</p>
              )}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center mt-6">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="px-4 py-2 text-black rounded-lg bg-gray-100 m-2"
              >
              back
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





