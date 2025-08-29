import React, { useState } from 'react'
import { FiMenu, FiX } from 'react-icons/fi'
import { RiDashboardLine, RiLogoutBoxLine, RiProfileLine, RiTicket2Line, RiUser3Line } from 'react-icons/ri';
import { href, Link, useNavigate } from 'react-router-dom';
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";


const Navbar = ({ currentUser }) => {
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);

  const handleOpen = () => {
    setOpen(!open)
  }

  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/"); // redirect after logout
  };

  const navItems = [
    {
      id: "Events",
      href: "/event"
    },
    {
      id: "Trending",
      href: "/"
    },
    {
      id: "Guide",
      href: '/'
    },
    {
      id: "Blogs",
      href: "/"
    }

  ]

  return (
    <section className='sticky w-full bg-[#eeeeee] flex top-0 z-50'>
      <div className='flex w-full items-center lg:justify-center flex-1 border border-b-4 lg:border-b-transparent border-b-gray-700 justify-between px-6 font-bold text-gray-900'>
        <div className='border py-10 lg:py-5.5  lg:px-20 border-x-transparent lg:border-x-black lg:border-t-transparent border-y-transparent lg:border-y-black'>
          <a className='text-black text-lg'>AirTicks<span className='text-orange-500'>Events</span></a>
        </div>
        <div className='hidden lg:flex'>
          {navItems.map((item, idx) => (
            <div key={idx} className='border hover:bg-yellow-400 hidden lg:flex py-6 px-16 border-t-transparent'>
              <a href={item.href}>{item.id}</a>
            </div>
          ))}

          {!currentUser ? (
            <a
              href="/Register"
              className="bg-orange-500 flex items-center py-3 px-16 text-white hover:bg-orange-600"
            >
              Register
            </a>
          ) : (
            <div onClick={() => setDropdown(!dropdown)} className="relative flex items-center bg-orange-500 py-3 px-16">
              <h1 className='text-gray-700'>{currentUser?.fullName?.slice(0,2)}</h1>
              <RiUser3Line
                className="text-3xl cursor-pointer hover:scale-105"
              />

              {dropdown && (
                <div className="absolute top-20 right-2 mt-3 w-48 bg-white rounded-xl shadow-lg border z-50">
                  <ul className="flex flex-col py-2">
                    {currentUser?.isAdmin && (
                      <li onClick={() => navigate("/create")} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 cursor-pointer"><RiTicket2Line />Create Event</li>
                    )}
                    <li
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 cursor-pointer"
                    >
                      <RiLogoutBoxLine /> Logout
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}

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


      <div onClick={handleOpen} className={`lg:hidden fixed top-40 px-6 left-0 z-40 h-full w-[60%] bg-[#eeeeee] shadow-md transform transition-all duration-1000 ease-in-out ${open ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
        }`}>
        <div className='p-6 flex flex-col gap-8'>
          {navItems.map((item, idx) => (
            <a key={idx} href={item.href} className="hover:text-orange-500">
              {item.id}
            </a>
          ))}

          {!currentUser ? (
            <a
              href="/Register"
              className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600"
            >
              Register
            </a>
          ) : (
            <div className="flex flex-col gap-2">
              {currentUser?.isAdmin && (
                <button
                  onClick={() => navigate("/create")}
                  className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  CreateEvents
                </button>
              )}

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

    </section>
  )
}

export default Navbar