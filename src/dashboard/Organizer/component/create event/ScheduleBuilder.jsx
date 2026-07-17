import React from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";

const ScheduleBuilder = ({
  schedules,
  setSchedules,
}) => {

  const addSchedule = () => {
    setSchedules([
      ...schedules,
      {
        id: crypto.randomUUID(),
        title: "",
        description: "",
        start: "",
        end: "",
        speaker: "",
      },
    ]);
  };

  const updateSchedule = (id, field, value) => {
    setSchedules(
      schedules.map(item =>
        item.id === id
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  const removeSchedule = id => {
    setSchedules(
      schedules.filter(item => item.id !== id)
    );
  };

  return (
    <section className="space-y-6">

      <div className="flex justify-between items-center">

        <div>
          <h2 className="text-2xl font-bold">
            Event Schedule
          </h2>

          <p className="text-xs opacity-70">
            Optional timeline for your event.
          </p>
        </div>

        <button
          type="button"
          onClick={addSchedule}
          className="bg-(--primary) text-white px-5 py-3 rounded-xl flex items-center gap-2"
        >
          <FiPlus />
          Add Session
        </button>

      </div>

      {schedules.map(session => (

        <div
          key={session.id}
          className="rounded-3xl border border-(--border) p-6 space-y-5"
        >

          <div className="flex justify-between">

            <h3 className="font-bold">
              {session.title || "New Session"}
            </h3>

            <button
              type="button"
              onClick={() => removeSchedule(session.id)}
              className="text-red-500"
            >
              <FiTrash2 />
            </button>

          </div>

          <input
            placeholder="Opening Ceremony"
            value={session.title}
            onChange={(e)=>
              updateSchedule(
                session.id,
                "title",
                e.target.value
              )
            }
            className="w-full rounded-xl border border-(--border) p-4"
          />

          <textarea
            placeholder="Describe this session..."
            value={session.description}
            onChange={(e)=>
              updateSchedule(
                session.id,
                "description",
                e.target.value
              )
            }
            className="w-full rounded-xl border border-(--border) p-4"
          />

          <div className="grid md:grid-cols-2 gap-4">

            <div>

              <label>Start Time</label>

              <input
                type="time"
                value={session.start}
                onChange={(e)=>
                  updateSchedule(
                    session.id,
                    "start",
                    e.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-(--border) p-4"
              />

            </div>

            <div>

              <label>End Time</label>

              <input
                type="time"
                value={session.end}
                onChange={(e)=>
                  updateSchedule(
                    session.id,
                    "end",
                    e.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-(--border) p-4"
              />

            </div>

          </div>

          <input
            placeholder="Speaker / Host (Optional)"
            value={session.speaker}
            onChange={(e)=>
              updateSchedule(
                session.id,
                "speaker",
                e.target.value
              )
            }
            className="w-full rounded-xl border border-(--border) p-4"
          />

        </div>

      ))}

    </section>
  );
};

export default ScheduleBuilder;