// src/components/OptimizedImage.jsx
import React, { useState } from "react";

const CLOUD_NAME = "dkny4uowy"; // change if needed

// Helper to inject Cloudinary optimizations
const optimizeImage = (url, width = 600) => {
  if (!url) return "";

  const parts = url.split("/upload/");
  if (parts.length < 2) return url; // fallback if malformed

  // Example: /image/upload/f_auto,q_auto,w_600/
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,w_${width}/${parts[1]}`;
};

const OptimizedImage = ({ src, alt = "", className = "", width = 600 }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder shimmer while loading */}
      {!loaded && (
        <div className="absolute inset-0 bg-gray-300 animate-pulse" />
      )}

      <img
        src={optimizeImage(src, width)}
        srcSet={`
          ${optimizeImage(src, 400)} 400w,
          ${optimizeImage(src, 800)} 800w,
          ${optimizeImage(src, 1200)} 1200w
        `}
        sizes="(max-width: 600px) 400px, (max-width: 1024px) 800px, 1200px"
        alt={alt}
        loading="lazy"
        className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
};

export default OptimizedImage;
