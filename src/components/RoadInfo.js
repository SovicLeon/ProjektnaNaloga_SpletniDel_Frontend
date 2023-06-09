import React, { useContext, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Line } from 'react-chartjs-2';
import 'react-datepicker/dist/react-datepicker.css';
import { UserContext } from '../userContext';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

async function fetchRoadInfo() {
  try {
    const res = await fetch('http://localhost:3001/sections', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    console.log('Response data:', data);

    if (Array.isArray(data) && data.length > 0) {
      return data;
    } else {
      throw new Error('Invalid response data');
    }
  } catch (error) {
    console.error('Error fetching last road info:', error);
    throw error;
  }
}

function RoadInfo() {
  const userContext = useContext(UserContext);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [userPositions, setUserPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilteredData, setShowFilteredData] = useState(false); // New state

  useEffect(() => {
    // Function to fetch data and update positions
    const fetchData = async () => {
      try {
        const positions = await fetchRoadInfo();
        setUserPositions(positions);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    // Fetch data initially
    fetchData();

    // Set up the timer to fetch data every minute
    const timer = setInterval(fetchData, 60000);

    // Clean up the timer on component unmount
    return () => {
      clearInterval(timer);
    };
  }, []);

  if (loading) {
    return (
      <div
        className="progress-bar"
        style={{ '--width': 10 }}
        data-label="Loading..."
      ></div>
    );
  }

  var filteredPositions = userPositions.filter((position) => {
    const positionDate = new Date(position.time);
    return (
      (!fromDate || positionDate >= fromDate) &&
      (!toDate || positionDate <= toDate)
    );
  });

  if (showFilteredData && userContext.user) { // Show filtered data if the user is logged in and toggle is enabled
    filteredPositions = userPositions.filter((position) => {
      const positionDate = new Date(position.time);
      return (
        (!fromDate || positionDate >= fromDate) &&
        (!toDate || positionDate <= toDate) &&
        position.postedBy._id === userContext.user._id
      );
    });
  }

  const handleFromDateChange = (event) => {
    const selectedDate = new Date(event.target.value);
    setFromDate(selectedDate);
  };

  const handleToDateChange = (event) => {
    const selectedDate = new Date(event.target.value);
    setToDate(selectedDate);
  };

  const handleToggleChange = () => {
    setShowFilteredData((prevState) => !prevState); // Toggle the state
  };

  const accelerationChartData = {
    labels: filteredPositions.map((position) =>
      new Date(position.time).toLocaleString()
    ),
    datasets: [
      {
        label: 'Acceleration Average',
        data: filteredPositions.map((position) => position.acc_average),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const trafficChartData = {
    labels: filteredPositions.map((position) =>
      new Date(position.time).toLocaleString()
    ),
    datasets: [
      {
        label: 'Number Of Vehicles',
        data: filteredPositions.map((position) => position.sectionTraffic?.numOfVehicles || 0),
        backgroundColor: 'rgba(255, 99, 132, 0.2)', // Red background color
        borderColor: 'rgba(255, 99, 132, 1)', // Red border color
        borderWidth: 1,
      },
      {
        label: 'Average Speed',
        data: filteredPositions.map((position) => position.sectionTraffic?.speed || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.2)', // Blue background color
        borderColor: 'rgba(54, 162, 235, 1)', // Blue border color
        borderWidth: 1,
      },
      {
        label: 'Time Between Vehicles',
        data: filteredPositions.map((position) => position.sectionTraffic?.timeBetweenVehicles || 0),
        backgroundColor: 'rgba(255, 205, 86, 0.2)', // Yellow background color
        borderColor: 'rgba(255, 205, 86, 1)', // Yellow border color
        borderWidth: 1,
      },
    ],
  };  

  return (
    <div>
      <div className="pageTitle">
        <h1>Road info</h1>
      </div>
      <div className="datePicker">
        <label htmlFor="fromDate">From Date:</label>
        <input
          type="date"
          id="fromDate"
          name="fromDate"
          className="dateInput"
          onChange={handleFromDateChange}
        />
        <label htmlFor="toDate">To Date:</label>
        <input
          type="date"
          id="toDate"
          name="toDate"
          className="dateInput"
          onChange={handleToDateChange}
        />
        {userContext.user && ( // Render the toggle button only if the user is logged in
          <div className="toggleContainer">
            <label>
              Show Only My Data:
              <input
                type="checkbox"
                checked={showFilteredData}
                onChange={handleToggleChange}
              />
            </label>
          </div>
        )}
      </div>
      <div className="mapContainer">
        <MapContainer
          center={[
            userPositions[0].start_pos_lat,
            userPositions[0].start_pos_lon,
          ]}
          zoom={13}
          style={{ height: '500px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredPositions.map((position, idx) => (
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
                  [position.end_pos_lat, position.end_pos_lon],
                ]}
              >
                <Popup>
                  Start Position: <br />
                  Lat: {position.start_pos_lat}, Long: {position.start_pos_lon}{' '}
                  <br />
                  Time: {new Date(position.time).toLocaleString()} <br />
                  Duration: {position.duration} <br />
                  Acceleration Average: {position.acc_average}, Max:{' '}
                  {position.acc_max}, Min: {position.acc_min} <br />
                </Popup>
              </Polyline>
              <Marker
                key={`marker-start-${idx}`}
                position={[position.start_pos_lat, position.start_pos_lon]}
              >
                <Popup>
                  Start Position: <br />
                  Lat: {position.start_pos_lat}, Long: {position.start_pos_lon}{' '}
                  <br />
                  Time: {new Date(position.time).toLocaleString()} <br />
                  Duration: {position.duration} <br />
                  Acceleration Average: {position.acc_average}, Max:{' '}
                  {position.acc_max}, Min: {position.acc_min} <br />
                </Popup>
              </Marker>
              <Marker
                key={`marker-end-${idx}`}
                position={[position.end_pos_lat, position.end_pos_lon]}
              >
                <Popup>
                  End Position: <br />
                  Lat: {position.end_pos_lat}, Long: {position.end_pos_lon}{' '}
                  <br />
                  Time: {new Date(position.timestamp).toLocaleString()} <br />
                </Popup>
              </Marker>
            </>
          ))}
        </MapContainer>
      </div>
      <div className="chartContainer">
        <Line data={accelerationChartData} options={{ maintainAspectRatio: false }} />
      </div>
      <div className="chartContainer">
        <Line data={trafficChartData} options={{ maintainAspectRatio: false }} />
      </div>
    </div>
  );
}

export default RoadInfo;
