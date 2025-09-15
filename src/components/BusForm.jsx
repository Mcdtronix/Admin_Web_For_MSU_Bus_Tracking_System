import React from "react";
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, MenuItem } from "@mui/material";

export default function BusForm({ open, onClose, onSubmit, form, setForm, editing }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{editing ? "Edit Bus" : "Add Bus"}</DialogTitle>
      <DialogContent>
        <TextField
          label="Bus Number"
          value={form.bus_number || ''}
          onChange={e => setForm({ ...form, bus_number: e.target.value })}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="License Plate"
          value={form.license_plate || ''}
          onChange={e => setForm({ ...form, license_plate: e.target.value })}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Capacity"
          type="number"
          value={form.capacity ?? ''}
          onChange={e => setForm({ ...form, capacity: e.target.value === '' ? '' : parseInt(e.target.value, 10) })}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Driver Name"
          value={form.driver_name || ''}
          onChange={e => setForm({ ...form, driver_name: e.target.value })}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Driver Phone"
          value={form.driver_phone || ''}
          onChange={e => setForm({ ...form, driver_phone: e.target.value })}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          select
          label="Status"
          value={form.status || 'active'}
          onChange={e => setForm({ ...form, status: e.target.value })}
          fullWidth
          margin="normal"
        >
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="maintenance">Under Maintenance</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </TextField>
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