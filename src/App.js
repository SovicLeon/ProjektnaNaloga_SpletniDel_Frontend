import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserContext } from "./userContext";
import Header from "./components/Header";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import Logout from "./components/Logout";
import LastLoaction from "./components/LastLocation";
import LastDrive from "./components/LastDrive";
import RoadInfo from "./components/RoadInfo";

function App() {
  const [user, setUser] = useState(localStorage.user ? JSON.parse(localStorage.user) : null);
  const updateUserData = (userInfo) => {
    localStorage.setItem("user", JSON.stringify(userInfo));
    setUser(userInfo);
  }

  useEffect(() => {
    document.title = "Road info";
  }, []);

  return (
    <BrowserRouter>
      <UserContext.Provider value={{
        user: user,
        setUserContext: updateUserData
      }}>
        <div className="App">
          <Header title="Road capture"></Header>
          <Routes>
            <Route path="/" exact element={<RoadInfo />}></Route>
            <Route path="/login" exact element={<Login />}></Route>
            <Route path="/register" element={<Register />}></Route>
            <Route path="/profile" element={<Profile />}></Route>
            <Route path="/logout" element={<Logout />}></Route>
            <Route path="/lastlocation" element={<LastLoaction />}></Route>
            <Route path="/lastdrive" element={<LastDrive />}></Route>
            <Route path="/roadinfo" element={<RoadInfo />}></Route>
          </Routes>
        </div>
      </UserContext.Provider>
    </BrowserRouter>
  );
}

export default App;
