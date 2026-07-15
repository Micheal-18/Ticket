import React from "react";
import { FiClock } from "react-icons/fi";

const ScheduleTimeline = ({ schedules = [] }) => {
  if (!schedules.length) return null;

  const sortedSchedules = [...schedules].sort((a, b) =>
    a.time.localeCompare(b.time)
  );

  return (
    <section className="space-y-8">

      <div>
        <h2 className="text-3xl font-bold">
          Event Schedule
        </h2>

        <p className="opacity-70">
          Know exactly what's happening throughout the event.
        </p>
      </div>

      <div className="relative">

        {/* Timeline line */}
        <div className="absolute left-5 top-0 bottom-0 w-1 bg-orange-200 rounded-full" />

        <div className="space-y-8">

          {sortedSchedules.map((item) => (

            <TimelineCard
              key={item.id}
              schedule={item}
            />

          ))}

        </div>

      </div>

    </section>
  );
};

const TimelineCard = ({ schedule }) => {

  return (

    <div className="relative flex gap-6">

      {/* Dot */}

      <div className="relative z-10 w-10 h-10 rounded-full bg-(--primary) text-white flex items-center justify-center shadow-lg">

        <FiClock />

      </div>

      {/* Card */}

      <div className="flex-1 rounded-3xl border bg-white dark:bg-zinc-900 p-6 shadow-sm hover:shadow-lg transition">

        <div className="flex justify-between items-start gap-4 flex-wrap">

          <div>

            <h3 className="font-bold text-xl">

              {schedule.title}

            </h3>

            {schedule.description && (

              <p className="opacity-70 mt-2">

                {schedule.description}

              </p>

            )}

          </div>

          <span className="bg-orange-100 dark:bg-orange-900/40 text-orange-600 px-4 py-2 rounded-full font-semibold">

            {schedule.time}

          </span>

        </div>

      </div>

    </div>

  );

};

export default ScheduleTimeline;