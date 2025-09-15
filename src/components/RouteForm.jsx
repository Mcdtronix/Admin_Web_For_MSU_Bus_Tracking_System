import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Box,
} from "@mui/material";

export default function RouteForm({
  open,
  onClose,
  onSubmit,
  form,
  setForm,
  editing,
  stations = [],
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{editing ? "Edit Route" : "Add Route"}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
          <TextField
            label="Route Name"
            value={form.name || ''}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            fullWidth
            required
          />
          <TextField
            label="Distance (km)"
            type="number"
            value={form.distance || ''}
            onChange={(e) => setForm({ ...form, distance: parseFloat(e.target.value) || '' })}
            fullWidth
            required
            inputProps={{ step: 0.1, min: 0 }}
          />
          <TextField
            label="Estimated Duration (minutes)"
            type="number"
            value={form.estimated_duration || ''}
            onChange={(e) => setForm({ ...form, estimated_duration: parseInt(e.target.value, 10) || '' })}
            fullWidth
            required
            inputProps={{ min: 1 }}
          />
          <TextField
            label="Price"
            type="number"
            value={form.price || ''}
            onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || '' })}
            fullWidth
            required
            inputProps={{ step: 0.01, min: 0 }}
          />
          <FormControl fullWidth required>
            <InputLabel>From Station</InputLabel>
            <Select
              value={form.from_station || ''}
              onChange={(e) => setForm({ ...form, from_station: e.target.value })}
              label="From Station"
            >
              {stations.map((station) => (
                <MenuItem key={station.id} value={station.id}>
                  {station.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth required>
            <InputLabel>To Station</InputLabel>
            <Select
              value={form.to_station || ''}
              onChange={(e) => setForm({ ...form, to_station: e.target.value })}
              label="To Station"
            >
              {stations.map((station) => (
                <MenuItem key={station.id} value={station.id}>
                  {station.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={form.is_active !== false}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                name="is_active"
              />
            }
            label="Active"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained">
          {editing ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
