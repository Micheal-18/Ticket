import React from "react";
import {
  FiInstagram,
  FiUser
} from "react-icons/fi";

const GuestList = ({ guests = [] }) => {

  if (!guests.length) return null;

  return (
    <section className="space-y-6">

      <div>

        <h2 className="text-3xl font-bold">
          Who To Expect
        </h2>

        <p className="opacity-70">
          Meet the amazing guests joining this event.
        </p>

      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {guests.map((guest) => (

          <GuestCard
            key={guest.id}
            guest={guest}
          />

        ))}

      </div>

    </section>
  );
};

const GuestCard = ({ guest }) => {

  return (

    <div className="group rounded-3xl overflow-hidden bg-(--bg-color) dark:bg-(--bg-color) text-(--text-color) dark:text-(--text-color) border-(--border) shadow-sm hover:shadow-xl duration-300">

      <div className="relative h-72">

        {guest.photo ? (

          <img
            src={guest.photo}
            alt={guest.name}
            className="w-full h-full object-cover group-hover:scale-105 duration-500"
          />

        ) : (

          <div className="w-full h-full flex items-center justify-center bg-zinc-200 dark:bg-zinc-800">

            <FiUser size={60} />

          </div>

        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        <div className="absolute bottom-5 left-5 right-5">

          <h3 className="text-white font-bold text-2xl">

            {guest.name}

          </h3>

          <span className="inline-block mt-2 bg-(--primary) text-white px-3 py-1 rounded-full text-sm">

            {guest.role === "Other"
              ? guest.customRole
              : guest.role}

          </span>

        </div>

      </div>

      <div className="p-5 space-y-4">

        <p className="text-sm opacity-70 line-clamp-4">

          {guest.bio}

        </p>

        {guest.instagram && (

          <a
            href={`https://instagram.com/${guest.instagram.replace("@","")}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-(--primary) font-semibold hover:underline"
          >

            <FiInstagram />

            {guest.instagram}

          </a>

        )}

      </div>

    </div>

  );

};

export default GuestList;