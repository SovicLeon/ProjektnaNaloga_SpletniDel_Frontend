import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../userContext';
import { Navigate } from 'react-router-dom';

function Profile(){
    const userContext = useContext(UserContext); 
    const [profile, setProfile] = useState({});

    useEffect(function(){
        const getProfile = async function(){
            const res = await fetch("http://localhost:3001/users/profile", {credentials: "include"});
            const data = await res.json();
            setProfile(data);
        }
        getProfile();
    }, []);

    return (
        <>
            {!userContext.user ? <Navigate replace to="/login" /> : ""}
            <div class="pageTitle">
                <h1>User Profile</h1>
            </div>
            <div id="userProfile">
                <p>Username <br/>{profile.username}</p>
                <hr/>
                <p>Email <br/>{profile.email}</p>
            </div>
        </>
    );
}

export default Profile;