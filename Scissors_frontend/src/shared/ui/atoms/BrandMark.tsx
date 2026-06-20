import { Scissors } from "lucide-react";
import { Link } from "react-router-dom";

interface BrandMarkProps {
  to?: string;
  compact?: boolean;
  tone?: "light" | "dark";
}

const BrandMark = ({ to = "/", compact = false, tone = "light" }: BrandMarkProps) => {
  const content = (
    <span className={tone === "dark" ? "inline-flex items-center gap-2 text-white" : "inline-flex items-center gap-2 text-foreground"}>
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Scissors className="h-4 w-4" />
      </span>
      {!compact && (
        <span className="text-lg font-semibold tracking-[0.14em]">
          SCISSORS
        </span>
      )}
    </span>
  );

  return <Link to={to}>{content}</Link>;
};

export default BrandMark;
