import React, { useState } from 'react'
import { FiMenu, FiX } from 'react-icons/fi'


const Navbar = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(!open)
  }

  const navItems = ["Events", "Trending", "Concerts", "Blogs"]

  return (
    <section className='fixed w-full flex top-0 z-50'>
      <div className='flex w-full items-center lg:justify-center flex-1 border border-b-4 lg:border-b-transparent border-b-gray-700 justify-between px-6 font-bold text-gray-900'>
        <div className='border py-10 lg:py-6  lg:px-20 border-x-transparent lg:border-x-black lg:border-t-transparent border-y-transparent lg:border-y-black'>
          <a className='text-black text-lg'>Airways<span className='text-orange-500'>Events</span></a>
        </div>
        <div className='hidden lg:flex'>
          {navItems.map((item) => (
            <div className='border hover:bg-yellow-400 hidden lg:flex py-6 px-16 border-t-transparent'>
              <a href=''>{item}</a>
            </div>
          ))}
          <a className='bg-orange-500 hidden lg:flex py-6 px-18 text-white'>
            Register
          </a>
        </div>

        {/* Mobile Menu Button */}
         <button
          onClick={handleOpen}
          aria-label="Toggle menu"
          className="relative w-10 h-10 lg:hidden flex items-center justify-center text-3xl text-black cursor-pointer"
        >
          {/* Menu icon */}
          <FiMenu
            className={`absolute inset-0 m-auto origin-center transform transition-all duration-[1200ms] ease-in-out
              ${open ? "opacity-0 scale-0 rotate-180" : "opacity-100 scale-100 rotate-0"}`}
          />
          {/* Close icon */}
          <FiX
            className={`absolute inset-0 m-auto origin-center transform transition-all duration-[1200ms] ease-in-out
              ${open ? "opacity-100 scale-100 rotate-180" : "opacity-0 scale-0 rotate-0"}`}
          />
        </button>
      </div>


      <div className={`lg:hidden fixed top-40 px-6 left-0 z-40 h-full w-[60%] bg-[#eeeeee] shadow-md transform transition-all duration-1000 ease-in-out ${open ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
        }`}>
        <div className='p-6 flex flex-col gap-8'>
          {navItems.map((item, idx) => (
            <a key={idx} href="#" className="hover:text-orange-500">
              {item}
            </a>
          ))}
          <a href="#" className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600">
            Register
          </a>
        </div>
      </div>

    </section>
  )
}

export default Navbar