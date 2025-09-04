import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import { getBookings, updateBooking, deleteBooking } from '../api/bookings';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ status: 'pending', number_of_passengers: 1, phone_number: '' });

  const fetchAll = async () => {
    const res = await getBookings();
    const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
    setBookings(data);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleOpen = (row) => {
    setEditing(row);
    setForm({
      status: row.status || 'pending',
      number_of_passengers: row.number_of_passengers || 1,
      phone_number: row.phone_number || '',
    });
    setOpen(true);
  };

  const handleClose = () => { setOpen(false); setEditing(null); };

  const handleSubmit = async () => {
    if (!editing) return;
    await updateBooking(editing.id, form);
    await fetchAll();
    handleClose();
  };

  const handleDelete = async (id) => {
    await deleteBooking(id);
    await fetchAll();
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <Box p={{ xs: 2, md: 3 }} sx={{ minHeight: 'calc(100vh - 64px)', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      <Typography variant="h5" gutterBottom>
        Bookings Management
      </Typography>

      <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
        <Box component="thead" sx={{ bgcolor: 'grey.100' }}>
          <Box component="tr">
            <Box component="th" sx={{ textAlign: 'left', p: 1 }}>Booking ID</Box>
            <Box component="th" sx={{ textAlign: 'left', p: 1 }}>User</Box>
            <Box component="th" sx={{ textAlign: 'left', p: 1 }}>Route</Box>
            <Box component="th" sx={{ textAlign: 'left', p: 1 }}>Bus</Box>
            <Box component="th" sx={{ textAlign: 'left', p: 1 }}>Date</Box>
            <Box component="th" sx={{ textAlign: 'left', p: 1 }}>Time</Box>
            <Box component="th" sx={{ textAlign: 'left', p: 1 }}>Passengers</Box>
            <Box component="th" sx={{ textAlign: 'left', p: 1 }}>Status</Box>
            <Box component="th" sx={{ textAlign: 'left', p: 1 }}>Actions</Box>
          </Box>
        </Box>
        <Box component="tbody">
          {bookings.map((b) => (
            <Box component="tr" key={b.id} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box component="td" sx={{ p: 1 }}>{b.booking_id}</Box>
              <Box component="td" sx={{ p: 1 }}>{b.user_name || b.user}</Box>
              <Box component="td" sx={{ p: 1 }}>{b.route_details?.name || b.route}</Box>
              <Box component="td" sx={{ p: 1 }}>{b.bus_details?.bus_number || b.bus}</Box>
              <Box component="td" sx={{ p: 1 }}>{b.departure_date}</Box>
              <Box component="td" sx={{ p: 1 }}>{b.departure_time}</Box>
              <Box component="td" sx={{ p: 1 }}>{b.number_of_passengers}</Box>
              <Box component="td" sx={{ p: 1 }}>{b.status}</Box>
              <Box component="td" sx={{ p: 1 }}>
                <Button size="small" onClick={() => handleOpen(b)} sx={{ mr: 1 }}>Edit</Button>
                <Button size="small" color="error" onClick={() => handleDelete(b.id)}>Delete</Button>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit Booking</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
            <TextField select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {statusOptions.map((s) => (
                <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
              ))}
            </TextField>
            <TextField label="Passengers" type="number" value={form.number_of_passengers} onChange={(e) => setForm({ ...form, number_of_passengers: parseInt(e.target.value || '1', 10) })} />
            <TextField label="Phone" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
