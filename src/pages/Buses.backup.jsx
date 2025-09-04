import React, { useEffect, useState } from "react";
import { 
  getBuses, 
  addBus, 
  updateBus, 
  deleteBus, 
  publishBus,
  getBusLocations,
  getBusLocationHistory
} from "../api/buses";
import { 
  Button, 
  Tabs, 
  Tab, 
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TablePagination,
  useTheme,
  alpha
} from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, subDays, isWithinInterval } from 'date-fns';
import { 
  DirectionsBus as BusIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationIcon,
  History as HistoryIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Publish as PublishIcon,
  Unpublished as UnpublishedIcon,
  Add as AddIcon
} from "@mui/icons-material";
import BusForm from "../components/BusForm";
import RealTimeMap from "../components/RealTimeMap";

// Tab panel component
const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`bus-tabpanel-${index}`}
    aria-labelledby={`bus-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

// Status chip component
const StatusChip = ({ status }) => {
  const statusMap = {
    active: { label: 'Active', color: 'success' },
    inactive: { label: 'Inactive', color: 'default' },
    maintenance: { label: 'Maintenance', color: 'warning' },
    on_route: { label: 'On Route', color: 'primary' },
  };
  
  const { label, color } = statusMap[status] || { label: status, color: 'default' };
  return <Chip label={label} color={color} size="small" />;
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function Buses() {
    // State for data and UI
  const theme = useTheme();
  const [buses, setBuses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [locationHistory, setLocationHistory] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState('');
  const [startDate, setStartDate] = useState(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState(new Date());
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState({
    buses: false,
    locations: false,
    history: false
  });
  const [mapKey, setMapKey] = useState(0); // Force remount of map component

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Fetch functions with error handling and loading states
  const fetchBuses = async () => {
    setLoading(prev => ({ ...prev, buses: true }));
    try {
      const response = await getBuses();
      setBuses(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching buses:', error);
      // Show error to user
    } finally {
      setLoading(prev => ({ ...prev, buses: false }));
    }
  };

  const fetchBusLocations = async () => {
    setLoading(prev => ({ ...prev, locations: true }));
    try {
      const response = await getBusLocations();
      setLocations(response.data || []);
    } catch (error) {
      console.error('Error fetching bus locations:', error);
      // Show error to user
    } finally {
      setLoading(prev => ({ ...prev, locations: false }));
    }
  };

  const fetchLocationHistory = async (busId = selectedBusId) => {
    if (!busId) return;
    
    setLoading(prev => ({ ...prev, history: true }));
    try {
      const params = {
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd')
      };
      const response = await getBusLocationHistory(busId, params);
      setLocationHistory(response.data || []);
    } catch (error) {
      console.error('Error fetching location history:', error);
      // Show error to user
    } finally {
      setLoading(prev => ({ ...prev, history: false }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (editing) {
        await updateBus(editing.id, form);
      } else {
        await addBus(form);
      }
      fetchBuses();
      handleClose();
      // Show success message
    } catch (error) {
      console.error('Error saving bus:', error);
      // Show error message to user
    }
  };

  const handleOpen = (bus = null) => {
    setEditing(bus);
    if (bus) {
      // Preserve all bus data when editing
      setForm({
        ...bus,
        // Ensure we have default values for all required fields
        bus_number: bus.bus_number || '',
        plate_number: bus.plate_number || '',
        capacity: bus.capacity || '',
        bus_type: bus.bus_type || 'standard',
        status: bus.status || 'inactive',
        is_active: bus.is_active !== undefined ? bus.is_active : true,
        features: Array.isArray(bus.features) ? [...bus.features] : []
      });
    } else {
      // Set default values for new bus
      setForm({
        bus_number: '',
        plate_number: '',
        capacity: '',
        bus_type: 'standard',
        status: 'inactive',
        is_active: true,
        features: []
      });
    }
    setOpen(true);
  };

  const handleClose = () => { 
    setOpen(false); 
    setEditing(null); 
    setForm({});
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this bus? This action cannot be undone.')) {
      try {
        await deleteBus(id);
        fetchBuses();
        // Show success message
      } catch (error) {
        console.error('Error deleting bus:', error);
        // Show error message to user
      }
    }
  };

  const handlePublish = async (bus) => {
    try {
      await publishBus(bus.id, !bus.published);
      fetchBuses();
      // Show success message
    } catch (error) {
      console.error('Error updating bus status:', error);
      // Show error message to user
    }
  };

  const handleRefresh = () => {
    if (tabValue === 0) fetchBuses();
    else if (tabValue === 1) fetchBusLocations();
    else if (tabValue === 2) fetchLocationHistory(selectedBusId);
  };

  const handleBusSelect = (busId) => {
    setSelectedBusId(busId);
    setTabValue(2); // Switch to history tab
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ width: '100%', p: 3 }}>
        <Card sx={{ mb: 3 }}>
          <CardHeader 
            title="Bus Management" 
            subheader={tabValue === 0 ? "Manage your bus fleet" : tabValue === 1 ? "View live bus locations" : "View location history"}
            action={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                  disabled={loading.buses || loading.locations || loading.history}
                >
                  Refresh
                </Button>
                {tabValue === 0 && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                  >
                    Add Bus
                  </Button>
                )}
              </Box>
            }
          />
          <Divider />
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="scrollable"
              scrollButtons="auto"
              aria-label="bus management tabs"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 64,
                  '&.Mui-selected': {
                    color: theme.palette.primary.main,
                    fontWeight: 600
                  }
                }
              }}
            >
              <Tab icon={<BusIcon />} label="Bus Fleet" {...a11yProps(0)} />
              <Tab icon={<LocationIcon />} label="Live Locations" {...a11yProps(1)} />
              <Tab 
                icon={<HistoryIcon />} 
                label="Location History" 
                {...a11yProps(2)} 
                disabled={!selectedBusId} 
              />
            </Tabs>
          </Box>

      {/* Buses Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ p: 3 }}>
          {loading.buses ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Bus Number</TableCell>
                      <TableCell>Plate Number</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Capacity</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Last Updated</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {buses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                          <Typography color="textSecondary">No buses found</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      buses
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((bus) => (
                          <TableRow 
                            key={bus.id} 
                            hover 
                            sx={{ '&:last-child td': { border: 0 } }}
                          >
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <BusIcon color="action" fontSize="small" />
                                <Typography variant="body2" fontWeight={500}>
                                  {bus.bus_number || 'N/A'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{bus.plate_number}</TableCell>
                            <TableCell>
                              <Chip 
                                label={bus.bus_type ? bus.bus_type.charAt(0).toUpperCase() + bus.bus_type.slice(1) : 'Standard'} 
                                size="small" 
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>{bus.capacity} seats</TableCell>
                            <TableCell>
                              <Chip 
                                label={bus.status ? bus.status.replace('_', ' ') : 'inactive'} 
                                color={
                                  bus.status === 'active' ? 'success' : 
                                  bus.status === 'on_route' ? 'info' :
                                  bus.status === 'maintenance' ? 'warning' : 
                                  'default'
                                }
                                size="small"
                                sx={{ textTransform: 'capitalize' }}
                              />
                            </TableCell>
                            <TableCell>
                              {bus.updated_at ? formatDate(bus.updated_at) : 'N/A'}
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                <Tooltip title="Edit">
                                  <IconButton 
                                    onClick={() => handleOpen(bus)} 
                                    size="small"
                                    color="primary"
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={bus.published ? 'Unpublish' : 'Publish'}>
                                  <IconButton 
                                    onClick={() => handlePublish(bus)} 
                                    size="small"
                                    color={bus.published ? 'primary' : 'default'}
                                  >
                                    {bus.published ? 
                                      <PublishIcon fontSize="small" /> : 
                                      <UnpublishedIcon fontSize="small" />
                                    }
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="View on map">
                                  <IconButton 
                                    onClick={() => {
                                      setSelectedBusId(bus.id);
                                      setTabValue(1);
                                    }}
                                    size="small"
                                    color="info"
                                  >
                                    <LocationIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="View history">
                                  <IconButton 
                                    onClick={() => {
                                      setSelectedBusId(bus.id);
                                      setTabValue(2);
                                    }}
                                    size="small"
                                    color="secondary"
                                  >
                                    <HistoryIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton 
                                    onClick={() => handleDelete(bus.id)} 
                                    size="small"
                                    color="error"
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={buses.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </Box>
            Add New Bus
          </Button>
        </Box>
        
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: '70vh' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Bus Number</TableCell>
                  <TableCell>Plate Number</TableCell>
                  <TableCell>Capacity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading.buses ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : buses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No buses found
                    </TableCell>
                  </TableRow>
                ) : (
                  buses.map((bus) => (
                    <TableRow key={bus.id} hover>
                      <TableCell>{bus.bus_number || 'N/A'}</TableCell>
                      <TableCell>{bus.plate_number}</TableCell>
                      <TableCell>{bus.capacity}</TableCell>
                      <TableCell>
                        <StatusChip status={bus.status || 'inactive'} />
                      </TableCell>
                      <TableCell>
                        {bus.updated_at ? format(new Date(bus.updated_at), 'PPpp') : 'N/A'}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleOpen(bus)} size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={bus.published ? 'Unpublish' : 'Publish'}>
                          <IconButton 
                            onClick={() => handlePublish(bus)}
                            color={bus.published ? 'primary' : 'default'}
                            size="small"
                          >
                            {bus.published ? <PublishIcon fontSize="small" /> : <UnpublishedIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            onClick={() => handleDelete(bus.id)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        
        <BusForm 
          open={open} 
          onClose={handleClose} 
          onSubmit={handleSubmit} 
          form={form} 
          setForm={setForm} 
          editing={editing} 
        />
      </TabPanel>

      {/* Live Locations Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="h2">Live Bus Locations</Typography>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={fetchBusLocations}
            disabled={loading.locations}
          >
            Refresh
          </Button>
        </Box>
        
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {locations.length} buses active
            {locations[0]?.timestamp && (
              <span> • Last updated: {format(new Date(locations[0].timestamp), 'PPpp')}</span>
            )}
          </Typography>
          
          <Box sx={{ 
            height: '60vh', 
            width: '100%',
            borderRadius: 1,
            overflow: 'hidden',
            position: 'relative'
          }}>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Select Bus</InputLabel>
                  <Select
                    value={selectedBusId}
                    onChange={(e) => setSelectedBusId(e.target.value)}
                    label="Select Bus"
                    size="small"
                  >
                    {buses.map((bus) => (
                      <MenuItem key={bus.id} value={bus.id}>
                        {bus.bus_number || 'Bus'} - {bus.plate_number}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                  maxDate={endDate || new Date()}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                  minDate={startDate}
                  maxDate={new Date()}
                />
              </Grid>
              <Grid item xs={12} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
                <Button 
                  variant="contained" 
                  onClick={() => fetchLocationHistory(selectedBusId)}
                  disabled={!selectedBusId || loading.history}
                  startIcon={<RefreshIcon />}
                  fullWidth
                  sx={{ height: '40px' }}
                >
                  {loading.history ? 'Loading...' : 'Load History'}
                </Button>
              </Grid>
            </Grid>
            
            {loading.history ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : locationHistory.length > 0 ? (
              <Paper sx={{ overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: 'calc(100vh - 320px)' }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Timestamp</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell align="right">Speed</TableCell>
                        <TableCell align="right">Heading</TableCell>
                        <TableCell align="right">Accuracy</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {locationHistory.map((location, index) => {
                        const bus = getBusById(selectedBusId);
                        const isRecent = isWithinInterval(new Date(location.timestamp), {
                          start: subDays(new Date(), 1),
                          end: new Date()
                        });
                        
                        return (
                          <TableRow 
                            key={index} 
                            hover
                            sx={{
                              '&:nth-of-type(odd)': {
                                backgroundColor: 'action.hover',
                              },
                              ...(isRecent && {
                                bgcolor: alpha(theme.palette.info.light, 0.08),
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.info.light, 0.12),
                                },
                              })
                            }}
                          >
                            <TableCell>
                              <Box>
                                <Typography variant="body2">
                                  {format(new Date(location.timestamp), 'PP')}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {format(new Date(location.timestamp), 'pp')}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2">
                                  {location.address || 'Location not available'}
                                </Typography>
                                {location.latitude && location.longitude && (
                                  <Typography variant="caption" color="primary">
                                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              {location.speed ? (
                                <Chip 
                                  label={`${(location.speed * 3.6).toFixed(1)} km/h`} 
                                  size="small"
                                  color={
                                    location.speed > 80 ? 'error' : 
                                    location.speed > 60 ? 'warning' : 'default'
                                  }
                                />
                              ) : 'N/A'}
                            </TableCell>
                            <TableCell align="right">
                              {location.heading ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                  <Box sx={{ 
                                    transform: `rotate(${location.heading}deg)`,
                                    mr: 1
                                  }}>
                                    <LocationIcon color="action" fontSize="small" />
                                  </Box>
                                  <Typography variant="body2">
                                    {location.heading}°
                                  </Typography>
                                </Box>
                              ) : 'N/A'}
                            </TableCell>
                            <TableCell align="right">
                              {location.accuracy ? (
                                <Chip 
                                  label={`${location.accuracy.toFixed(0)} m`} 
                                  size="small"
                                  variant="outlined"
                                  color={
                                    location.accuracy > 50 ? 'warning' : 
                                    location.accuracy > 100 ? 'error' : 'default'
                                  }
                                />
                              ) : 'N/A'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            ) : (
              <Box textAlign="center" p={3}>
                <Typography color="textSecondary">
                  {selectedBusId 
                    ? 'No location history found for the selected date range.'
                    : 'Please select a bus to view location history.'}
                </Typography>
              </Box>
            )}
          </Box>
        </TabPanel>

        <BusForm
          open={open}
          onClose={handleClose}
          onSubmit={handleSubmit}
          form={form}
          setForm={setForm}
          editing={editing}
        />
      </Card>
    </Box>
  </LocalizationProvider>
);
}