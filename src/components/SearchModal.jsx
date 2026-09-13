import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { FaXmark } from 'react-icons/fa6';
import { RiSearchLine } from 'react-icons/ri';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';

const SearchModal = ({ selectedEvent, setSelectedEvent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--primary)] shadow-[var(--shadow-sm)] transition hover:border-[var(--primary)] hover:bg-[var(--primary)]/10"
      >
        <RiSearchLine className="h-5 w-5" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(15,23,42,0.35)] backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-lg p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-color)] shadow-[var(--shadow-lg)]">
              <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">Discover</p>
                  <h3 className="text-xl font-bold text-[var(--text-color)]">Search Events</h3>
                </div>

                <button
                  onClick={closeModal}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--primary)]"
                >
                  <FaXmark size={18} />
                </button>
              </div>

              <div className="space-y-4 p-5">
                <div className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-color)] px-3 py-2 shadow-[var(--shadow-sm)]">
                  <FaSearch className="text-[var(--primary)]" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    type="text"
                    className="w-full border-none bg-transparent text-sm text-[var(--text-color)] outline-none placeholder:text-[var(--text-secondary)]"
                    placeholder="Search events..."
                  />
                  <button
                    onClick={handleSearch}
                    className="rounded-xl bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-[var(--primary-hover)]"
                  >
                    {loading ? '...' : 'Search'}
                  </button>
                </div>

                <div className="max-h-[22rem] space-y-3 overflow-y-auto pr-1">
                  {results.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => {
                        setSelectedEvent(event);
                        closeModal();
                        navigate(`/event/${event.slug}`);
                      }}
                      className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-color)] p-2 transition hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5"
                    >
                      <img
                        src={event.photoURL || event.photo}
                        alt={event.name}
                        className="h-20 w-20 rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-base font-semibold text-[var(--text-color)]">{event.name}</h2>
                        <p className="mt-1 text-xs text-[var(--text-secondary)]">
                          📍 {event.location || event.venue?.name || 'Location not available'}
                        </p>
                        <p className="mt-1 text-xs text-[var(--text-secondary)]">
                          📆{' '}
                          {new Date(event.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}

                  {results.length === 0 && !loading && (
                    <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-color)] py-8 text-center text-sm text-[var(--text-secondary)]">
                      No search results yet
                    </div>
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
