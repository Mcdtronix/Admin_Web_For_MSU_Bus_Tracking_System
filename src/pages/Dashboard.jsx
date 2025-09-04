import React, { useEffect, useMemo, useState } from "react";
import {
  Typography,
  Box,
  Grid,
  Card,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";
import { getBuses } from "../api/buses";
import { getRoutes } from "../api/routes";
import { getAnalytics } from "../api/anayltics";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function StatCard({ title, value, subtitle, color = "primary.main" }) {
  return (
    <Card sx={{ p: 2, height: "100%", minHeight: 120 }}>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 800, color, mt: 0.5 }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Card>
  );
}

export default function Dashboard() {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [bRes, rRes] = await Promise.all([getBuses(), getRoutes()]);
        setBuses(Array.isArray(bRes.data?.results) ? bRes.data.results : bRes.data || []);
        setRoutes(Array.isArray(rRes.data?.results) ? rRes.data.results : rRes.data || []);
        // Try to fetch analytics; non-fatal if missing
        try {
          const aRes = await getAnalytics();
          setAnalytics(aRes.data);
        } catch {}
      } catch (e) {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const publishedCount = useMemo(
    () => buses.filter((b) => b.published).length,
    [buses]
  );

  const busStatusData = useMemo(
    () => [
      { name: "Active", value: publishedCount },
      { name: "Inactive", value: Math.max(buses.length - publishedCount, 0) },
    ],
    [buses, publishedCount]
  );

  const bookings7d = useMemo(() => {
    // Prefer backend analytics if provided
    if (analytics?.bookings_last_7_days) return analytics.bookings_last_7_days;
    // Fallback: dummy flat data for visual continuity
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((d) => ({ day: d, count: 0 }));
  }, [analytics]);

  const routeDemand = useMemo(() => {
    // Prefer backend if present
    if (analytics?.route_demand) return analytics.route_demand;
    // Fallback: map route names with zero
    return (routes || []).slice(0, 6).map((r) => ({ name: r.name || `Route ${r.id}`, value: 0 }));
  }, [analytics, routes]);

  const PIE_COLORS = ["#2563eb", "#94a3b8", "#0ea5e9", "#22c55e", "#f59e0b"]; 

  return (
    <Box p={{ xs: 2, md: 3 }} sx={{ minHeight: "calc(100vh - 64px)", width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
      <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">
          Overview of fleet, routes, and bookings
        </Typography>
      </Stack>

      {loading && (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && !error && (
        <>
          {/* Stat Cards */}
          <Grid container spacing={3} sx={{ mb: 1 }} columns={{ xs: 12, md: 12, lg: 12 }} alignItems="stretch">
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Total Buses" value={buses.length} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Total Routes" value={routes.length} color="#0ea5e9" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Active Buses" value={publishedCount} color="#22c55e" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Bookings Today" value={analytics?.bookings_today ?? "-"} color="#f59e0b" />
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={3} columns={{ xs: 12, md: 12, lg: 12 }} alignItems="stretch">
            <Grid item xs={12} md={6} lg={6}>
              <Card sx={{ p: 2, height: { xs: 320, md: 420, lg: 480 } }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Bookings (Last 7 days)</Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <LineChart data={bookings7d} margin={{ left: 12, right: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={6}>
              <Card sx={{ p: 2, height: { xs: 320, md: 420, lg: 480 } }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Bus Status</Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <PieChart>
                    <Pie data={busStatusData} dataKey="value" nameKey="name" outerRadius="80%" label>
                      {busStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card sx={{ p: 2, height: { xs: 360, md: 420, lg: 480 } }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Route Demand</Typography>
                <ResponsiveContainer width="100%" height="82%">
                  <BarChart data={routeDemand}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}
