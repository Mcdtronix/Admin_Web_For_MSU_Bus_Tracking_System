import React, { useEffect, useState } from "react";
import { getBuses, addBus, updateBus, deleteBus, publishBus } from "../api/buses";
import { 
  Button, 
  Tabs, 
  Tab, 
  Box,
  Typography
} from "@mui/material";
import BusTable from "../components/BusTable";
import BusForm from "../components/BusForm";
import RealTimeMap from "../components/RealTimeMap";

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function Buses() {
  const [buses, setBuses] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ plate_number: "", capacity: "" });
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // In Buses.jsx
const fetchBuses = () => getBuses().then(res => setBuses(res.data.results));

  useEffect(() => { fetchBuses(); }, []);

  const handleOpen = (bus = null) => {
    setEditing(bus);
    setForm(bus ? { plate_number: bus.plate_number, capacity: bus.capacity } : { plate_number: "", capacity: "" });
    setOpen(true);
  };

  const handleClose = () => { setOpen(false); setEditing(null); };

  const handleSubmit = async () => {
    if (editing) {
      await updateBus(editing.id, form);
    } else {
      await addBus(form);
    }
    fetchBuses();
    handleClose();
  };

  const handleDelete = async (id) => {
    await deleteBus(id);
    fetchBuses();
  };

  const handlePublish = async (bus) => {
    await publishBus(bus.id, !bus.published);
    fetchBuses();
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="bus management tabs"
          variant="fullWidth"
        >
          <Tab label="List View" {...a11yProps(0)} />
          <Tab label="Map View" {...a11yProps(1)} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            onClick={() => handleOpen()}
            sx={{ mb: 2 }}
          >
            Add Bus
          </Button>
        </Box>
        <BusTable 
          buses={Array.isArray(buses) ? buses : []} 
          onEdit={handleOpen} 
          onDelete={handleDelete} 
          onPublish={handlePublish} 
        />
        <BusForm 
          open={open} 
          onClose={handleClose} 
          onSubmit={handleSubmit} 
          form={form} 
          setForm={setForm} 
          editing={editing} 
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ 
          height: 'calc(100vh - 200px)', 
          width: '100%',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: 3
        }}>
          <RealTimeMap />
        </Box>
      </TabPanel>
    </Box>
  );
}