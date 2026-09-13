import React from 'react'
import { FaFacebook, FaInstagram, FaXTwitter } from 'react-icons/fa6'

const Footer = () => {
  return (
    <footer className='w-full border-t border-[var(--border)] bg-[var(--surface)] text-[var(--text-color)]'>
      <div className='mx-auto flex max-w-7xl flex-col gap-10 px-4 py-10 lg:flex-row lg:items-end lg:justify-between'>
        <div className='flex flex-col gap-4'>
          <div className='text-2xl font-black tracking-tight'>
            Airticks <span className='text-[var(--primary)]'>Event</span>
          </div>
          <p className='max-w-md text-sm text-[var(--text-secondary)]'>
            Plan your next experience, create unforgettable moments, and make every ticket feel special.
          </p>
          <div className='flex items-center gap-3'>
            {[FaInstagram, FaXTwitter, FaFacebook].map((Icon, index) => (
              <a
                key={index}
                href='#'
                className='flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-color)] text-[var(--primary)] transition hover:-translate-y-0.5 hover:border-[var(--primary)] hover:text-[var(--text-color)] active:scale-95'
              >
                <Icon className='text-lg' />
              </a>
            ))}
          </div>
        </div>

        <div className='flex flex-col gap-5'>
          <div className='flex flex-col gap-3 text-sm font-medium text-[var(--text-secondary)] sm:flex-row'>
            <a href='#' className='transition hover:text-[var(--primary)]'>Privacy & Policy</a>
            <a href='#' className='transition hover:text-[var(--primary)]'>Terms & Condition</a>
            <a href='/contact' className='transition hover:text-[var(--primary)]'>Contact Us</a>
          </div>

          <div className='flex flex-col gap-2 text-sm text-[var(--text-secondary)] md:flex-row md:items-center'>
            <p>All in fund © 2025</p>
            <p>
              Created by{' '}
              <a className='font-semibold text-[var(--primary)] transition hover:text-[var(--text-color)]' href='https://real-michael.vercel.app/'>
                Real Michael
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer