import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import PaystackPayment from './PaystackPayment';
import { formatEventStatus } from '../utils/formatEventRange';

const TicketModal = ({ currentUser, events, setEvents, selectedEvent, setSelectedEvent }) => {
  const [selectedTicket, setSelectedTicket] = useState(null);

  const closeOpenTicket = () => setSelectedEvent(null);


  return (
    <div className="fixed left-0 top-0 w-full h-full backdrop-blur-xs flex justify-center items-center z-[9999] custom-scrollbar">
      <div className="absolute top-1/8">
        <div className="relative w-full flex justify-center items-center">
          <div className="flex flex-col bg-[#eeeeee] text-[#333333] space-y-6 p-6 rounded-lg shadow-lg relative w-[90%] max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div
              className="text-2xl absolute top-4 right-4 cursor-pointer hover:scale-105"
              onClick={closeOpenTicket}
            >
              <FiX />
            </div>

            <div className='flex justify-center'>
              <img
                src={selectedEvent?.photoURL}
                alt={selectedEvent?.name}
                className="object-contain w-1/2 hover:scale-105 duration-500 rounded-2xl"
              />
            </div>

            <h2 className="text-2xl text-center uppercase font-bold mb-4">
              {selectedEvent?.name}
            </h2>

            <div className="border-b space-y-2 border-gray-300 w-full">
              <h1 className="uppercase font-semibold text-xl">Description</h1>
              <p className="text-gray-700 mb-2">{selectedEvent?.description}</p>
            </div>

            <div className="border-b space-y-2 border-gray-300 w-full">
              <h1 className="uppercase font-semibold text-xl">Category</h1>
              <p className="text-gray-700 mb-2">{selectedEvent?.category}</p>
            </div>

            <div className="border-b space-y-2 border-gray-300 w-full">
              <h1 className="uppercase font-semibold text-xl">Location</h1>
              <p className="text-gray-700 mb-2">{selectedEvent?.location}</p>
            </div>

            <div className="border-b space-y-2 border-gray-300 w-full">
              <h1 className="uppercase font-semibold text-xl">Organized by</h1>
              <p className="text-gray-700 mb-2">{selectedEvent?.organizer}</p>
            </div>

            <div className="border-b space-y-2 border-gray-300 w-full">
              <h1 className="uppercase font-semibold text-xl">Date & Time</h1>
              <p className="text-gray-700 mb-2">
                {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
                {' | '}
                {formatEventStatus(selectedEvent.startTime)} → {formatEventStatus(selectedEvent.endTime)}
              </p>
            </div>

            <div className="border-b space-y-2 border-gray-300 w-full">
              <h1 className="uppercase font-semibold text-xl">Price</h1>
              <div className="space-y-2">
                {selectedEvent?.price?.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className="w-full text-left p-2 border rounded-lg hover:bg-orange-100 active:scale-95"
                  >
                    {ticket.label}: {ticket.currency}
                    {ticket.amount}
                  </button>
                ))}
              </div>
            </div>

            {selectedTicket && (
              <PaystackPayment
                events={selectedEvent}
                ticket={selectedTicket}
                currentUser={currentUser}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
