import Footer from "@/shared/ui/organisms/navigation/Footer";
import Navbar from "@/shared/ui/organisms/navigation/Navbar";
import { useEffect, useState } from "react";
import SalonCard from "@/features/salon-discovery/components/SalonCard";
import { useSearchParams } from "react-router-dom";
import { ISalon } from "../../interfaces/interface";
import axios from "axios";
import { getSalons } from "@/features/user/api/UserAPI";
import {
  Filter,
  LocateFixed,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
} from "lucide-react";

const services = [
  { name: "Hair Cut" },
  { name: "Hair Styling" },
  { name: "Nail Art" },
  { name: "Beard Cut" },
  { name: "Massage" },
  { name: "Pedicure" },
  { name: "Lip Tinting" },
];

const fallbackSalonImage =
  "https://content.jdmagicbox.com/comp/ernakulam/g1/0484px484.x484.220123012003.f7g1/catalogue/chop-shop-barber-and-brand-panampilly-nagar-ernakulam-salons-1lafuvkusk.jpg";

const Salons = () => {
  const [salonsData, setSalonsData] = useState<ISalon[]>([]);
  const [search, setSearch] = useState("");
  const [pincode, setPincode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [locationMode, setLocationMode] = useState<"all" | "near-me" | "pincode">("all");
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const itemsPerPage = 6;
  const [searchParams, setSearchParams] = useSearchParams();
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

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
        pincode?: string;
      } = {
        search,
        maxPrice: filters.maxPrice,
        ratings: filters.ratings.join(","),
        discount: filters.discount,
        page: currentPage,
        limit: itemsPerPage,
        sort: sortOption,
      };

      if (locationMode !== "all" && coordinates) {
        params.longitude = coordinates.longitude;
        params.latitude = coordinates.latitude;
        params.radius = 5000;
      }

      if (locationMode === "pincode" && pincode) {
        params.pincode = pincode;
      }

      const response = await getSalons(params);
      setSalonsData(response.data.salons);
      setTotalPages(response.data.paginations.totalPages);
      setTotalSalons(response.data.paginations.totalSalons);
      setError(null);
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Failed to fetch salons. Please try again.";
      setError(message);
      console.error("Salons fetch error:", err);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ latitude, longitude });
          setLocationMode("near-me");
          setPincode("");
          setError(null);
          setCurrentPage(1);
        },
        (err) => {
          setError("Location access denied. Showing all salons.");
          setCoordinates(null);
          setLocationMode("all");
          console.error("Geolocation error:", err);
        },
        { timeout: 10000 }
      );
    } else {
      setError("Geolocation is not supported. Showing all salons.");
      setCoordinates(null);
      setLocationMode("all");
    }
  };

  const applyPincodeSearch = (value: string) => {
    if (!value.match(/^\d{6}$/)) {
      setCoordinates(null);
      setLocationMode("all");
      setError("Please enter a valid 6-digit pincode.");
      return;
    }
    setCoordinates(null);
    setLocationMode("pincode");
    setCurrentPage(1);
    setError(null);
  };

  const handlePincodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode.match(/^\d{6}$/)) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }

    applyPincodeSearch(pincode);
  };

  useEffect(() => {
    getNearbySalons();
  }, [coordinates, locationMode, search, filters, currentPage, sortOption]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (pincode) params.set("pincode", pincode);
    if (locationMode !== "all") params.set("locationMode", locationMode);
    if (filters.maxPrice !== 100000) {
      params.set("maxPrice", String(filters.maxPrice));
    }
    if (filters.ratings.length > 0) {
      params.set("ratings", filters.ratings.join(","));
    }
    if (filters.discount > 0) params.set("discount", String(filters.discount));
    if (sortOption !== "rating_desc") params.set("sort", sortOption);
    params.set("page", String(currentPage));
    setSearchParams(params);
  }, [search, pincode, locationMode, filters, currentPage, sortOption, setSearchParams]);

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    if (params.search) setSearch(params.search);
    if (params.pincode) {
      setPincode(params.pincode);
      setLocationMode("pincode");
      setCoordinates(null);
    }
    if (params.locationMode === "near-me") setLocationMode("near-me");
    if (params.maxPrice) {
      setFilters((prev) => ({ ...prev, maxPrice: Number(params.maxPrice) }));
    }
    if (params.ratings) {
      setFilters((prev) => ({
        ...prev,
        ratings: params.ratings.split(",").map(Number),
      }));
    }
    if (params.discount) {
      setFilters((prev) => ({ ...prev, discount: Number(params.discount) }));
    }
    if (params.sort) setSortOption(params.sort);
    if (params.page) setCurrentPage(Number(params.page));
  }, [searchParams]);

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }));
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
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const resetFilters = () => {
    setFilters({ maxPrice: 100000, ratings: [], discount: 0 });
    setSearch("");
    setPincode("");
    setCoordinates(null);
    setLocationMode("all");
    setCurrentPage(1);
  };

  const clearLocation = () => {
    setPincode("");
    setCoordinates(null);
    setLocationMode("all");
    setCurrentPage(1);
    setError(null);
  };

  const activeFilterCount =
    (filters.maxPrice !== 100000 ? 1 : 0) +
    filters.ratings.length +
    (filters.discount ? 1 : 0);

  const filtersPanel = (
    <div className="app-surface rounded-lg p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Filters</h2>
        </div>
        <button
          type="button"
          onClick={resetFilters}
          className="text-xs font-semibold text-muted-foreground transition hover:text-primary"
        >
          Reset
        </button>
      </div>

      <div className="mt-6 border-t border-border pt-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Max price</h3>
          <span className="text-sm font-semibold text-primary">
            Rs {filters.maxPrice.toLocaleString("en-IN")}
          </span>
        </div>
        <input
          type="range"
          min="100"
          max="100000"
          step="100"
          value={filters.maxPrice}
          onChange={(e) => {
            handleMaxPriceChange(e);
            setCurrentPage(1);
          }}
          className="mt-4 w-full accent-primary"
        />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>Rs 100</span>
          <span>Rs 100,000</span>
        </div>
      </div>

      <div className="mt-6 border-t border-border pt-5">
        <h3 className="text-sm font-semibold text-foreground">Rating</h3>
        <div className="mt-3 space-y-3">
          {[5, 4, 3].map((star) => (
            <label
              key={star}
              className="flex cursor-pointer items-center justify-between rounded-md border border-border px-3 py-2 transition hover:border-primary"
            >
              <span className="flex items-center gap-2 text-sm text-foreground">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {star} stars
              </span>
              <input
                type="checkbox"
                checked={filters.ratings.includes(star)}
                onChange={() => {
                  handleRatingChange(star);
                  setCurrentPage(1);
                }}
                className="h-4 w-4 accent-primary"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="mt-6 border-t border-border pt-5">
        <h3 className="text-sm font-semibold text-foreground">Special offers</h3>
        <div className="mt-3 grid gap-2">
          {[20, 50].map((discount) => (
            <button
              key={discount}
              onClick={() => {
                handleDiscountChange(discount);
                setCurrentPage(1);
              }}
              className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                filters.discount === discount
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-white text-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {discount}% off deals
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <section className="border-b border-border bg-white">
          <div className="section-shell py-10">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  <Sparkles className="h-4 w-4" />
                  Curated salon discovery
                </div>
                <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                  Find a salon that fits your style, schedule, and budget.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                  Search services, compare highly rated salons, and narrow results by location, price, rating, and offers.
                </p>
              </div>

              <div className="app-surface rounded-lg p-4">
                <label className="flex items-center gap-3 rounded-md border border-input bg-background px-4 py-3">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    placeholder="Search salons, services, stylists..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCoordinates(null);
                      setLocationMode("all");
                      setCurrentPage(1);
                    }}
                  />
                </label>

                <form
                  onSubmit={handlePincodeSubmit}
                  className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto_auto]"
                >
                  <label className="flex items-center gap-3 rounded-md border border-input bg-background px-4 py-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => {
                        setPincode(e.target.value);
                        setCoordinates(null);
                        setLocationMode("all");
                        setCurrentPage(1);
                      }}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      placeholder="Enter 6-digit pincode"
                    />
                  </label>
                  <button
                    type="submit"
                    className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={getUserLocation}
                    className={`inline-flex h-12 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold transition ${
                      locationMode === "near-me"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-white text-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    <LocateFixed className="h-4 w-4" />
                    Near me
                  </button>
                </form>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {locationMode === "near-me" && (
                    <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
                      Searching near your current location
                    </span>
                  )}
                  {locationMode === "pincode" && (
                    <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
                      Searching around pincode {pincode}
                    </span>
                  )}
                  {locationMode !== "all" && (
                    <button
                      type="button"
                      onClick={clearLocation}
                      className="font-semibold text-foreground underline underline-offset-4 transition hover:text-primary"
                    >
                      Search all locations
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="-mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
              {services.map((service) => (
                <button
                  key={service.name}
                  onClick={() => {
                    setSearch(service.name);
                    setCoordinates(null);
                    setLocationMode("all");
                    setCurrentPage(1);
                  }}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
                    search === service.name
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {service.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {error && (
          <div className="section-shell pt-5">
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {error}
            </div>
          </div>
        )}

        <div className="section-shell py-8">
          <div className="sticky top-20 z-30 -mx-4 mb-5 border-y border-border bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsFilterOpen(true)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border text-sm font-semibold text-foreground"
              >
                <Filter className="h-4 w-4" />
                Filter
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <select
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-11 rounded-md border border-border bg-white px-3 text-sm font-semibold text-foreground outline-none"
                aria-label="Sort salons"
              >
                <option value="rating_desc">Top rated</option>
                <option value="name_asc">Name: A-Z</option>
                <option value="name_desc">Name: Z-A</option>
              </select>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[290px_1fr]">
            <aside className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
              {filtersPanel}
            </aside>

            <section>
              <div className="mb-5 flex flex-col gap-4 rounded-lg border border-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                    <SlidersHorizontal className="h-4 w-4" />
                    Results
                  </div>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                    {totalSalons} salon{totalSalons === 1 ? "" : "s"} found
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                </div>
                <select
                  value={sortOption}
                  onChange={(e) => {
                    setSortOption(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="hidden h-11 rounded-md border border-input bg-background px-3 text-sm outline-none ring-primary transition focus:ring-2 sm:block"
                >
                  <option value="rating_desc">Top rated</option>
                  <option value="name_asc">Name: A-Z</option>
                  <option value="name_desc">Name: Z-A</option>
                </select>
              </div>

              {salonsData.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {salonsData.map((salon) => (
                    <SalonCard
                      key={salon._id}
                      name={salon.salonName}
                      image={
                        salon.images && salon.images.length > 0
                          ? salon.images[0].url
                          : fallbackSalonImage
                      }
                      rating={salon.rating.toFixed(1)}
                      comment={`${salon.address.areaStreet}, ${salon.address.city}`}
                      id={salon._id}
                    />
                  ))}
                </div>
              ) : (
                <div className="app-surface rounded-lg p-10 text-center">
                  <h3 className="text-xl font-semibold text-foreground">No salons found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Try a different pincode, search term, or loosen your filters.
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                  >
                    Clear filters
                  </button>
                </div>
              )}

              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="rounded-md border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Back
                </button>
                <span className="rounded-md bg-white px-4 py-2 text-sm font-medium text-muted-foreground ring-1 ring-border">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="rounded-md border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
      {isFilterOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-black/45"
            onClick={() => setIsFilterOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[86vh] overflow-y-auto rounded-t-2xl bg-background p-4 shadow-2xl">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" />
            {filtersPanel}
            <div className="sticky bottom-0 mt-4 grid grid-cols-2 gap-3 bg-background pt-3">
              <button
                type="button"
                onClick={resetFilters}
                className="h-11 rounded-md border border-border bg-white text-sm font-semibold text-foreground"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="h-11 rounded-md bg-primary text-sm font-semibold text-primary-foreground"
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Salons;
