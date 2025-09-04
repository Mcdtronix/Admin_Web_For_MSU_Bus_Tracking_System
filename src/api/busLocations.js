import client from './client';

export const getBusLocations = () => {
  return client.get('/buses/locations/');
};

export const updateBusLocation = (data) => {
  return client.post('/location/update/', data);
};

export const getBusLocationHistory = (busId) => {
  return client.get(`/buses/${busId}/track/`);
};
