import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import TimelineIcon from "@mui/icons-material/Timeline";
import BarChartIcon from "@mui/icons-material/BarChart";
import ScheduleIcon from "@mui/icons-material/Schedule";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import PlaceIcon from "@mui/icons-material/Place";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const navItems = [
    { to: "/dashboard", icon: <DashboardIcon />, label: "Dashboard" },
    { to: "/buses", icon: <DirectionsBusIcon />, label: "Buses" },
    { to: "/schedules", icon: <ScheduleIcon />, label: "Bus Schedules" },
    { to: "/trackers", icon: <GpsFixedIcon />, label: "Bus Trackers" },
    { to: "/stations", icon: <PlaceIcon />, label: "Bus Stations" },
    { to: "/locations", icon: <LocationOnIcon />, label: "Bus Locations" },
    { to: "/routes", icon: <TimelineIcon />, label: "Routes" },
    { to: "/analytics", icon: <BarChartIcon />, label: "Analytics" },
  ];
  
  // Group related items for better organization
  const busManagementItems = navItems.filter(item => 
    ['/buses', '/schedules', '/trackers', '/stations', '/locations'].includes(item.to)
  );
  
  const otherItems = navItems.filter(item => 
    !['/buses', '/schedules', '/trackers', '/stations', '/locations'].includes(item.to)
  );
  return (
    <Drawer variant="permanent" anchor="left" sx={{ width: 240 }}>
      <List>
        {otherItems.map(({ to, icon, label }) => (
          <ListItem
            key={to}
            component={NavLink}
            to={to}
            style={({ isActive }) => ({
              background: isActive ? "#e3f2fd" : undefined,
              borderLeft: isActive ? "4px solid #1976d2" : undefined,
              color: 'inherit',
              textDecoration: 'none',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            })}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>{icon}</ListItemIcon>
            <ListItemText primary={label} />
          </ListItem>
        ))}
        
        <Divider sx={{ my: 1 }} />
        
        <ListItem>
          <ListItemText primary="Bus Management" primaryTypographyProps={{
            variant: 'subtitle2',
            color: 'text.secondary',
            sx: { fontWeight: 'medium', pl: 1 }
          }} />
        </ListItem>
        
        {busManagementItems.map(({ to, icon, label }) => (
          <ListItem
            key={to}
            component={NavLink}
            to={to}
            style={({ isActive }) => ({
              background: isActive ? "#e3f2fd" : undefined,
              borderLeft: isActive ? "4px solid #1976d2" : undefined,
              color: 'inherit',
              textDecoration: 'none',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
              pl: 4
            })}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>{icon}</ListItemIcon>
            <ListItemText primary={label} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}