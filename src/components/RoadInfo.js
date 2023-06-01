import React, { useContext, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto'

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
  const chartData = {
    labels: userPositions.map((position) => new Date(position.time).toLocaleString()),
    datasets: [
      {
        label: 'Acceleration Average',
        data: userPositions.map((position) => position.acc_average),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
      // Add more datasets if needed
    ],
  };

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
    return <div className="progress-bar" style={{ '--width': 10 }} data-label="Loading..."></div>;
  }

  return (
    <div>
      <div class="pageTitle">
        <h1>Road info</h1>
      </div>
      <div className="mapContainer">
        <MapContainer center={[userPositions[0].start_pos_lat, userPositions[0].start_pos_lon]} zoom={13} style={{ height: "500px" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {userPositions.map((position, idx) => (
            <>
              <Polyline
                key={`polyline-${idx}`}
                pathOptions={{
                  color: (() => {
                    if (position.acc_average < 0.1) {
                      return 'black';
                    } else if (position.acc_average < 5) {
                      return 'green';
                    } else if (position.acc_average < 10) {
                      return 'yellow';
                    } else if (position.acc_average < 12) {
                      return 'orange';
                    } else {
                      return 'red';
                    }
                  })(),
                }}
                positions={[
                  [position.start_pos_lat, position.start_pos_lon],
                  [position.end_pos_lat, position.end_pos_lon]
                ]}
              >
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
      <div className="chartContainer">
        <Line data={chartData} options={{ maintainAspectRatio: false }} />
      </div>
    </div>
  );
}

export default RoadInfo;