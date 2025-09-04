import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Paper,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Button
} from '@mui/material';
import { 
  GoogleMap, 
  Marker, 
  useJsApiLoader,
  InfoWindow
} from '@react-google-maps/api';
import { getBusLocations } from '../api/busLocations';
import client from '../api/client';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import RefreshIcon from '@mui/icons-material/Refresh';
import SignalWifiOffIcon from '@mui/icons-material/SignalWifiOff';
import SignalWifiStatusbarConnectedNoInternet4Icon from '@mui/icons-material/SignalWifiStatusbarConnectedNoInternet4';

// Bus icon path (SVG path data)
const busIconPath = 'M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z';

// Function to get bus icon with proper Google Maps API reference
const getBusIcon = (google) => {
  if (!google || !google.maps) return null;
  
  return {
    path: busIconPath,
    fillColor: '#1976d2',
    fillOpacity: 1,
    strokeWeight: 0,
    rotation: 0,
    scale: 1,
    anchor: new google.maps.Point(12, 12),
    labelOrigin: new google.maps.Point(12, 12)
  };
};

// Default center (Gweru, Zimbabwe)
const defaultCenter = { lat: -19.455, lng: 29.817 };
const containerStyle = { 
  width: '100%', 
  height: '70vh',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const BusIcon = () => (
  <div style={{ color: '#1976d2', transform: 'rotate(90deg)' }}>
    <DirectionsBusIcon fontSize="large" />
  </div>
);

// Maximum number of retry attempts for failed API calls
const MAX_RETRIES = 3;
// Delay between retry attempts in milliseconds
const RETRY_DELAY = 3000;
// Time between location updates in milliseconds
const UPDATE_INTERVAL = 10000;

function RealTimeMap() {
  const [busLocations, setBusLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'online', 'offline', 'error', 'connecting'
  const [retryCount, setRetryCount] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  
  const updateInterval = useRef(null);
  const isMounted = useRef(true);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    console.error('Google Maps API key is missing. Please set VITE_GOOGLE_MAPS_API_KEY in your environment variables.');
  }

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey || 'dummy_key_to_trigger_error',
    libraries: ['places'],
    id: 'google-map-script'
  });

  const showSnackbar = (message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const checkConnection = async () => {
    try {
      await client.get('/health/');
      if (isMounted.current) {
        setConnectionStatus('online');
        setRetryCount(0);
      }
      return true;
    } catch (err) {
      console.error('Connection check failed:', err);
      if (isMounted.current) {
        setConnectionStatus('offline');
      }
      return false;
    }
  };

  const fetchBusLocations = useCallback(async (retryAttempt = 0) => {
    if (!isMounted.current) return;

    try {
      setLoading(true);
      
      // Check connection first
      const isConnected = await checkConnection();
      if (!isConnected) {
        throw new Error('No connection to server');
      }

      const response = await getBusLocations();
      const locations = response.data;
      
      if (locations && Array.isArray(locations) && locations.length > 0) {
        // Update map center to first bus location if no bus is selected
        if (!selectedBus) {
          const firstBus = locations[0];
          if (firstBus.latitude && firstBus.longitude) {
            setMapCenter({
              lat: parseFloat(firstBus.latitude),
              lng: parseFloat(firstBus.longitude)
            });
          }
        }
        
        // Filter out any invalid locations and transform data
        const validLocations = locations
          .filter(loc => loc.latitude && loc.longitude && 
                   !isNaN(parseFloat(loc.latitude)) && 
                   !isNaN(parseFloat(loc.longitude)))
          .map(loc => ({
            ...loc,
            latitude: parseFloat(loc.latitude),
            longitude: parseFloat(loc.longitude),
            speed: loc.speed ? parseFloat(loc.speed) : 0,
            last_updated: loc.timestamp || new Date().toISOString()
          }));
        
        if (isMounted.current) {
          setBusLocations(validLocations);
          setLastUpdated(new Date());
          setConnectionStatus('online');
          setRetryCount(0);
        }
      } else {
        if (isMounted.current) {
          setBusLocations([]);
          setConnectionStatus('online');
        }
      }
      
      if (isMounted.current) {
        setError(null);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching bus locations:', err);
      
      if (isMounted.current) {
        const errorMessage = err.response?.data?.message || 'Failed to load bus locations';
        setError(errorMessage);
        setConnectionStatus('error');
        
        // Implement exponential backoff for retries
        if (retryAttempt < MAX_RETRIES) {
          const nextRetry = Math.min(RETRY_DELAY * Math.pow(2, retryAttempt), 30000);
          showSnackbar(`${errorMessage}. Retrying in ${nextRetry/1000} seconds...`, 'warning');
          
          setTimeout(() => {
            if (isMounted.current) {
              fetchBusLocations(retryAttempt + 1);
            }
          }, nextRetry);
        } else {
          showSnackbar('Failed to connect to server. Please check your connection.', 'error');
          setLoading(false);
        }
      }
    }
  }, [selectedBus]);

  // Set up polling for location updates
  useEffect(() => {
    if (isLoaded) {
      // Initial fetch
      fetchBusLocations();
      
      // Set up interval for polling
      updateInterval.current = setInterval(() => {
        if (isMounted.current && connectionStatus !== 'offline') {
          fetchBusLocations();
        }
      }, UPDATE_INTERVAL);
      
      // Set up online/offline event listeners
      const handleOnline = () => {
        if (isMounted.current) {
          setConnectionStatus('online');
          fetchBusLocations();
        }
      };
      
      const handleOffline = () => {
        if (isMounted.current) {
          setConnectionStatus('offline');
          showSnackbar('You are currently offline. Reconnecting...', 'warning');
        }
      };
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      // Cleanup function
      return () => {
        isMounted.current = false;
        if (updateInterval.current) {
          clearInterval(updateInterval.current);
        }
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [isLoaded, fetchBusLocations, connectionStatus]);

  const handleRefresh = () => {
    if (connectionStatus === 'offline') {
      showSnackbar('Cannot refresh while offline', 'warning');
      return;
    }
    
    setLoading(true);
    setError(null);
    setRetryCount(0);
    fetchBusLocations();
    showSnackbar('Refreshing bus locations...', 'info');
  };

  // Connection status indicator
  const ConnectionStatus = () => (
    <Box sx={{
      position: 'absolute',
      top: 10,
      left: 10,
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      backgroundColor: 'white',
      padding: '4px 8px',
      borderRadius: '4px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    }}>
      {connectionStatus === 'online' ? (
        <>
          <Box sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: '#4caf50',
            mr: 0.5
          }} />
          <Typography variant="caption" color="textSecondary">
            Live
          </Typography>
        </>
      ) : (
        <>
          <CircularProgress size={12} />
          <Typography variant="caption" color="textSecondary">
            Connecting...
          </Typography>
        </>
      )}
    </Box>
  );

  if (loadError || !apiKey) {
    return (
      <Paper elevation={3} sx={{ p: 3, textAlign: 'center', maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Typography variant="h6" color="error" gutterBottom>
          Google Maps Error
        </Typography>
        <Typography variant="body1" paragraph>
          {!apiKey 
            ? 'Google Maps API key is missing.'
            : 'Failed to load Google Maps.'
          }
        </Typography>
        
        <Box sx={{ 
          backgroundColor: '#f5f5f5', 
          p: 2, 
          borderRadius: 1, 
          textAlign: 'left',
          mb: 3,
          fontFamily: 'monospace',
          fontSize: '0.8rem',
          overflowX: 'auto'
        }}>
          <div># Create a .env file in the web directory with:</div>
          <div>VITE_GOOGLE_MAPS_API_KEY=your_api_key_here</div>
          <div>VITE_API_BASE_URL=your_api_base_url</div>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Make sure you have a valid Google Maps API key with the Maps JavaScript API enabled.
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => window.location.reload()}
          sx={{ mr: 2 }}
        >
          Retry
        </Button>
        
        <Button 
          variant="outlined" 
          color="primary" 
          href="https://developers.google.com/maps/documentation/javascript/get-api-key"
          target="_blank"
          rel="noopener noreferrer"
        >
          Get API Key
        </Button>
      </Paper>
    );
  }

  if (!isLoaded) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <ConnectionStatus />
      <Box sx={{ 
        position: 'absolute', 
        top: 10, 
        right: 10, 
        zIndex: 1,
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        backgroundColor: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}>
        {loading ? (
          <CircularProgress size={24} />
        ) : (
          <Tooltip title="Refresh locations">
            <IconButton onClick={handleRefresh} size="small">
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {lastUpdated && (
          <Typography variant="caption" color="textSecondary">
            Updated: {new Date(lastUpdated).toLocaleTimeString()}
          </Typography>
        )}
      </Box>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={14}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        }}
      >
        {busLocations.map((bus) => {
          const position = {
            lat: parseFloat(bus.latitude),
            lng: parseFloat(bus.longitude)
          };
          
          if (isNaN(position.lat) || isNaN(position.lng)) {
            return null; // Skip invalid positions
          }
          
          return (
            <Marker
              key={bus.id}
              position={position}
              icon={{
                ...getBusIcon(window.google),
                label: {
                  text: bus.bus_number || 'BUS',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  className: 'bus-label'
                }
              }}
              onClick={() => setSelectedBus(bus)}
            />
          );
        })}

        {selectedBus && (
          <InfoWindow
            position={{
              lat: parseFloat(selectedBus.latitude),
              lng: parseFloat(selectedBus.longitude)
            }}
            onCloseClick={() => setSelectedBus(null)}
          >
            <Box sx={{ p: 1, minWidth: 200 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Bus: {selectedBus.bus_number || 'N/A'}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Status:</Typography>
                  <Typography variant="body2">
                    {selectedBus.status || 'In Transit'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Speed:</Typography>
                  <Typography variant="body2">
                    {selectedBus.speed ? `${selectedBus.speed} km/h` : 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Last Update:</Typography>
                  <Typography variant="body2">
                    {selectedBus.timestamp ? new Date(selectedBus.timestamp).toLocaleTimeString() : 'N/A'}
                  </Typography>
              </Box>
            </Box>
          </Box>
        </InfoWindow>
      )}
    </GoogleMap>
    
    <Snackbar
      open={snackbarOpen}
      autoHideDuration={6000}
      onClose={handleSnackbarClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert 
        onClose={handleSnackbarClose} 
        severity={snackbarSeverity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {snackbarMessage}
      </Alert>
    </Snackbar>
  </Box>
  );
}

export default RealTimeMap;
