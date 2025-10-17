import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { FaXmark } from 'react-icons/fa6';
import { RiSearchLine } from 'react-icons/ri';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const SearchModal = ({ setSelectedEvent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
    setResults([]);
    setSearchTerm('');
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return alert('Please enter a search term');

    try {
      setLoading(true);
      const normalizedTerm = searchTerm.toLowerCase();
      const querySnap = await getDocs(collection(db, 'events'));

      const found = [];
      querySnap.forEach((doc) => {
        const data = doc.data();
        if (data.name?.toLowerCase().includes(normalizedTerm)) {
          found.push({ id: doc.id, ...data });
        }
      });

      setResults(found);
      if (found.length === 0) alert('No events found.');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        className="bg-gray-200 w-10 h-10 flex items-center justify-center rounded-lg"
      >
        <RiSearchLine color="orange" className="w-6 h-6 text-gray-500" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex justify-center items-center bg-[#ed88361c]"
          onClick={closeModal}
        >
          <div
            className="relative p-4 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-[#eeeeee] custom-scrollbar w-full p-3 rounded-md shadow-lg">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-700">Search Events</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:bg-[#ed88364d] hover:text-orange-600 rounded-lg w-8 h-8 flex items-center justify-center"
                >
                  <FaXmark size={20} />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div className="flex gap-2">
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    type="text"
                    className="bg-gray-300 text-gray-900 outline-none rounded-lg w-full p-2"
                    placeholder="Search events..."
                  />
                  <button
                    onClick={handleSearch}
                    className="bg-orange-700 text-[#eeeeee] px-3 py-2 rounded-lg hover:bg-orange-600"
                  >
                    {loading ? '...' : <FaSearch />}
                  </button>
                </div>

                {/* Results */}
                <div className="mt-4 space-y-3 max-h-60 overflow-y-auto">
                  {results.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => {
                        setSelectedEvent(event);
                        closeModal();
                      }}
                      className="flex items-start gap-3 bg-[#15eabc34] rounded-lg p-2 cursor-pointer border border-[#ffffff20] hover:bg-[#13e5b044] transition duration-200"
                    >
                      <img
                        src={event.photoURL || event.image}
                        alt={event.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span>
                        <h2 className="text-lg text-gray-300 font-semibold">{event.name}</h2>
                        <p className="text-xs text-gray-300">
                          📍 {event.location}
                        </p>
                        <p className="text-xs text-gray-300">
                          📆{' '}
                          {new Date(event.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </span>
                    </div>
                  ))}

                  {results.length === 0 && !loading && (
                    <p className="text-gray-500 text-center text-sm">
                      No search results
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchModal;
