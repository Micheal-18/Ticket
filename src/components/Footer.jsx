import React from 'react'

const Footer = () => {
    return (
        <footer className='sticky flex flex-col justify-center items-center mx-4  w-full h-[20vh]'>
            <div className='flex flex-col   border-t-2 border-gray-400 w-full max-w-6xl mb-8 mt-8 pt-6'>
                {/* Links */}
                <div className='flex flex-col gap-6 text-gray-600 text-sm uppercase'>
                    <a href='#' className='hover:text-orange-500 transition'>Privacy & Policy</a>
                    <a href='#' className='hover:text-orange-500 transition'>Terms & Condition</a>
                    <a href='#' className='hover:text-orange-500 transition'>Contact Us</a>
                </div>

                {/* Copyright */}
                <div className='flex gap-4 mt-6 md:mt-0 text-gray-600 text-sm'>
                    <p>All in fund © 2025</p>
                    <p>Created by <a className='text-orange-500' href='https://real-michael.vercel.app/'>Real Michael</a></p>
                </div>
            </div>
        </footer>
    )
}

export default Footer