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
    <section className="rounded-3xl bg-white dark:bg-zinc-900 shadow border border-zinc-100 dark:border-zinc-800 overflow-hidden">

      {/* Header */}
      <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
        <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
          <FiMapPin className="text-(--primary)" />
          Venue
        </h2>

        <p className="text-sm opacity-70 mt-1 text-zinc-500 dark:text-zinc-400">
          Event location & directions
        </p>
      </div>

      {/* Venue Information */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
            {event.venue.name}
          </h3>

          <p className="opacity-70 text-zinc-600 dark:text-zinc-400">
            {event.venue.address}
          </p>
        </div>

        {event.venue.type && (
          <div className="inline-flex rounded-full bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 px-3 py-1 text-sm font-medium">
            {event.venue.type}
          </div>
        )}

        {event.venue.parking && (
          <div>
            <h4 className="font-semibold mb-1 text-zinc-900 dark:text-zinc-100">
              Parking
            </h4>
            <p className="opacity-70 text-zinc-600 dark:text-zinc-400">
              {event.venue.parking}
            </p>
          </div>
        )}

        {event.venue.directions && (
          <div>
            <h4 className="font-semibold mb-1 text-zinc-900 dark:text-zinc-100">
              Directions
            </h4>
            <p className="opacity-70 text-zinc-600 dark:text-zinc-400">
              {event.venue.directions}
            </p>
          </div>
        )}
      </div>

      {/* Google Map Embed (Uses text-based address searching) */}
      <div className="h-[350px] w-full border-t border-b border-zinc-100 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950">
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
            className="rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            <FiMap size={20} />
          </button>
        </a>
      </div>

    </section>
  );
};

export default VenueCard;