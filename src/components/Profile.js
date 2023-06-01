import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../userContext';
import { Navigate, Link } from 'react-router-dom';
import axios from 'axios';

function Profile(){
    const userContext = useContext(UserContext); 
    const [profile, setProfile] = useState({});
    const [roadInfo, setRoadInfo] = useState([]);
    const [totalDuration, setTotalDuration] = useState(0);
    const [totalDistance, setTotalDistance] = useState(0);

    useEffect(function(){
        const getProfile = async function(){
            const res = await fetch("http://localhost:3001/users/profile", {credentials: "include"});
            const data = await res.json();
            setProfile(data);
        }
        getProfile();
    }, []);

    useEffect(function(){
        const fetchRoadInfo = async function(){
            try {
                const res = await axios.get("http://localhost:3001/sections", {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = res.data;
                //console.log("Response data:", data);

                if (Array.isArray(data) && data.length > 0) {
                    const filteredData = data.filter(item => item.postedBy.username === userContext.user.username);
                    console.log("Response data:", filteredData);
                    setRoadInfo(filteredData);

                    // Calculate total duration
                    const durationSum = filteredData.reduce((sum, item) => sum + item.duration, 0);
                    setTotalDuration(durationSum);

                    // Calculate total distance
                    const totalDistance = calculateTotalDistance(filteredData);
                    setTotalDistance(totalDistance);
                } else {
                    throw new Error("Invalid response data");
                }
            } catch (error) {
                console.error("Error fetching last road info:", error);
                throw error;
            }
        }
        fetchRoadInfo();
    }, [userContext.user.username]);

    // Calculate total duration in minutes (rounded to 2 decimal places)
    const totalDurationInMinutes = (totalDuration / 60).toFixed(2);

    // Calculate total distance using Haversine formula
    const calculateTotalDistance = (data) => {
        let totalDistance = 0;
        for (let i = 0; i < data.length; i++) {
            const { start_pos_lat, start_pos_lon, end_pos_lat, end_pos_lon } = data[i];
            totalDistance += haversineDistance(start_pos_lat, start_pos_lon, end_pos_lat, end_pos_lon);
        }
        return totalDistance.toFixed(2);
    };

    // Calculate distance between two points using Haversine formula
    const haversineDistance = (lat1, lon1, lat2, lon2) => {
        const toRadians = (value) => (value * Math.PI) / 180;
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
    };

    return (
        <>
            {!userContext.user ? <Navigate replace to="/login" /> : ""}
            <div className="pageTitle">
                <h1>User Profile</h1>
            </div>
            <div id="userProfile">
                <p>Username <br/>{profile.username}</p>
                <hr/>
                <p>Email <br/>{profile.email}</p>
            </div>
            <div className="pageTitle">
                <p>Total duration: {totalDurationInMinutes} minutes</p>
            </div>
            <div className="pageTitle">
                <p>Total distance: {totalDistance} kilometers</p>
            </div>
            <div className="pageTitle">
                <Link to="/roadinfo">
                    Go to Road Info
                </Link>
            </div>
            <div className="pageTitle">
                <Link to="/lastlocation">
                    Go to Last Location
                </Link>
            </div>
        </>
    );
}

export default Profile;
