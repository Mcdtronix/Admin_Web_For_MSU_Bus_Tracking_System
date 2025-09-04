import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Typography,
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { getSchedules, createSchedule, updateSchedule, deleteSchedule } from '../api/schedules';

export default function BusSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    bus: '',
    route: '',
    departure_time: '',
    arrival_time: '',
    days: [],
    status: 'active'
  });

  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await getSchedules();
      setSchedules(response.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleOpen = (schedule = null) => {
    if (schedule) {
      setEditing(schedule.id);
      setForm({
        ...schedule,
        days: Array.isArray(schedule.days) ? schedule.days : []
      });
    } else {
      setEditing(null);
      setForm({
        bus: '',
        route: '',
        departure_time: '',
        arrival_time: '',
        days: [],
        status: 'active'
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateSchedule(editing, form);
      } else {
        await createSchedule(form);
      }
      fetchSchedules();
      handleClose();
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await deleteSchedule(id);
        fetchSchedules();
      } catch (error) {
        console.error('Error deleting schedule:', error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Bus Schedules
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Schedule
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Bus</TableCell>
              <TableCell>Route</TableCell>
              <TableCell>Departure</TableCell>
              <TableCell>Arrival</TableCell>
              <TableCell>Days</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : schedules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No schedules found
                </TableCell>
              </TableRow>
            ) : (
              schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>{schedule.bus?.name || 'N/A'}</TableCell>
                  <TableCell>{schedule.route?.name || 'N/A'}</TableCell>
                  <TableCell>{schedule.departure_time}</TableCell>
                  <TableCell>{schedule.arrival_time}</TableCell>
                  <TableCell>
                    {Array.isArray(schedule.days) ? schedule.days.join(', ') : ''}
                  </TableCell>
                  <TableCell>
                    <Box
                      component="span"
                      sx={{
                        p: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: schedule.status === 'active' ? '#e6f7e6' : '#ffe6e6',
                        color: schedule.status === 'active' ? '#2e7d32' : '#d32f2f',
                        textTransform: 'capitalize'
                      }}
                    >
                      {schedule.status}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpen(schedule)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(schedule.id)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editing ? 'Edit Schedule' : 'Add New Schedule'}</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="normal">
              <InputLabel>Bus</InputLabel>
              <Select
                value={form.bus}
                onChange={(e) => setForm({ ...form, bus: e.target.value })}
                required
              >
                {/* Populate with actual buses */}
                <MenuItem value="">Select Bus</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Route</InputLabel>
              <Select
                value={form.route}
                onChange={(e) => setForm({ ...form, route: e.target.value })}
                required
              >
                {/* Populate with actual routes */}
                <MenuItem value="">Select Route</MenuItem>
              </Select>
            </FormControl>

            <TextField
              margin="normal"
              fullWidth
              label="Departure Time"
              type="time"
              value={form.departure_time}
              onChange={(e) => setForm({ ...form, departure_time: e.target.value })}
              InputLabelProps={{
                shrink: true,
              }}
              required
            />

            <TextField
              margin="normal"
              fullWidth
              label="Arrival Time"
              type="time"
              value={form.arrival_time}
              onChange={(e) => setForm({ ...form, arrival_time: e.target.value })}
              InputLabelProps={{
                shrink: true,
              }}
              required
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Days of Operation</InputLabel>
              <Select
                multiple
                value={form.days}
                onChange={(e) => setForm({ ...form, days: e.target.value })}
                renderValue={(selected) => selected.join(', ')}
                required
              >
                {daysOfWeek.map((day) => (
                  <MenuItem key={day} value={day}>
                    {day}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                required
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editing ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
