import React from 'react'

const Footer = () => {
    return (
        <footer className='sticky flex flex-col justify-center items-center mt-10 w-full h-[50vh]'>
            <div className='border-t-2 border-gray-400 '>
                <h1 className='lg:text-9xl md:text-8xl mt-15 text-6xl font-bold'>airticks<span className='text-orange-500'>event</span></h1>
            </div>
            <div className='flex flex-col md:flex-row items-center justify-between border-t-2 border-gray-400 w-full max-w-6xl mb-8 mt-10 pt-6'>
                {/* Links */}
                <div className='flex flex-wrap gap-6 text-gray-600 text-sm uppercase'>
                    <a href='#' className='hover:text-orange-500 transition'>Privacy & Policy</a>
                    <a href='#' className='hover:text-orange-500 transition'>Terms & Condition</a>
                    <a href='#' className='hover:text-orange-500 transition'>Contact Us</a>
                </div>

                {/* Copyright */}
                <div className='flex justify-between gap-4 mt-6 md:mt-0 text-gray-600 text-sm'>
                    <p>All in fund © 2025</p>
                    <p>Created by <a className='text-orange-500' href='https://real-michael.vercel.app/'>Real Michael</a></p>
                </div>
            </div>
        </footer>
    )
}

export default Footer