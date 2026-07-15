import React from "react";
import { FiMapPin, FiCalendar, FiUser } from "react-icons/fi";
import FollowButton from "../FolllowButton";
import OptimizedImage from "../OptimizedImage";

const EventHero = ({ event, currentUser }) => {
  if (!event) return null;
  
  return (
    <section className="relative w-full h-[500px] overflow-hidden rounded-b-3xl">

      {/* Background Image */}
      <OptimizedImage
        src={event.photo}
        alt={event.name}
        className="absolute inset-0 w-full h-full object-cover z-0"
        loading="lazy"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 z-10" />

      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />

      {/* Content */}
      <div className="absolute inset-0 z-20">
        <div className="mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-10">

        {/* Category */}
        <span className="w-fit bg-(--primary) text-white px-4 py-1 rounded-xs text-sm font-semibold mb-5">
          {event.category}
        </span>

        {/* Title */}
        <h1 className="text-white font-black text-5xl lg:text-7xl mb-4 max-w-3xl">
          {event.name}
        </h1>

        {/* Genres */}
        {event.genres?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {event.genres.map((genre) => (
              <span
                key={genre}
                className="bg-white/10 backdrop-blur px-3 py-1 rounded-full text-white text-sm"
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        {/* Bottom Row */}
        <div className="flex flex-wrap justify-between items-center gap-6">

          <div className="flex flex-col gap-2">

            <div className="flex items-center gap-2 ">
              <FiCalendar />
              <span>
                {new Date(event.date).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center gap-2 text-white">
              <FiMapPin />
              <span>{event.venue?.name || event.location}</span>
            </div>

          </div>
{/* 
          {currentUser?.uid !== event.ownerId && (
            <FollowButton
              currentUser={currentUser}
              ownerId={event.ownerId}
            />
          )} */}

        </div>

      </div>
      </div>

    </section>
  );
};

export default EventHero;