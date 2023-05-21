import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../userContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

async function fetchLastLocation() {
  try {
    const res = await fetch("http://localhost:3001/vehicleData/getLastLocation", {
      method: "GET",
      credentials: "include",
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    console.log("Response data:", data);

    if (data.latitude !== undefined && data.longitude !== undefined) {
      return [data.latitude, data.longitude];
    } else {
      throw new Error("Invalid response data");
    }
  } catch (error) {
    console.error("Error fetching last location:", error);
    throw error;
  }
}

function LastLocation() {
  const userContext = useContext(UserContext);
  const [userPosition, setUserPosition] = useState([51.505, -0.09]); // Default position
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLastLocation()
      .then(position => {
        setUserPosition(position);
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Last location</h1>
      <MapContainer center={userPosition} zoom={13} style={{ height: "500px"}}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={userPosition}>
          <Popup>
            Last Location: {userPosition[0]}, {userPosition[1]}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default LastLocation;
