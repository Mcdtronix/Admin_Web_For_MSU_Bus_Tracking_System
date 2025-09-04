import React, { useEffect, useState } from "react";
import { Button, Box, Typography } from "@mui/material";
import {
  getRoutes,
  addRoute,
  updateRoute,
  deleteRoute,
  suspendRoute,
} from "../api/routes";
import RouteTable from "../components/RouteTable";
import RouteForm from "../components/RouteForm";

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    from_station: "",
    to_station: "",
    price: "",
  });

  // In Routes.jsx
const fetchRoutes = () => getRoutes().then(res => setRoutes(res.data.results));

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleOpen = (route = null) => {
    setEditing(route);
    setForm(
      route
        ? {
            name: route.name,
            from_station: route.from_station,
            to_station: route.to_station,
            price: route.price,
          }
        : { name: "", from_station: "", to_station: "", price: "" }
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
      />
    </Box>
  );
}
