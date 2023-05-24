import React, { useContext, useEffect, useState } from 'react';
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

async function fetchRoadInfo() {
  try {
    const res = await fetch("http://localhost:3001/sections", {
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
    console.error("Error fetching last road info:", error);
    throw error;
  }
}

function RoadInfo() {
  const [userPositions, setUserPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoadInfo()
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
      <div class="pageTitle">
        <h1>Road info</h1>
      </div>
      <MapContainer center={[userPositions[0].start_pos_lat, userPositions[0].start_pos_lon]} zoom={13} style={{ height: "500px" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userPositions.map((position, idx) => (
          <>
            <Polyline key={`polyline-${idx}`} pathOptions={{ color: 'red' }} positions={[[position.start_pos_lat, position.start_pos_lon], [position.end_pos_lat, position.end_pos_lon]]}>
              <Popup>
              Start Position: <br />
              Lat: {position.start_pos_lat}, Long: {position.start_pos_lon} <br />
              Time: {new Date(position.time).toLocaleString()} <br />
              Duration: {position.duration} <br />
              Acceleration Average: {position.acc_average}, Max: {position.acc_max}, Min: {position.acc_min} <br />
            </Popup>
            </Polyline>
            <Marker key={`marker-start-${idx}`} position={[position.start_pos_lat, position.start_pos_lon]}>
              <Popup>
                Start Position: <br />
                Lat: {position.start_pos_lat}, Long: {position.start_pos_lon} <br />
                Time: {new Date(position.time).toLocaleString()} <br />
                Duration: {position.duration} <br />
                Acceleration Average: {position.acc_average}, Max: {position.acc_max}, Min: {position.acc_min} <br />
              </Popup>
            </Marker>
            <Marker key={`marker-end-${idx}`} position={[position.end_pos_lat, position.end_pos_lon]}>
              <Popup>
                End Position: <br />
                Lat: {position.end_pos_lat}, Long: {position.end_pos_lon} <br />
                Time: {new Date(position.timestamp).toLocaleString()} <br />
              </Popup>
            </Marker>
          </>
        ))}
      </MapContainer>
    </div>
  );
}

export default RoadInfo;