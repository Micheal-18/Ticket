import React, { useEffect, useState } from "react";
import {
  FiClock,
  FiCalendar,
  FiCheckCircle
} from "react-icons/fi";

const Countdown = ({ startTime, endTime }) => {
  const calculate = () => {
    const now = new Date();

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now >= end) {
      return {
        status: "ended",
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      };
    }

    if (now >= start) {
      return {
        status: "live",
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      };
    }

    const diff = start - now;

    return {
      status: "upcoming",
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60)
    };
  };

  const [time, setTime] = useState(calculate());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(calculate());
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, endTime]);

  if (time.status === "ended") {
    return (
      <div className="rounded-3xl bg-red-600 text-white p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <FiCheckCircle size={28} />
          <div>
            <h2 className="font-bold text-xl">
              Event Ended
            </h2>
            <p className="opacity-80 text-sm">
              This event has concluded.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (time.status === "live") {
    return (
      <div className="rounded-3xl bg-green-600 text-white p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <FiClock size={28} />
          <div>
            <h2 className="font-bold text-xl">
              LIVE NOW
            </h2>

            <p className="opacity-80 text-sm">
              This event is currently happening.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border p-6 shadow bg-(--bg-color) dark:bg-(--bg-color) text-(--text-color) dark:text-(--text-color) border-(--border)">

      <div className="flex items-center gap-2 mb-6">

        <FiCalendar
          className="text-(--primary)"
          size={24}
        />

        <h2 className="font-bold text-xl">
          Starts In
        </h2>

      </div>

      <div className="grid grid-cols-4 gap-3">

        <TimeCard
          value={time.days}
          label="Days"
        />

        <TimeCard
          value={time.hours}
          label="Hours"
        />

        <TimeCard
          value={time.minutes}
          label="Minutes"
        />

        <TimeCard
          value={time.seconds}
          label="Seconds"
        />

      </div>

    </div>
  );
};

const TimeCard = ({ value, label }) => (
  <div className="rounded-2xl bg-(--primary) text-white p-4 text-center">

    <h3 className="text-3xl font-black">
      {String(value).padStart(2, "0")}
    </h3>

    <p className="text-xs uppercase mt-1 tracking-wider">
      {label}
    </p>

  </div>
);

export default Countdown;