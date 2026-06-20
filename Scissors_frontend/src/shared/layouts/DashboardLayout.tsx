import { ReactNode } from "react";

interface DashboardLayoutProps {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
}

const DashboardLayout = ({ sidebar, header, children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground md:flex">
      {sidebar}
      <div className="min-w-0 flex-1">
        {header}
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
