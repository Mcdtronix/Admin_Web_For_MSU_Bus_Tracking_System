import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from "@mui/material";

export default function RouteForm({
  open,
  onClose,
  onSubmit,
  form,
  setForm,
  editing,
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{editing ? "Edit Route" : "Add Route"}</DialogTitle>
      <DialogContent>
        <TextField
          label="Route Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="From Station"
          value={form.from_station}
          onChange={(e) => setForm({ ...form, from_station: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="To Station"
          value={form.to_station}
          onChange={(e) => setForm({ ...form, to_station: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Price"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
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
