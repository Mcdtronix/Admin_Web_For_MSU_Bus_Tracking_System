import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Buses from "./pages/Buses";
import RoutesPage from "./pages/Routes";
import Stations from "./pages/Stations";
import Schedules from "./pages/Schedules";
import Bookings from "./pages/Bookings";
import Analytics from "./pages/Analytics";
import BusTrackers from "./pages/BusTrackers";
import Sidebar from "./components/Sidebar.jsx";
import TopBar from "./components/TopBar.jsx";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

function App() {
  const isAuthenticated = !!localStorage.getItem("token");
  const location = useLocation();
  const isLogin = location.pathname === "/login";
  const drawerWidth = 240;
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleMenuClick = () => setMobileOpen(true);
  const handleSidebarClose = () => setMobileOpen(false);

  return (
    <Box sx={{ display: "flex", height: "100%", width: "100%", bgcolor: "background.default", overflowX: "hidden" }}>
      {!isLogin && (
        <Sidebar mobileOpen={mobileOpen} onClose={handleSidebarClose} />
      )}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: !isLogin && isDesktop ? `${drawerWidth}px` : 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          width: "100%",
        }}
      >
        {!isLogin && <TopBar onMenuClick={handleMenuClick} />}
        <Box sx={{ p: { xs: 2, md: 3 }, flex: 1, width: "100%", boxSizing: "border-box" }}>
          <Routes>
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
            />
            <Route
              path="/dashboard"
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
            />
            <Route
              path="/buses"
              element={isAuthenticated ? <Buses /> : <Navigate to="/login" />}
            />
            <Route
              path="/routes"
              element={isAuthenticated ? <RoutesPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/schedules"
              element={isAuthenticated ? <Schedules /> : <Navigate to="/login" />}
            />
            <Route
              path="/bookings"
              element={isAuthenticated ? <Bookings /> : <Navigate to="/login" />}
            />
            <Route
              path="/stations"
              element={isAuthenticated ? <Stations /> : <Navigate to="/login" />}
            />
            <Route
              path="/analytics"
              element={isAuthenticated ? <Analytics /> : <Navigate to="/login" />}
            />
            <Route
              path="/trackers"
              element={isAuthenticated ? <BusTrackers /> : <Navigate to="/login" />}
            />
            <Route
              path="*"
              element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
            />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}

export default App;
