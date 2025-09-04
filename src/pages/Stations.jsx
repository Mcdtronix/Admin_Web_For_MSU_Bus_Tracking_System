import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Switch, FormControlLabel } from '@mui/material';
import { getStations, addStation, updateStation, deleteStation } from '../api/stations';

export default function Stations() {
  const [stations, setStations] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', latitude: '', longitude: '', is_active: true });

  const fetchStations = async () => {
    const res = await getStations();
    // handle both plain array or paginated {results}
    const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
    setStations(data);
  };

  useEffect(() => { fetchStations(); }, []);

  const handleOpen = (station = null) => {
    setEditing(station);
    setForm(
      station
        ? { name: station.name || '', latitude: station.latitude || '', longitude: station.longitude || '', is_active: station.is_active !== false }
        : { name: '', latitude: '', longitude: '', is_active: true }
    );
    setOpen(true);
  };

  const handleClose = () => { setOpen(false); setEditing(null); };

  const handleSubmit = async () => {
    const payload = { ...form };
    // ensure numeric types are sent for lat/lng if backend expects decimals
    if (payload.latitude !== '' && typeof payload.latitude === 'string') payload.latitude = payload.latitude.trim();
    if (payload.longitude !== '' && typeof payload.longitude === 'string') payload.longitude = payload.longitude.trim();

    if (editing) {
      await updateStation(editing.id, payload);
    } else {
      await addStation(payload);
    }
    await fetchStations();
    handleClose();
  };

  const handleDelete = async (id) => {
    await deleteStation(id);
    await fetchStations();
  };

  return (
    <Box p={{ xs: 2, md: 3 }} sx={{ minHeight: 'calc(100vh - 64px)', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      <Typography variant="h5" gutterBottom>
        Stations Management
      </Typography>
      <Button variant="contained" onClick={() => handleOpen()} sx={{ mb: 2 }}>
        Add Station
      </Button>

      <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
        <Box component="thead" sx={{ bgcolor: 'grey.100' }}>
          <Box component="tr">
            <Box component="th" sx={{ textAlign: 'left', p: 1 }}>Name</Box>
            <Box component="th" sx={{ textAlign: 'left', p: 1 }}>Latitude</Box>
            <Box component="th" sx={{ textAlign: 'left', p: 1 }}>Longitude</Box>
            <Box component="th" sx={{ textAlign: 'left', p: 1 }}>Active</Box>
            <Box component="th" sx={{ textAlign: 'left', p: 1 }}>Actions</Box>
          </Box>
        </Box>
        <Box component="tbody">
          {stations.map((s) => (
            <Box component="tr" key={s.id} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box component="td" sx={{ p: 1 }}>{s.name}</Box>
              <Box component="td" sx={{ p: 1 }}>{s.latitude}</Box>
              <Box component="td" sx={{ p: 1 }}>{s.longitude}</Box>
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
        <DialogTitle>{editing ? 'Edit Station' : 'Add Station'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
            <TextField label="Name" fullWidth value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField label="Latitude" fullWidth value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
            <TextField label="Longitude" fullWidth value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
            <FormControlLabel control={<Switch checked={!!form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />} label="Active" />
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
