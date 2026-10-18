import React, { useMemo } from 'react'

const TicketPurchaseCard = ({
  ticket,
  quantity,
  onQuantityChange,
  attendees,
  onAttendeeChange,
  purchaserName,
  purchaserEmail
}) => {
  const total = useMemo(
    () => Number(ticket.price || 0) * quantity,
    [ticket.price, quantity]
  )

  const inventory = Number(ticket.quantity)
  const remaining = ticket.quantity == null || !Number.isFinite(inventory)
    ? 10
    : Math.max(0, inventory - Number(ticket.sold || 0))
  const soldOut = remaining <= 0
  const maxQuantity = Math.min(10, remaining)

  return (
    <div className='rounded-3xl border border-(--border) bg-(--surface) text-(--text-color) p-6 space-y-6'>
      <div className='flex justify-between items-start gap-4'>
        <div>
          <h3 className='text-xl font-bold'>{ticket.name}</h3>
          {ticket.description && (
            <p className='text-(--text-secondary) text-sm'>{ticket.description}</p>
          )}
        </div>

        <div className='text-right shrink-0'>
          <h2 className='text-2xl font-black text-(--primary)'>
            {Number(ticket.price) === 0
              ? 'FREE'
              : `${ticket.currency || '₦'}${Number(ticket.price).toLocaleString()}`}
          </h2>
          <p className='text-xs text-(--text-muted)'>{remaining} left</p>
        </div>
      </div>

      {!soldOut && (
        <div className='space-y-2'>
          <label className='text-sm text-(--text-secondary)'>Quantity</label>
          <div className='flex items-center justify-between rounded-2xl border border-(--border) bg-(--bg-color) p-2'>
            <button
              type='button'
              aria-label={`Remove one ${ticket.name} ticket`}
              onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
              disabled={quantity <= 0}
              className='w-12 h-12 rounded-xl bg-(--surface-hover) hover:bg-(--border) disabled:opacity-40 disabled:cursor-not-allowed text-xl font-bold transition'
            >
              −
            </button>

            <span className='text-2xl font-bold w-12 text-center'>{quantity}</span>

            <button
              type='button'
              aria-label={`Add one ${ticket.name} ticket`}
              onClick={() => onQuantityChange(Math.min(maxQuantity, quantity + 1))}
              disabled={quantity >= maxQuantity}
              className='w-12 h-12 rounded-xl bg-(--primary) hover:bg-(--primary-hover) disabled:opacity-40 disabled:cursor-not-allowed text-white text-xl font-bold transition'
            >
              +
            </button>
          </div>
          <p className='text-xs text-(--text-muted)'>
            Maximum {maxQuantity} ticket{maxQuantity === 1 ? '' : 's'} per purchase
          </p>
        </div>
      )}

      {quantity > 0 && Number(ticket.price) > 0 && (
        <div className='rounded-xl border border-(--border) bg-(--bg-color) p-4 flex justify-between'>
          <span>Subtotal</span>
          <span className='font-bold text-(--primary)'>
            {ticket.currency || '₦'}
            {total.toLocaleString()}
          </span>
        </div>
      )}

      {quantity > 0 && (
        <div className='space-y-4'>
          <div>
            <h4 className='font-semibold'>Ticket holder details</h4>
            <p className='text-sm text-(--text-secondary)'>
              Your account is the purchaser. Enter the details of the person who will use each ticket.
            </p>
          </div>
          {Array.from({ length: quantity }, (_, index) => {
            const person = attendees[index] || { name: '', email: '' }
            const isPurchaser = person.isBuyer === true

            return (
              <div
                key={index}
                className='space-y-3 border-t border-(--border) pt-4'
              >
                <h5 className='font-medium'>Ticket holder {index + 1}</h5>
                {purchaserEmail && (
                  <label className='flex items-center gap-2 text-sm text-(--text-secondary)'>
                    <input
                      type='checkbox'
                      checked={isPurchaser}
                      onChange={event =>
                        onAttendeeChange(index, 'isBuyer', event.target.checked)
                      }
                      className='accent-(--primary)'
                    />
                    This ticket is for me
                  </label>
                )}
                <input
                  value={isPurchaser ? purchaserName : person.name}
                  placeholder='Ticket holder full name'
                  autoComplete='off'
                  readOnly={isPurchaser}
                  onChange={event =>
                    onAttendeeChange(index, 'name', event.target.value)
                  }
                  className='w-full rounded-xl p-3 border border-(--border) bg-(--bg-color) text-(--text-color) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-(--primary) read-only:opacity-70'
                />
                <input
                  type='email'
                  value={isPurchaser ? purchaserEmail : person.email}
                  placeholder='Ticket holder email'
                  autoComplete='off'
                  readOnly={isPurchaser}
                  onChange={event =>
                    onAttendeeChange(index, 'email', event.target.value)
                  }
                  className='w-full rounded-xl p-3 border border-(--border) bg-(--bg-color) text-(--text-color) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-(--primary) read-only:opacity-70'
                />
              </div>
            )
          })}
        </div>
      )}

      {soldOut && (
        <button
          type='button'
          disabled
          className='w-full rounded-xl bg-(--danger) py-4 font-bold text-white'
        >
          SOLD OUT
        </button>
      )}
    </div>
  )
}

export default TicketPurchaseCard
