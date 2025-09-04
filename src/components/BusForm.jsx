import React from "react";
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from "@mui/material";

export default function BusForm({ open, onClose, onSubmit, form, setForm, editing }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{editing ? "Edit Bus" : "Add Bus"}</DialogTitle>
      <DialogContent>
        <TextField
          label="Plate Number"
          value={form.plate_number}
          onChange={e => setForm({ ...form, plate_number: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Capacity"
          value={form.capacity}
          onChange={e => setForm({ ...form, capacity: e.target.value })}
          fullWidth
          margin="normal"
        />
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