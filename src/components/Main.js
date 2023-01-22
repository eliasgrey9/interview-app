import React from "react";
import Homepage from "./Home/Homepage";
import SignUp from "./Signup/SignUp";
import { Routes, Route } from "react-router-dom";

function Main() {
  return (
    <div className="App">
      <Routes>
        <Route path="/home" element={<Homepage />}></Route>
        <Route path="/signUp" element={<SignUp />}></Route>
      </Routes>
    </div>
  );
}

export default Main;

//How to pass headers to an api request

//axios.METHOD(ROUTE_URL, { headers: { Authorization: 'Bearer myVeryLongJWT' } })
