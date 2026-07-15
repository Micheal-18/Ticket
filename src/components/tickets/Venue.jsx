import React from "react";
import { FiMapPin, FiNavigation, FiMap } from "react-icons/fi";

const VenueCard = ({ event }) => {
  if (!event?.venue) return null;

  // Compile full search query for the map embed and directions
  const mapSearchQuery = [
    event.venue.name,
    event.venue.address,
    event.location,
    "Nigeria"
  ]
    .filter(Boolean)
    .join(", ");

  // Create clean Google Maps iframe embed URL using the text address query
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    mapSearchQuery
  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  // Create public Google Maps redirection link
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    mapSearchQuery
  )}`;

  return (
    <section className="rounded-3xl bg-(--bg-color) dark:bg-(--bg-color) text-(--text-color) dark:text-(--text-color) border-(--border) shadow borderoverflow-hidden">

      {/* Header */}
      <div className="p-6 border-b border-(--border)">
        <h2 className="text-xl font-bold flex items-center uppercase gap-2 ">
          <FiMapPin className="text-(--primary)" />
          Venue
        </h2>

        <p className="text-sm opacity-70 mt-1 text-zinc-300 dark:text-zinc-400">
          Event location & directions
        </p>
      </div>

      {/* Venue Information */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="font-semibold text-lg ">
            {event.venue.name}
          </h3>

          <p className="opacity-70 text-zinc-300 dark:text-zinc-400">
            {event.venue.address}
          </p>
        </div>

        {event.venue.type && (
          <div className="inline-flex rounded-full bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 px-3 py-1 text-sm font-medium">
            {event.venue.type}
          </div>
        )}

        {event.venue.parking && (
          <div>
            <h4 className="font-semibold uppercase mb-1 ">
              Parking
            </h4>
            <p className="opacity-70 text-zinc-300 dark:text-zinc-400">
              {event.venue.parking}
            </p>
          </div>
        )}

        {event.venue.directions && (
          <div>
            <h4 className="font-semibold uppercase mb-1 ">
              Directions
            </h4>
            <p className="opacity-70 text-zinc-300 dark:text-zinc-400">
              {event.venue.directions}
            </p>
          </div>
        )}
      </div>

      {/* Google Map Embed (Uses text-based address searching) */}
      <div className="h-[350px] w-full border-t border-b bg-(--bg-color) dark:bg-(--bg-color) text-(--text-color) dark:text-(--text-color) border-(--border)">
        <iframe
          title="Google Map Venue Location"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={embedUrl}
        ></iframe>
      </div>

      {/* Footer Controls */}
      <div className="p-5 flex gap-3">
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <button 
            type="button" 
            className="w-full rounded-xl bg-(--primary) hover:bg-(--primary-hover) text-white py-3 font-semibold flex justify-center items-center gap-2 cursor-pointer transition-colors"
          >
            <FiNavigation />
            Get Directions
          </button>
        </a>

        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <button 
            type="button" 
            className="rounded-xl border border-(--border) px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            <FiMap size={20} />
          </button>
        </a>
      </div>

    </section>
  );
};

export default VenueCard;