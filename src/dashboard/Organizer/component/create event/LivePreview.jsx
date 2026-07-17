import React, { useEffect, useState } from 'react'
import { FiMapPin, FiCalendar, FiClock } from 'react-icons/fi'

const LivePreview = ({
  photo,
  name,
  category,
  genres = [],
  description,
  location,
  organizer,
  date,
  startTime,
  endTime,
  coverStyle,
  schedules = [],
  guests = [],
  sponsors = [],
  venue = {},
  rules = '',
  faqs = [],
  theme = {
    accent: '#F59E0B',
    button: 'Rounded'
  }
}) => {
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    if (!photo) {
      setPreview(null)
      return
    }

    if (typeof photo === 'string') {
      setPreview(photo)
      return
    }

    const url = URL.createObjectURL(photo)
    setPreview(url)

    return () => URL.revokeObjectURL(url)
  }, [photo])

  return (
    <aside className=' top-24 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-500 bg-(--bg-color) shadow flex-1'>
      {/* Hero */}

      <div className='relative h-72 overflow-hidden'>
        {preview ? (
          <>
            {(coverStyle === 'blur' || coverStyle === 'glass') && (
              <img
                src={preview}
                alt=''
                className='absolute inset-0 w-full h-full object-cover scale-110 blur-xl'
              />
            )}

            {coverStyle === 'gradient' && (
              <>
                <img
                  src={preview}
                  alt=''
                  className='absolute inset-0 w-full h-full object-cover'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent' />
              </>
            )}

            <img
              src={preview}
              alt={name}
              className={`relative z-10 w-full h-full ${
                coverStyle === 'glass' ? 'object-contain p-6' : 'object-cover'
              }`}
            />
          </>
        ) : (
          <div className='w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-500'>
            Upload a cover image
          </div>
        )}

        <div className='absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-6 z-20'>
          <span className='inline-block rounded-xs bg-(--primary) px-3 py-1 text-xs font-semibold text-white'>
            {category || 'Category'}
          </span>

          <h1 className='mt-3 text-3xl font-bold text-white'>
            {name || 'Your Event'}
          </h1>
        </div>
      </div>

      {/* Body */}

      <div className='p-6 space-y-6'>
        <div className='grid gap-3'>
          <div className='flex items-center gap-3 text-sm opacity-80'>
            <FiMapPin />
            {location || 'Venue'}
          </div>

          <div className='flex items-center gap-3 text-sm opacity-80'>
            <FiCalendar />
            {date ? new Date(date).toLocaleDateString() : 'Event Date'}
          </div>

          <div className='flex items-center gap-3 text-sm opacity-80'>
            <FiClock />
              {startTime
    ? `${new Date(startTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}${
        endTime
          ? ` - ${new Date(endTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}`
          : ""
      }`
    : "Event Time"}
          </div>

          {schedules.length > 0 && (
            <div>
              <h3 className='font-bold text-xl mb-4'>Event Schedule</h3>

              <div className='space-y-4'>
                {schedules.map(item => (
                  <div
                    key={item.id}
                    className='border-l-4 border-(--primary) pl-4'
                  >
                    <p className='text-sm text-(--primary) font-semibold'>
                      {item.start} - {item.end}
                    </p>

                    <h4 className='font-semibold'>{item.title}</h4>

                    {item.speaker && (
                      <p className='text-sm opacity-70'>👤 {item.speaker}</p>
                    )}

                    {item.description && (
                      <p className='text-sm mt-2 opacity-80'>
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {genres.length > 0 && (
          <div>
            <h3 className='font-semibold mb-3'>What to Expect</h3>

            <div className='flex flex-wrap gap-2'>
              {genres.map(genre => (
                <span
                  key={genre}
                  className='rounded-full bg-orange-100 text-orange-600 dark:bg-(--primary)/20 dark:text-orange-300 px-3 py-1 text-xs'
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className='font-bold uppercase mb-3'>About</h3>

          <div
            className='prose prose-sm max-w-none dark:prose-invert'
            dangerouslySetInnerHTML={{
              __html: description || '<p>Tell attendees about your event...</p>'
            }}
          />
        </div>

        <div className='rounded-2xl border p-4'>
          <p className='text-sm text-gray-500'>Organized by</p>

          <h4 className='font-semibold mt-1'>
            {organizer || 'Organizer Name'}
          </h4>
        </div>
        {guests.length > 0 && (
          <div>
            <h3 className='text-xl font-bold mb-4'>Who To Expect</h3>

            <div className='grid grid-cols-2 gap-4'>
              {guests.map(guest => {
                const image = guest.photo
  ? typeof guest.photo === "string"
    ? guest.photo
    : URL.createObjectURL(guest.photo)
  : null;

                return (
                  <div
                    key={guest.id}
                    className='rounded-2xl border overflow-hidden'
                  >
                    <div className='h-40 bg-gray-200'>
                      {image && (
                        <img
                          src={image}
                          alt={guest.name}
                          className='w-full h-full object-cover'
                        />
                      )}
                    </div>

                    <div className='p-4'>
                      <h4 className='font-semibold'>{guest.name}</h4>

                      <p className='text-sm opacity-70'>
                        {guest.role === 'Other' ? guest.customRole : guest.role}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {sponsors?.length > 0 && (
          <div>
            <h3 className='font-semibold mb-3'>Sponsors</h3>

            <div className='flex flex-wrap gap-3'>
              {sponsors.map(sponsor => (
                <div
                  key={sponsor.id}
                  className='flex items-center gap-2 rounded-xl border px-3 py-2'
                >
                  {sponsor.logo && (
<img
    src={
        typeof sponsor.logo === "string"
            ? sponsor.logo
            : URL.createObjectURL(sponsor.logo)
    }
/>
                  )}

                  <span className='text-sm font-medium'>{sponsor.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {venue.name && (
          <div>
            <h3 className='text-xl font-bold mb-4'>📍 Venue</h3>

            <div className='rounded-2xl border p-5 space-y-3'>
              <h4 className='font-semibold'>{venue.name}</h4>

              <p className='opacity-70'>{venue.address}</p>

              <p className='text-sm text-(--primary)'>{venue.type}</p>

              {venue.parking && <p className='text-sm'>🚗 {venue.parking}</p>}

              {venue.directions && (
                <p className='text-sm'>🧭 {venue.directions}</p>
              )}

              {venue.map && (
                <a
                  href={venue.map}
                  target='_blank'
                  rel='noreferrer'
                  className='inline-block mt-2 text-(--primary) font-semibold'
                >
                  Open in Google Maps →
                </a>
              )}
            </div>
          </div>
        )}

        {rules && (
          <div className='space-y-4'>
            <h3 className='text-xl font-bold'>Rules</h3>

            <div className='rounded-2xl border p-5 whitespace-pre-wrap'>
              {rules}
            </div>
          </div>
        )}

        {faqs.length > 0 && (
          <div className='space-y-4'>
            <h3 className='text-xl font-bold'>FAQs</h3>

            <div className='space-y-3'>
              {faqs.map(faq => (
                <details key={faq.id} className='rounded-xl border p-4'>
                  <summary className='cursor-pointer font-semibold'>
                    {faq.question}
                  </summary>

                  <p className='mt-3 opacity-80'>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        )}

        <button
          className={`w-full py-4 font-semibold transition

    ${
      theme.button === 'Rounded'
        ? 'rounded-xl'
        : theme.button === 'Square'
        ? 'rounded-none'
        : 'rounded-full'
    }
    `}
          style={{
            background: theme.accent,
            color: '#fff'
          }}
        >
          Get Ticket
        </button>
      </div>
    </aside>
  )
}

export default LivePreview
