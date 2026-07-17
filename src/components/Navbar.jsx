import React, { useState } from 'react'
import { FiMenu, FiX } from 'react-icons/fi'
import { RiDashboard2Line, RiLogoutBoxLine, RiQrScanLine, RiTicket2Line, RiUser3Line } from 'react-icons/ri';
import { href, Link, useNavigate } from 'react-router-dom';
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { FaMoneyBillTrendUp, FaUserPlus } from 'react-icons/fa6';
import { SiEagle } from 'react-icons/si';
import Darkmode from './DarkMode';


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
      href: "/trending"
    },
    {
      id: "Guide",
      href: '/guide'
    },
    {
      id: "Blogs",
      href: "/blogs"
    }

  ]

  return (
    <section className='sticky w-full flex top-0 z-50'>
      <div className='flex w-full  bg-(--bg-color) dark:bg-(--bg-color) text-(--text-color) dark:text-(--text-color)  opacity-90 items-center lg:justify-center flex-1 border border-x-transparent  border-b-transparent  justify-between px-6 font-bold '>
        <div className='lg:border py-10 lg:py-5.5  lg:px-20 border-t-transparent  '>
          <a href='/' className='flex items-center space-x-2 cursor-pointer text-lg'><SiEagle className='text-(--primary) text-xl' />Airticks<span className='text-(--primary)'>Event</span></a>
        </div>
        <div className='hidden lg:flex'>
          {navItems.map((item, idx) => (
            <div key={idx} className='border  hover:bg-yellow-400 active:scale-90 hidden lg:flex border-t-transparent'>
              <a href={item.href} className='py-6 px-16'>{item.id}</a>
            </div>
          ))}

          {!currentUser ? (
            <a
              href="/Login"
              className="bg-(--primary) flex items-center py-3 px-16  cursor-pointer active:scale-90 hover:bg-(-primary)"
            >
              Login
            </a>
          ) : (
           <div 
  onClick={() => setDropdown(!dropdown)} 
  className="relative cursor-pointer flex items-center bg-(--primary) active:scale-90 py-3 px-16"
>
  <h1 className='text-gray-700'>{currentUser?.fullName?.slice(0, 2)}</h1>
  <RiUser3Line className="text-3xl cursor-pointer hover:scale-105" />

  {/* Smooth Dropdown Menu */}
  <div 
    className={`absolute top-18 right-0  w-44 bg-(--bg-color) dark:bg-(--bg-color) text-(--text-color) dark:text-(--text-color) border shadow-lg z-50 transform transition-all duration-300 ease-in-out
      ${dropdown 
        ? 'opacity-100 translate-x-0 scale-100 pointer-events-auto' 
        : 'opacity-0 translate-x-1/2 scale-95 pointer-events-none'
      }`}
  >
    <ul className="flex flex-col py-2">  
      {currentUser?.isAdmin && (
        <li onClick={() => navigate("/dashboard")} className="flex items-center gap-2 px-4 py-2 text-(-primary) hover:bg-gray-100 cursor-pointer">
          <FaUserPlus />Dashboard
        </li>
      )}

      <Darkmode />

      {currentUser?.accountType === "user" && (
        <li onClick={() => navigate("/dashboard/users")} className="flex items-center gap-2 px-4 py-2 text-(-primary) hover:bg-gray-100 cursor-pointer">
          <RiDashboard2Line />Dashboard
        </li>
      )}

      {currentUser?.accountType === "organization" && (
        <li onClick={() => navigate("/dashboard/organization")} className="flex items-center gap-2 px-4 py-2 text-(-primary) hover:bg-gray-100 cursor-pointer">
          <RiDashboard2Line />Dashboard
        </li>
      )}

      <li
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 cursor-pointer"
      >
        <RiLogoutBoxLine /> Logout
      </li>
    </ul>
  </div>
</div>
          )}

        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={handleOpen}
          aria-label="Toggle menu"
          className="relative w-10 h-10 lg:hidden flex items-center justify-center text-3xl text-(--text-color) dark:text-(--text-color)cursor-pointer"
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


      <div onClick={handleOpen} className={`lg:hidden fixed backdrop-lg top-24 px-6 left-0 z-40 h-full w-[60%] bg-(--bg-color) dark:bg-(--bg-color) text-(--text-color) dark:text-(--text-color) opacity-90 custom-scrollbar shadow-md transform transition-all duration-1000 ease-in-out ${open ? "translate-x-0 opacity-90" : "-translate-x-full opacity-0"
        }`}>
        <div className='p-6 flex flex-col gap-8 '>
          {navItems.map((item, idx) => (
            <a key={idx} href={item.href} className="hover:text-(--primary) active:scale-90 ">
              {item.id}
            </a>
          ))}
          <Darkmode />

          {!currentUser ? (
            <a
              href="/Login"
              className="bg-(--primary)  px-6 py-2  active:scale-90 hover:bg-(-primary)"
            >
              Login
            </a>
          ) : (
            <div className="flex flex-col  gap-2">

              {currentUser?.isAdmin && (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-4 py-2 bg-(--bg-color) dark:bg-(--bg-color)   active:scale-90 hover:bg-gray-200 dark:hover:bg-gray-400"
                >
                  Dashboard
                </button>
              )}

             
                {currentUser?.accountType === "user" && (
                  <button
                    onClick={() => navigate("/dashboard/users")}
                    className="px-4 py-2 bg-(--bg-color) dark:bg-(--bg-color)   active:scale-90 hover:bg-gray-200 dark:hover:bg-gray-400"
                  >
                    Dashboard
                  </button>
                )}

              {currentUser?.accountType === "organization" && (
                <button
                  onClick={() => navigate("/dashboard/organization")}
                  className="px-4 py-2 bg-(--bg-color) dark:bg-(--bg-color)   active:scale-90 hover:bg-gray-200 dark:hover:bg-gray-400"
                >
                 Dashboard
                </button>
              )}

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-(--bg-color) dark:bg-(--bg-color) text-red-600  active:scale-90 hover:bg-red-200"
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