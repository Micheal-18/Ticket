import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import walkGif from "../assets/dog.gif";
import { FaUserCircle } from "react-icons/fa";


const WelcomeBack = ({ userData, redirectTo }) => {
    const navigate = useNavigate();

    useEffect(() => {

        if (!userData) return;
        const timer = setTimeout(() => {
            navigate("/dashboard");
        }, 10000); // 10 seconds
        return () => clearTimeout(timer);
    }, [userData, navigate]);


  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-(--bg-color) dark:bg-(--bg-color) text-(--text-color)">
      {/* Header */}
      <div className="flex flex-col items-center space-y-4">
        <FaUserCircle className="text-orange-500 text-9xl" />
        <h1 className="text-4xl md:text-5xl font-bold">
          Welcome back, {userData?.fullName || "User"}!
        </h1>
        <p className="text-gray-400 text-lg md:text-xl">
          Preparing your dashboard...
        </p>
      </div>

      {/* Progress / Loading Animation */}

    </div>
  );
};

export default WelcomeBack;
