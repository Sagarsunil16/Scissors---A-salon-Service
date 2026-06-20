import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import BrandMark from "@/shared/ui/atoms/BrandMark";
import { LogOut } from "@/features/user/api/UserAPI";
import { signOut } from "@/Redux/User/userSlice";
import { RootState } from "@/Redux/store";
import { getErrorMessage } from "@/shared/lib/errors";

const Navbar = () => {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Salons", path: "/salons" },
    { name: "Appointments", path: "/appointments" },
    { name: "Profile", path: "/profile" },
  ];

  const signout = async () => {
    try {
      await LogOut();
      dispatch(signOut());
      navigate("/login");
    } catch (error) {
      console.log(getErrorMessage(error));
    }
  };

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-border/70 bg-white/90 backdrop-blur-xl">
      <div className="section-shell flex h-20 items-center justify-between">
        <BrandMark />

        <button
          onClick={() => setIsOpen((value) => !value)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground md:hidden"
          aria-label={isOpen ? "Close navigation" : "Open navigation"}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-sm font-medium text-muted-foreground transition hover:text-primary"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {!currentUser ? (
            <>
              <Link
                to="/login"
                className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Sign up
              </Link>
            </>
          ) : (
            <button
              className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
              onClick={signout}
            >
              Log out
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-border bg-white md:hidden">
          <div className="section-shell space-y-3 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {!currentUser ? (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  to="/login"
                  className="rounded-md border border-border px-4 py-2 text-center text-sm font-semibold"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="rounded-md bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground"
                >
                  Sign up
                </Link>
              </div>
            ) : (
              <button
                className="w-full rounded-md border border-border px-4 py-2 text-sm font-semibold"
                onClick={signout}
              >
                Log out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
