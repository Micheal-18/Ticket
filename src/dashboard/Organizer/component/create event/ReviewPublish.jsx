import React from "react";
import {
  FiCheckCircle,
  FiEdit,
  FiSend,
} from "react-icons/fi";

const ReviewPublish = ({
  event,
  onPublish,
}) => {

  return (

    <section className="space-y-8">

      <div>

        <h2 className="text-3xl font-bold">
          Review Your Event
        </h2>

        <p className="opacity-70 text-xs mt-2">
          Make sure everything looks good before publishing.
        </p>

      </div>

      <div className="rounded-3xl border p-6 space-y-6">

        <Summary
          title="Basic Information"
          value={event.name}
        />

        <Summary
          title="Category"
          value={event.category}
        />

        <Summary
          title="Venue"
          value={event.venue.name}
        />

        <Summary
          title="Tickets"
          value={`${event.tickets.length} Ticket Type(s)`}
        />

        <Summary
          title="Guests"
          value={`${event.guests.length} Guest(s)`}
        />

        <Summary
          title="Sponsors"
          value={`${event.sponsors.length} Sponsor(s)`}
        />

        <Summary
          title="Schedule"
          value={`${event.schedules.length} Session(s)`}
        />

      </div>

      <div className="rounded-3xl bg-green-50 dark:bg-green-500/10 border border-green-300 p-6">

        <div className="flex gap-4">

          <FiCheckCircle
            size={28}
            className="text-green-500"
          />

          <div>

            <h3 className="font-bold">
              Ready to Publish
            </h3>

            <p className="opacity-70 mt-2">
              Once published, attendees can discover and purchase tickets.
            </p>

          </div>

        </div>

      </div>

      <div className="flex gap-4">

        <button
          className="flex-1 border rounded-2xl py-4 flex justify-center items-center gap-2"
        >

          <FiEdit />

          Continue Editing

        </button>

        <button
          onClick={onPublish}
          className="flex-1 bg-(--primary) text-white rounded-2xl py-4 flex justify-center items-center gap-2"
        >

          <FiSend />

          Publish Event

        </button>

      </div>

    </section>

  );

};

const Summary = ({
  title,
  value,
}) => {

  return (

    <div className="flex justify-between items-center border-b pb-4">

      <span className="font-medium">
        {title}
      </span>

      <span className="opacity-70">
        {value}
      </span>

    </div>

  );

};

export default ReviewPublish;