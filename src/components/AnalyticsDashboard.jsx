import React, { useEffect, useState } from "react";
import { Card, Typography, Grid, CircularProgress } from "@mui/material";
import { getAnalytics } from "../api/anayltics";

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAnalytics()
      .then((res) => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load analytics");
        setLoading(false);
      });
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!stats) return null;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Card sx={{ p: 2 }}>
          <Typography variant="h6">Total Buses</Typography>
          <Typography variant="h4">{stats.bus_count}</Typography>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card sx={{ p: 2 }}>
          <Typography variant="h6">Total Routes</Typography>
          <Typography variant="h4">{stats.route_count}</Typography>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card sx={{ p: 2 }}>
          <Typography variant="h6">Bookings Today</Typography>
          <Typography variant="h4">{stats.bookings_today}</Typography>
        </Card>
      </Grid>
    </Grid>
  );
}
