import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Box, Typography, Paper, Alert, CircularProgress, Link, Divider } from "@mui/material";
import axios from "axios";

const API_BASE_URL = "http://parole.pythonanywhere.com/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login/`, { email, password });
      localStorage.setItem("token", res.data.access);
      navigate("/dashboard");
    } catch (err) {
      const msg = err?.response?.data?.detail || "Invalid credentials";
      setError(msg);
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 60%)",
      }}
    >
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, width: "100%", maxWidth: 420, borderRadius: 3, boxShadow: "0 12px 40px rgba(2, 8, 23, 0.08)" }}>
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>MSU Admin</Typography>
          <Typography variant="body2" color="text.secondary">Sign in to manage buses, routes and analytics</Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
            autoFocus
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
            <Box />
            <Link component="button" type="button" underline="hover" sx={{ fontSize: 14 }} onClick={() => {}}>
              Forgot password?
            </Link>
          </Box>

          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2, py: 1.2 }} disabled={loading}>
            {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Sign In"}
          </Button>
        </form>

        <Divider sx={{ my: 3 }} />
        <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
          Secured with JWT Authentication
        </Typography>
      </Paper>
    </Box>
  );
}
