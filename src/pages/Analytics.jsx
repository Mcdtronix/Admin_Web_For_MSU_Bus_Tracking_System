import React from "react";
import { Typography, Box } from "@mui/material";

export default function Analytics() {
  return (
    <Box p={{ xs: 2, md: 3 }} sx={{ minHeight: "calc(100vh - 64px)", width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
      <Typography variant="h5">Analytics</Typography>
      <Typography variant="body2" mt={2}>
        Analytics dashboard coming soon.
      </Typography>
    </Box>
  );
}
