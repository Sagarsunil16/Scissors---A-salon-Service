export interface SidebarProps {
    title: string; // Title of the sidebar (e.g., "SCISSORS")
    links: { label: string; path: string }[]; // Array of navigation links
    signOutEndpoint: string; // API endpoint for signing out
    signOutRedirect: string; // Redirect path after signing out
  }