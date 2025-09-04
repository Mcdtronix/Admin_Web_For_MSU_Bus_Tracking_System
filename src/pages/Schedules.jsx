import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem } from '@mui/material';
import { getSchedules, addSchedule, updateSchedule, deleteSchedule } from '../api/schedules';
import { getBuses } from '../api/buses';
import { getRoutes } from '../api/routes';

export default function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ bus: '', route: '', departure_time: '', days_of_week: 'monday', is_active: true });

  const fetchAll = async () => {
    const [schRes, busRes, routeRes] = await Promise.all([
      getSchedules(),
      getBuses(),
      getRoutes(),
    ]);
    setSchedules(Array.isArray(schRes.data) ? schRes.data : (schRes.data.results || []));
    setBuses(Array.isArray(busRes.data) ? busRes.data : (busRes.data.results || []));
    setRoutes(Array.isArray(routeRes.data) ? routeRes.data : (routeRes.data.results || []));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleOpen = (row = null) => {
    setEditing(row);
    setForm(
      row ? {
        bus: row.bus,
        route: row.route,
        departure_time: row.departure_time,
        days_of_week: row.days_of_week,
        is_active: row.is_active,
      } : { bus: '', route: '', departure_time: '', days_of_week: 'monday', is_active: true }
    );
    setOpen(true);
  };

  const handleClose = () => { setOpen(false); setEditing(null); };

  const handleSubmit = async () => {
    const payload = { ...form };
    if (editing) {
      await updateSchedule(editing.id, payload);
    } else {
      await addSchedule(payload);
    }
    await fetchAll();
    handleClose();
  };

  const handleDelete = async (id) => {
    await deleteSchedule(id);
    await fetchAll();
  };

  const dayOptions = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ];

  return (
    <Box p={{ xs: 2, md: 3 }} sx={{ minHeight: 'calc(100vh - 64px)', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      <Typography variant="h5" gutterBottom>
        Schedules Management
      </Typography>
      <Button variant="contained" onClick={() => handleOpen()} sx={{ mb: 2 }}>
        Add Schedule
      </Button>

      <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
        <Box component="thead" sx={{ bgcolor: 'grey.100' }}>
          <Box component="tr">
            <Box component="th" sx={{ textAlign: 'left', p: 1 }}>Bus</Box>
            <Box component="th" sx={{ textAlign: 'left', p: 1 }}>Route</Box>
            <Box component="th" sx={{ textAlign: 'left', p: 1 }}>Day</Box>
            <Box component="th" sx={{ textAlign: 'left', p: 1 }}>Departure</Box>
            <Box component="th" sx={{ textAlign: 'left', p: 1 }}>Active</Box>
            <Box component="th" sx={{ textAlign: 'left', p: 1 }}>Actions</Box>
          </Box>
        </Box>
        <Box component="tbody">
          {schedules.map((s) => (
            <Box component="tr" key={s.id} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box component="td" sx={{ p: 1 }}>{s.bus_number || s.bus}</Box>
              <Box component="td" sx={{ p: 1 }}>{s.route_name || s.route}</Box>
              <Box component="td" sx={{ p: 1 }}>{s.days_of_week}</Box>
              <Box component="td" sx={{ p: 1 }}>{s.departure_time}</Box>
              <Box component="td" sx={{ p: 1 }}>{s.is_active ? 'Yes' : 'No'}</Box>
              <Box component="td" sx={{ p: 1 }}>
                <Button size="small" onClick={() => handleOpen(s)} sx={{ mr: 1 }}>Edit</Button>
                <Button size="small" color="error" onClick={() => handleDelete(s.id)}>Delete</Button>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit Schedule' : 'Add Schedule'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
            <TextField select label="Bus" value={form.bus} onChange={(e) => setForm({ ...form, bus: e.target.value })}>
              {buses.map((b) => (
                <MenuItem key={b.id} value={b.id}>{b.bus_number}</MenuItem>
              ))}
            </TextField>
            <TextField select label="Route" value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })}>
              {routes.map((r) => (
                <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
              ))}
            </TextField>
            <TextField select label="Day" value={form.days_of_week} onChange={(e) => setForm({ ...form, days_of_week: e.target.value })}>
              {dayOptions.map((d) => (
                <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>
              ))}
            </TextField>
            <TextField label="Departure Time" type="time" value={form.departure_time} onChange={(e) => setForm({ ...form, departure_time: e.target.value })} inputProps={{ step: 300 }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>{editing ? 'Save' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
