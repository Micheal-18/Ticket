import React from 'react'
import { FaFacebook, FaInstagram, FaXTwitter } from 'react-icons/fa6'

const Footer = () => {
    return (
        <footer className='sticky flex flex-col items-center justify-center mx-auto w-full h-[100%]'>
            <div className='lg:flex items-center justify-between border-t-2 border-gray-400 w-full mb-8 mt-8 pt-6 px-4 '>
                <div className='flex justify-center flex-col mb-4 '>
                    <h1 className='text-2xl font-bold '>Airticks<span className='text-orange-500'>Event</span></h1>
                    <p className='text-sm text-gray-500'>Plan. Create. Enjoy.</p>
                    <div className='flex gap-4 mt-4  text-xl cursor-pointer'>
                        <a className='text-orange-500 hover:text-gray-500 active:scale-90'><FaInstagram /></a>
                        <a className='text-orange-500 hover:text-gray-500 active:scale-90'><FaXTwitter /></a>
                        <a className='text-orange-500 hover:text-gray-500 active:scale-90'><FaFacebook /></a>
                    </div>
                </div>
                <div className='flex flex-col space-y-4'>
                    {/* Links */}
                    <div className='flex lg:flex-row flex-col gap-6 text-sm uppercase'>
                        <a href='#' className='hover:text-orange-500 transition'>Privacy & Policy</a>
                        <a href='#' className='hover:text-orange-500 transition'>Terms & Condition</a>
                        <a href='/contact' className='hover:text-orange-500 transition'>Contact Us</a>
                    </div>

                    {/* Copyright */}
                    <div className='flex gap-4 mt-6 md:mt-0  text-sm'>
                        <p>All in fund © 2025</p>
                        <p>Created by <a className='text-orange-500' href='https://real-michael.vercel.app/'>Real Michael</a></p>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer