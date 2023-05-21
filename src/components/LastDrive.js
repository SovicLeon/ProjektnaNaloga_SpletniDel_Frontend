import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../userContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

async function fetchLastDrive() {
  try {
    const res = await fetch("http://localhost:3001/vehicleData/getLastDrive", {
      method: "GET",
      credentials: "include",
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    console.log("Response data:", data);

    if (Array.isArray(data) && data.length > 0) {
      return data;
    } else {
      throw new Error("Invalid response data");
    }
  } catch (error) {
    console.error("Error fetching last Drive:", error);
    throw error;
  }
}

function LastDrive() {
  const userContext = useContext(UserContext);
  const [userPositions, setUserPositions] = useState([]); // Changed default position
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLastDrive()
      .then(positions => {
        setUserPositions(positions);
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
      <h1>Last drive</h1>
      <MapContainer center={[userPositions[0].latitude, userPositions[0].longitude]} zoom={13} style={{ height: "500px" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline pathOptions={{ color: 'red' }} positions={userPositions.map(pos => [pos.latitude, pos.longitude])} />
        {userPositions.map((position, idx) => (
          <Marker key={idx} position={[position.latitude, position.longitude]}>
            <Popup>
              Lat: {position.latitude}, Long: {position.longitude} <br />
              Gyro X: {position.gyro_x}, Gyro Y: {position.gyro_y}, Gyro Z: {position.gyro_z} <br />
              Acceleration: {position.acc_acceleration} <br />
              Acc X: {position.acc_x}, Acc Y: {position.acc_y}, Acc Z: {position.acc_z} <br />
              Timestamp: {new Date(position.timestamp).toLocaleString()}
            </Popup>

          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default LastDrive;
