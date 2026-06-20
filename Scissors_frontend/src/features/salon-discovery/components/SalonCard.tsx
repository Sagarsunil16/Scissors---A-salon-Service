import { MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";

interface SalonCardProps {
  name: string;
  image: string;
  rating: number | string;
  comment: string;
  id?: string;
}

const SalonCard = ({ name, image, rating, comment, id }: SalonCardProps) => {
  return (
    <Link to={`/salon-details/${id ?? ""}`} className="group block">
      <article className="app-surface h-full overflow-hidden rounded-lg transition group-hover:-translate-y-1 group-hover:shadow-[0_24px_60px_rgba(18,24,27,0.1)]">
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold text-foreground">{name}</h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
              <Star className="h-3.5 w-3.5 fill-current" />
              {rating}
            </span>
          </div>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{comment}</p>
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-primary">
            <MapPin className="h-4 w-4" />
            View salon details
          </div>
        </div>
      </article>
    </Link>
  );
};

export default SalonCard;
