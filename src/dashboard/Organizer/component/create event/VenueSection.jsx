import React from 'react'
import { FiMapPin } from 'react-icons/fi'

const venueTypes = ['Indoor', 'Outdoor', 'Virtual', 'Hybrid']

const VenueSection = ({ venue, setVenue }) => {
  const updateVenue = (field, value) => {
    setVenue({
      ...venue,
      [field]: value
    })
  }

  return (
    <section className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold'>Venue</h2>

        <p className='text-xs opacity-70'>
          Help attendees find your event easily.
        </p>
      </div>

      <div>
        <label className='font-medium'>Venue Name</label>

        <input
          value={venue.name}
          onChange={e => updateVenue('name', e.target.value)}
          placeholder='Landmark Event Centre'
          className='mt-2 w-full rounded-xl border p-4'
        />
      </div>

      <div>
        <label className='font-medium'>Full Address</label>

        <textarea
          rows={3}
          value={venue.address}
          onChange={e => updateVenue('address', e.target.value)}
          placeholder='Plot 2 Water Corporation Drive...'
          className='mt-2 w-full rounded-xl border p-4'
        />
      </div>

      <div>
        <label className='font-medium'>Google Maps Link</label>

        <input
          value={venue.map}
          onChange={e => updateVenue('map', e.target.value)}
          placeholder='https://maps.google.com/...'
          className='mt-2 w-full rounded-xl border p-4'
        />
      </div>

      <div>
        <label className='font-medium'>Venue Type</label>

        <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mt-3'>
          {venueTypes.map(type => (
            <button
              key={type}
              type='button'
              onClick={() => updateVenue('type', type)}
              className={`rounded-xl border p-4 transition ${
                venue.type === type
                  ? 'bg-(--primary) text-white border-(--primary)'
                  : ''
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div>
          <label className='font-medium'>Coordinates</label>

          <p className='text-xs opacity-70 mt-1'>
            Enter the venue latitude and longitude for accurate map positioning.
          </p>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-3'>
            <div>
              <label className='text-sm opacity-80'>Latitude</label>

              <input
                type='number'
                step='any'
                value={venue.latitude || ''}
                onChange={e => updateVenue('latitude', e.target.value)}
                placeholder='6.524379'
                className='mt-2 w-full rounded-xl border p-4'
              />
            </div>

            <div>
              <label className='text-sm opacity-80'>Longitude</label>

              <input
                type='number'
                step='any'
                value={venue.longitude || ''}
                onChange={e => updateVenue('longitude', e.target.value)}
                placeholder='3.379206'
                className='mt-2 w-full rounded-xl border p-4'
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className='font-medium'>Parking Information</label>

        <textarea
          rows={2}
          value={venue.parking}
          onChange={e => updateVenue('parking', e.target.value)}
          placeholder='Free parking available...'
          className='mt-2 w-full rounded-xl border p-4'
        />
      </div>

      <div>
        <label className='font-medium'>Directions</label>

        <textarea
          rows={3}
          value={venue.directions}
          onChange={e => updateVenue('directions', e.target.value)}
          placeholder='Take the second gate...'
          className='mt-2 w-full rounded-xl border p-4'
        />
      </div>
    </section>
  )
}

export default VenueSection
