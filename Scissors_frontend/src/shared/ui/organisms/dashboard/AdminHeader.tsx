import { Bell, UserCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { RootState } from "@/Redux/store";

interface AdminHeaderUser {
  firstname?: string;
  lastname?: string;
}

const AdminHeader = () => {
  const currentUser = useSelector(
    (state: RootState) => state?.admin?.currentUser
  ) as AdminHeaderUser | null;
  const { firstname, lastname } = currentUser ?? {};

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="flex min-h-20 items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="pl-12 md:pl-0">
          <p className="text-sm font-medium text-muted-foreground">Admin workspace</p>
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
            {firstname || lastname ? `${firstname ?? ""} ${lastname ?? ""}` : "Dashboard"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-white text-muted-foreground transition hover:text-primary">
            <Bell className="h-5 w-5" />
          </button>
          <Link
            to="/admin/profile"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground transition hover:bg-primary/90"
            aria-label="Admin profile"
          >
            <UserCircle className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
