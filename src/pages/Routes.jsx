import React, { useEffect, useState } from "react";
import { Button, Box, Typography } from "@mui/material";
import {
  getRoutes,
  addRoute,
  updateRoute,
  deleteRoute,
  suspendRoute,
} from "../api/routes";
import { getStations } from "../api/stations";
import RouteTable from "../components/RouteTable";
import RouteForm from "../components/RouteForm";

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [stations, setStations] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    from_station: "",
    to_station: "",
    distance: "",
    estimated_duration: "",
    price: "",
    is_active: true,
  });

  const fetchRoutes = () => getRoutes().then(res => setRoutes(Array.isArray(res.data) ? res.data : (res.data.results || [])));
  const fetchStations = () => getStations().then(res => setStations(Array.isArray(res.data) ? res.data : (res.data.results || [])));

  useEffect(() => {
    fetchRoutes();
    fetchStations();
  }, []);

  const handleOpen = (route = null) => {
    setEditing(route);
    setForm(
      route
        ? {
            name: route.name || "",
            from_station: route.from_station || "",
            to_station: route.to_station || "",
            distance: route.distance || "",
            estimated_duration: route.estimated_duration || "",
            price: route.price || "",
            is_active: route.is_active !== false,
          }
        : { 
            name: "", 
            from_station: "", 
            to_station: "", 
            distance: "", 
            estimated_duration: "", 
            price: "", 
            is_active: true 
          }
    );
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
  };

  const handleSubmit = async () => {
    if (editing) {
      await updateRoute(editing.id, form);
    } else {
      await addRoute(form);
    }
    fetchRoutes();
    handleClose();
  };

  const handleDelete = async (id) => {
    await deleteRoute(id);
    fetchRoutes();
  };

  const handleSuspend = async (route) => {
    await suspendRoute(route.id, !route.suspended);
    fetchRoutes();
  };

  return (
    <Box p={4}>
      <Typography variant="h5" gutterBottom>
        Routes Management
      </Typography>
      <Button variant="contained" onClick={() => handleOpen()} sx={{ mb: 2 }}>
        Add Route
      </Button>
      <RouteTable
        routes={Array.isArray(routes) ? routes : []}
        onEdit={handleOpen}
        onDelete={handleDelete}
        onSuspend={handleSuspend}
      />
      <RouteForm
        open={open}
        onClose={handleClose}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        editing={editing}
        stations={stations}
      />
    </Box>
  );
}
