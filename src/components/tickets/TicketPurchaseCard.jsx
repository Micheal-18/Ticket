import React, { useMemo } from 'react'
import GoogleAuth from '../../auth/GoogleAuth'
import PaystackPayment from '../PaystackPayment'

const TicketPurchaseCard = ({
  ticket,
  currentUser,
  quantity,
  onQuantityChange,
  attendees,
  onAttendeeChange,
  selected,
  onSelect,
  event
}) => {
  const total = useMemo(() => {
    return Number(ticket.price || 0) * quantity
  }, [ticket.price, quantity])

  const remaining = ticket.quantity - (ticket.sold || 0)
  console.log(ticket.quantity);
  console.log(ticket.sold);
  
  

  const soldOut = remaining <= 0

  const maxQuantity = Math.min(10, remaining, ticket.maxPerPurchase || 10)

  return (
    <div className='rounded-3xl border bg-(--bg-color) dark:bg-(--bg-color) text-(--text-color) dark:text-(--text-color) border-(--border) p-6 space-y-6'>
      {/* Header */}

      <div className='flex justify-between items-start'>
        <div>
          <h3 className='text-xl font-bold'>{ticket.name}</h3>

          <p className='text-zinc-400 text-sm'>{ticket.description}</p>
        </div>

        <div className='text-right'>
          <h2 className='text-2xl font-black text-(--primary-hover)'>
            {Number(ticket.price) === 0
              ? 'FREE'
              : `${ticket.currency || '₦'}${Number(
                  ticket.price
                ).toLocaleString()}`}
          </h2>

          <p className='text-xs text-zinc-500'>{remaining} left</p>
        </div>
      </div>

      {/* Quantity */}

      {!soldOut && (
        <div className='space-y-2'>
          <label className='text-sm text-zinc-400'>Quantity</label>

          <div className='flex items-center justify-between rounded-2xl border bg-(--bg-color) dark:bg-(--bg-color) text-(--text-color) dark:text-(--text-color) border-(--border) p-2'>
            <button
              type='button'
              onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
              disabled={quantity <= 0}
              className='w-12 h-12 rounded-xl bg-zinc-400 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-xl font-bold transition'
            >
              −
            </button>

            <span className='text-2xl font-bold w-12 text-center'>
              {quantity}
            </span>

            <button
              type='button'
              onClick={() =>
                onQuantityChange(Math.min(maxQuantity, quantity + 1))
              }
              disabled={quantity >= 10 || quantity >= remaining}
              className='w-12 h-12 rounded-xl bg-(--primary) hover:bg-(--primary-hover) disabled:opacity-40 disabled:cursor-not-allowed text-xl font-bold transition'
            >
              +
            </button>
          </div>

          <p className='text-xs text-zinc-500'>
            Maximum {Math.min(10, remaining)} tickets
          </p>
        </div>
      )}

      {/* Total */}

      {quantity > 0 && Number(ticket.price) > 0 && (
        <div className='rounded-xl bg-zinc-900 p-4 flex justify-between'>
          <span>Total</span>

          <span className='font-bold text-(--primary-hover)'>
            {ticket.currency || '₦'}
            {total.toLocaleString()}
          </span>
        </div>
      )}

      {/* Attendees */}

      {quantity > 1 &&
        attendees.map((person, index) => (
          <div
            key={index}
            className='space-y-2 flex flex-col justify-center border-t border-zinc-800 pt-4'
          >
            <h4 className='font-semibold'>Attendee {index + 2}</h4>

            <input
              value={person.name}
              placeholder='Full Name'
              onChange={e => onAttendeeChange(index, 'name', e.target.value)}
              className='w-full rounded-xl p-3  border border-(--border)'
            />

            <input
              value={person.email}
              placeholder='Email'
              onChange={e => onAttendeeChange(index, 'email', e.target.value)}
              className='w-full rounded-xl p-3 border border-(--border)'
            />
          </div>
        ))}

      {/* Buttons */}

      {soldOut ? (
        <button
          disabled
          className='w-full  rounded-xl bg-red-900 py-4 font-bold'
        >
          SOLD OUT
        </button>
      ) : quantity === 0 ? (
        <button disabled className='w-full rounded-xl  border border-(--border) py-4'>
          Select Quantity
        </button>
      ) : !currentUser ? (
        <GoogleAuth
          className='w-full'
        />
      ) : selected ? (
        <PaystackPayment
          currentUser={currentUser}
          events={event}
          ticket={{
            ...ticket,
            num: quantity
          }}
          attendees={attendees}
        />
      ) : (
        <PaystackPayment
          currentUser={currentUser}
          events={event}
          ticket={{
            ...ticket,
            num: quantity
          }}
          attendees={attendees}
        />
      )}
    </div>
  )
}

export default TicketPurchaseCard
