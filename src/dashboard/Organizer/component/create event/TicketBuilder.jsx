import React from 'react'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const TicketBuilder = ({ tickets, setTickets }) => {
  const addTicket = () => {
    setTickets([
      ...tickets,
      {
        id: crypto.randomUUID(),
        name: '',
        type: 'paid',
        currency: "NGN",
        price: '',
        quantity: 100,
        sold: 0,
        maxPerPerson: 2,
        salesStart: new Date(),
        salesEnd: new Date(),
        description: '',
        hidden: false
      }
    ])
  }

  const updateTicket = (id, field, value) => {
    setTickets(
      tickets.map(ticket =>
        ticket.id === id ? { ...ticket, [field]: value } : ticket
      )
    )
  }

  const removeTicket = id => {
    setTickets(tickets.filter(ticket => ticket.id !== id))
  }

  const safeParseDate = (value) => {
    if (!value) return new Date();
    
    let parsed;
    if (typeof value.toDate === 'function') {
      parsed = value.toDate();
    } else {
      parsed = new Date(value);
    }

    if (isNaN(parsed.getTime())) {
      return new Date();
    }
    return parsed;
  };

  return (
    <section className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold'>Tickets Management</h2>
          <p className='text-sm text-gray-500'>
            Configure ticket scaling parameters.
          </p>
        </div>
        <button
          type='button'
          onClick={addTicket}
          className='bg-(--primary) hover:bg-orange-600 text-white rounded-xl px-5 py-3 flex items-center gap-2 cursor-pointer transition'
        >
          <FiPlus /> Add Ticket
        </button>
      </div>

      {tickets.length === 0 && (
        <div className='border-2 border-dashed rounded-2xl p-10 text-center text-gray-500 dark:border-zinc-700'>
          No custom event tiers declared yet.
        </div>
      )}

      {tickets.map(ticket => (
        <div
          key={ticket.id}
          className='rounded-3xl border border-(--border) p-6 space-y-5'
        >
          <div className='flex justify-between items-center'>
            <h3 className='font-bold text-lg text-gray-700 dark:text-zinc-300'>
              Configuration Matrix
            </h3>
            <button
              type='button'
              onClick={() => removeTicket(ticket.id)}
              className='text-red-500 hover:text-red-700 transition'
            >
              <FiTrash2 size={20} />
            </button>
          </div>

          <div>
            <label className='font-semibold text-sm'>Ticket Name</label>
            <input
              className='mt-2 w-full border border-(--border) rounded-xl p-3 focus:outline-(--primary)'
              placeholder='VIP, Early Bird, General Admission...'
              value={ticket.name}
              onChange={e => updateTicket(ticket.id, 'name', e.target.value)}
            />
          </div>

          <div>
            <label className='font-semibold text-sm'>Tier Mode</label>
            <div className='flex gap-4 mt-2'>
              <button
                type='button'
                onClick={() => {
                  updateTicket(ticket.id, 'type', 'paid')
                }}
                className={`px-5 py-2.5 text-sm font-semibold rounded-xl border transition-all ${
                  ticket.type === 'paid'
                    ? 'bg-(--primary) text-white border-(--primary)'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                Paid
              </button>
              <button
                type='button'
                onClick={() => {
                  updateTicket(ticket.id, 'type', 'free')
                  updateTicket(ticket.id, 'price', 0)
                }}
                className={`px-5 py-2.5 text-sm font-semibold rounded-xl border border-(--border) transition-all ${
                  ticket.type === 'free'
                    ? 'bg-green-600 text-white border-green-600'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                Free
              </button>
            </div>
          </div>

          {ticket.type === 'paid' && (
            <div className='grid md:grid-cols-2 gap-5'>
              <div>
                <label className='font-semibold text-sm'>Price </label>
                <input
                  type='number'
                  min={0}
                  placeholder='5000'
                  value={ticket.price}
                  onChange={e =>
                    updateTicket(ticket.id, 'price', e.target.value)
                  }
                  className='mt-2 w-full border border-(--border) rounded-xl p-3 focus:outline-(--primary)'
                />
              </div>

              <div>
                <label className='font-semibold text-sm'>Currency</label>

                <select
                  value={ticket.currency}
                  onChange={e =>
                    updateTicket(ticket.id, 'currency', e.target.value)
                  }
                  className='mt-2 w-full border border-(--border) rounded-xl p-3 bg-transparent focus:outline-(--primary)'
                >
                  <option value='NGN'>🇳🇬 Nigerian Naira (₦)</option>
                  <option value='USD'>🇺🇸 US Dollar ($)</option>
                  <option value='GBP'>🇬🇧 British Pound (£)</option>
                </select>
              </div>
            </div>
          )}

          <div className='grid md:grid-cols-2 gap-5'>
            <div>
              <label className='font-semibold text-sm'>
                Total Supply Volume
              </label>
              <input
                type='number'
                min={1}
                value={ticket.quantity}
                onChange={e =>
                  updateTicket(ticket.id, 'quantity', Number(e.target.value))
                }
                className='mt-2 w-full border border-(--border) rounded-xl p-3 focus:outline-(--primary)'
              />
            </div>

            <div>
              <label className='font-semibold text-sm'>
                Purchase Limit (Per Order)
              </label>
              <input
                type='number'
                min={1}
                value={ticket.maxPerPerson}
                onChange={e =>
                  updateTicket(
                    ticket.id,
                    'maxPerPerson',
                    Number(e.target.value)
                  )
                }
                className='mt-2 w-full border border-(--border) rounded-xl p-3 focus:outline-(--primary)'
              />
            </div>
          </div>

<div className='grid md:grid-cols-2 gap-5'>
            <div>
              <label className='font-semibold text-sm'>
                Sales Window Start
              </label>
              <DatePicker
                selected={safeParseDate(ticket.salesStart)}
                onChange={date => {
                  if (!date || isNaN(date.getTime())) return;
                  updateTicket(ticket.id, 'salesStart', date);
                }}
                showTimeSelect
                dateFormat='Pp'
                className='mt-2 w-full border border-(--border) rounded-xl p-3 focus:outline-(--primary) bg-transparent'
              />
            </div>

            <div>
              <label className='font-semibold text-sm'>Sales Window End</label>
              <DatePicker
                selected={safeParseDate(ticket.salesEnd)}
                onChange={date => {
                  if (!date || isNaN(date.getTime())) return;
                  updateTicket(ticket.id, 'salesEnd', date);
                }}
                showTimeSelect
                dateFormat='Pp'
                className='mt-2 w-full border border-(--border) rounded-xl p-3 focus:outline-(--primary) bg-transparent'
              />
            </div>
          </div>

          <div>
            <label className='font-semibold text-sm'>Perks / Description</label>
            <textarea
              rows={2}
              placeholder='Access to VIP lounge, 1 complimentary drink...'
              value={ticket.description}
              onChange={e =>
                updateTicket(ticket.id, 'description', e.target.value)
              }
              className='mt-2 w-full border border-(--border) rounded-xl p-3 focus:outline-(--primary)'
            />
          </div>

          <label className='flex items-center gap-3 cursor-pointer selection:bg-transparent text-sm font-medium'>
            <input
              type='checkbox'
              checked={ticket.hidden}
              onChange={e =>
                updateTicket(ticket.id, 'hidden', e.target.checked)
              }
              className='accent-(--primary) h-4 w-4'
            />
            Hide ticket tier from public visibility
          </label>
        </div>
      ))}
    </section>
  )
}

export default TicketBuilder
