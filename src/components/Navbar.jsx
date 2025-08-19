import React, { useState } from 'react'
import { FiMenu, FiX } from 'react-icons/fi'


const Navbar = () => {
  const [open, setOpen] = useState(false);

  const navItems = ["Events", "Trending", "Concerts", "Blogs"]

  return (
    <section className='fixed w-full flex top-0 '>
      <div className='flex w-full lg:justify-center flex-1 border border-b-4 lg:border-b-transparent border-b-gray-700 justify-between px-6 font-bold text-gray-900'>
        <div className='border py-14 lg:py-6  lg:px-20 border-x-transparent lg:border-x-black lg:border-t-transparent border-y-transparent lg:border-y-black'>
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
        <div className="flex items-center lg:hidden text-3xl text-black cursor-pointer transition-transform duration-300">
          {open ? (
            <FiX onClick={() => setOpen(false)} className={` transition-all duration-[200ms] ease-in-out transform ${open ? "opacity-100 scale-100 rotate-180" : "opacity-100 scale-0 rotate-0"
              }`} />
          ) : (
            <FiMenu onClick={() => setOpen(true)} className={` transition-all duration-[200ms] ease-in-out transform ${open ? "opacity-100 scale-0 rotate-180" : "opacity-100 scale-100 rotate-0"
              }`} />
          )}
        </div>
      </div>


      <div className={`lg:hidden fixed top-40 px-6 left-0 h-full w-[60%] bg-[#eeeeee] shadow-md transform transition-all duration-1000 ease-in-out ${open ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
        }`}>
        <div className='flex flex-col gap-8'>
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