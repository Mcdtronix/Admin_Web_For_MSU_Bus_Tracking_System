import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Box, Typography, Paper, Alert, CircularProgress, Link, Divider } from "@mui/material";
import client from "../api/client";

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
    
    console.log('Attempting login with:', { email, password: '***' });
    
    try {
      const res = await client.post('/auth/login/', { email, password });
      console.log('Login response:', res.data);
      
      const token = res?.data?.token || res?.data?.access;
      if (!token) throw new Error('Missing token in response');
      
      localStorage.setItem("token", token);
      navigate("/dashboard");
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      
      let errorMessage = "Login failed";
      
      if (err.response?.status === 400) {
        errorMessage = err.response?.data?.detail || err.response?.data?.error || "Invalid credentials or missing fields";
      } else if (err.response?.status === 401) {
        errorMessage = "Invalid email or password";
      } else if (err.response?.status === 403) {
        errorMessage = "Account is disabled";
      } else if (err.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error')) {
        errorMessage = "Network error. Please check your connection.";
      }
      
      setError(errorMessage);
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
