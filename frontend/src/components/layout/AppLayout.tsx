import Box from "@mui/material/Box";
import Header from "../Header";
import AppSidebar, { type SidebarEntry, type SidebarPrimaryButton } from "./AppSidebar";

type AppLayoutProps = {
  /** User display name (e.g. first_name or email prefix) */
  displayName: string;
  /** Path for the logo link (role home, e.g. /home/owner) */
  homePath: string;
  /** Current page title shown in header */
  pageTitle: string;
  /** Sidebar navigation entries */
  sidebarEntries: SidebarEntry[];
  /** Optional primary action button in sidebar (e.g. "Add a Pet") */
  sidebarPrimaryButton?: SidebarPrimaryButton;
  /** Current path for highlighting active sidebar entry */
  activePath: string;
  onLogout: () => void;
  /** Optional background image URL for main content area */
  mainBackgroundImage?: string;
  children: React.ReactNode;
};

export default function AppLayout({
  displayName,
  homePath,
  pageTitle,
  sidebarEntries,
  sidebarPrimaryButton,
  activePath,
  onLogout,
  mainBackgroundImage,
  children,
}: AppLayoutProps) {
  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f8fcff",
      }}
    >
      <Header
        logoTo={homePath}
        pageTitle={pageTitle}
        displayName={displayName}
        mb={0}
        flexShrink={0}
      />

      <Box sx={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
        <AppSidebar
          displayName={displayName}
          entries={sidebarEntries}
          activePath={activePath}
          primaryButton={sidebarPrimaryButton}
          onLogout={onLogout}
        />

        <Box
          component="main"
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            position: "relative",
            textAlign: "left",
            ...(mainBackgroundImage && {
              backgroundImage: `url(${mainBackgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "scroll",
              backgroundRepeat: "no-repeat",
            }),
            py: 4,
            px: 4,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
