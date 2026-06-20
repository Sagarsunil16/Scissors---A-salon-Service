import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, MapPin, Search, Sparkles } from "lucide-react";
import Navbar from "@/shared/ui/organisms/navigation/Navbar";
import Footer from "@/shared/ui/organisms/navigation/Footer";
import salonBanner from "../../../../public/images/salon_banner.png";
import PopularServices from "@/features/salon-discovery/components/PopularServices";
import SalonCard from "@/features/salon-discovery/components/SalonCard";
import { getSalons } from "@/features/user/api/UserAPI";
import { ISalon } from "@/interfaces/interface";

const fallbackRecommendedSalons = [
  {
    _id: "fallback-1",
    salonName: "Signature Studio",
    image: "/images/salon1.jpeg",
    rating: 4.8,
    comment: "Top-rated grooming, styling, and salon care.",
  },
  {
    _id: "fallback-2",
    salonName: "Urban Trim Lounge",
    image: "/images/salon2.jpeg",
    rating: 4.6,
    comment: "Reliable appointments with polished service quality.",
  },
  {
    _id: "fallback-3",
    salonName: "Glow House",
    image: "/images/salon3.jpeg",
    rating: 4.7,
    comment: "Known for hair, spa, and beauty refreshes.",
  },
  {
    _id: "fallback-4",
    salonName: "Craft & Care",
    image: "/images/salon4.jpeg",
    rating: 4.5,
    comment: "Professional staff and comfortable salon spaces.",
  },
];

const getSalonImage = (salon: ISalon) => {
  return salon.images?.[0]?.url || "/images/salon1.jpeg";
};

const getSalonLocation = (salon: ISalon) => {
  const area = salon.address?.areaStreet;
  const city = salon.address?.city;
  return [area, city].filter(Boolean).join(", ") || "View salon details";
};

const HomePage = () => {
  const navigate = useNavigate();
  const [serviceSearch, setServiceSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [recommendedSalons, setRecommendedSalons] = useState<ISalon[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);

  useEffect(() => {
    const fetchRecommendedSalons = async () => {
      setIsLoadingRecommendations(true);
      try {
        const response = await getSalons({
          page: 1,
          limit: 4,
          sort: "rating_desc",
        });
        setRecommendedSalons(response.data.salons || []);
      } catch {
        setRecommendedSalons([]);
      } finally {
        setIsLoadingRecommendations(false);
      }
    };

    fetchRecommendedSalons();
  }, []);

  const recommendationStats = useMemo(() => {
    const count = recommendedSalons.length;
    const averageRating =
      count > 0
        ? recommendedSalons.reduce((sum, salon) => sum + (salon.rating || 0), 0) / count
        : 4.8;

    return {
      count: count || 120,
      averageRating: averageRating.toFixed(1),
    };
  }, [recommendedSalons]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams();
    const search = serviceSearch.trim();
    const location = locationSearch.trim();

    if (search) params.set("search", search);
    if (/^\d{6}$/.test(location)) {
      params.set("pincode", location);
    } else if (location) {
      params.set("search", [search, location].filter(Boolean).join(" "));
    }

    navigate(`/salons${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative overflow-hidden bg-[#101816] pt-20 text-white">
        <div className="absolute inset-0">
          <img
            src={salonBanner}
            alt="Salon interior"
            className="h-full w-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#101816] via-[#101816]/82 to-[#101816]/20" />
        </div>

        <div className="section-shell relative grid min-h-[680px] items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-white/80">
              <Sparkles className="h-4 w-4 text-accent" />
              Premium salon booking
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
              Find the right salon appointment with less effort.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
              Discover trusted salons, compare services, and reserve a time that
              fits your day.
            </p>

            <form
              onSubmit={handleSearch}
              className="mt-8 grid max-w-3xl gap-3 rounded-lg border border-white/15 bg-white p-2 shadow-2xl sm:grid-cols-[1fr_1fr_auto]"
            >
              <label className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-3 text-foreground">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={serviceSearch}
                  onChange={(event) => setServiceSearch(event.target.value)}
                  placeholder="Search service or salon"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </label>
              <label className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-3 text-foreground">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={locationSearch}
                  onChange={(event) => setLocationSearch(event.target.value)}
                  placeholder="Pincode or city"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </label>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                <Search className="h-4 w-4" />
                Search
              </button>
            </form>
          </div>

          <div className="hidden lg:block">
            <div className="app-surface rounded-lg bg-white/95 p-5 text-foreground">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <CalendarCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Next available</p>
                  <p className="font-semibold">Browse salons and book after sign in</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-4 text-center">
                <div className="rounded-md bg-background p-3">
                  <p className="text-xl font-semibold">{recommendationStats.count}+</p>
                  <p className="text-xs text-muted-foreground">Salons</p>
                </div>
                <div className="rounded-md bg-background p-3">
                  <p className="text-xl font-semibold">{recommendationStats.averageRating}</p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
                <div className="rounded-md bg-background p-3">
                  <p className="text-xl font-semibold">24h</p>
                  <p className="text-xs text-muted-foreground">Booking</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PopularServices />

      <section className="bg-white py-20">
        <div className="section-shell">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Experience
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                A more polished way to plan your next visit.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Browse real salon spaces and services before you book, so the
                appointment feels considered from the first click.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((img) => (
                <div key={img} className="aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                  <img
                    src={`/images/gallery${img}.jpeg`}
                    alt={`Salon gallery ${img}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-20">
        <div className="section-shell">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Recommended
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Salons worth booking.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Ranked from the best available salons by rating, review quality, and booking readiness.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/salons?sort=rating_desc")}
              className="h-11 rounded-md border border-input bg-background px-4 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              View all salons
            </button>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {isLoadingRecommendations
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="app-surface h-80 animate-pulse rounded-lg bg-muted" />
                ))
              : recommendedSalons.length > 0
                ? recommendedSalons.map((salon) => (
                    <SalonCard
                      key={salon._id}
                      id={salon._id}
                      name={salon.salonName}
                      image={getSalonImage(salon)}
                      rating={(salon.rating || 0).toFixed(1)}
                      comment={getSalonLocation(salon)}
                    />
                  ))
                : fallbackRecommendedSalons.map((salon) => (
                    <SalonCard
                      key={salon._id}
                      name={salon.salonName}
                      image={salon.image}
                      rating={salon.rating}
                      comment={salon.comment}
                    />
                  ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="section-shell">
          <div className="app-surface grid gap-6 rounded-lg p-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Stay close to new offers.</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Get salon promotions, seasonal packages, and service updates.
              </p>
            </div>
            <form className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Email address"
                className="h-11 min-w-0 rounded-md border border-input bg-background px-3 text-sm outline-none ring-primary transition focus:ring-2 sm:w-72"
              />
              <button className="h-11 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
