import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { CalendarCheck, GalleryHorizontal, Gift, Grid2X2, LogOut, Menu, MessageSquare, Scissors, UserRound, UsersRound, X } from "lucide-react";
import BrandMark from "@/shared/ui/atoms/BrandMark";
import { signOut } from "@/Redux/Salon/salonSlice";
import { signOutSalon } from "@/features/salon-management/api/salonAPI";
import { getErrorMessage } from "@/shared/lib/errors";

const navItems = [
  { label: "Dashboard", to: "/salon/dashboard", icon: Grid2X2 },
  { label: "Profile", to: "/salon/profile", icon: UserRound },
  { label: "Services", to: "/salon/service", icon: Scissors },
  { label: "Stylists", to: "/salon/stylists", icon: UsersRound },
  { label: "Bookings", to: "/salon/bookings", icon: CalendarCheck },
  { label: "Messages", to: "/salon/messages", icon: MessageSquare },
  { label: "Offers", to: "/salon/offers", icon: Gift },
  { label: "Gallery", to: "/salon/gallery", icon: GalleryHorizontal },
];

const SalonSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const signout = async () => {
    try {
      await signOutSalon();
      dispatch(signOut());
      navigate("/salon/login");
    } catch (error) {
      console.error("Sign out error:", getErrorMessage(error));
    }
  };

  return (
    <>
      <button
        className="fixed left-4 top-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground md:hidden"
        onClick={() => setIsOpen((value) => !value)}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 bg-[#101816] px-4 py-5 text-white transition-transform duration-300 md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <BrandMark tone="dark" />
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.toLowerCase() === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                  active ? "bg-white text-[#101816]" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={signout}
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default SalonSidebar;
