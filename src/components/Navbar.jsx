import React, { useState } from 'react'
import { FiMenu, FiX } from 'react-icons/fi'
import { RiDashboard2Line, RiLogoutBoxLine, RiQrScanLine, RiTicket2Line, RiUser3Line } from 'react-icons/ri';
import { href, Link, useNavigate } from 'react-router-dom';
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { FaMoneyBillTrendUp } from 'react-icons/fa6';
import { SiEagle } from 'react-icons/si';


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
      <div className='flex w-full bg-gray-100 opacity-90 items-center lg:justify-center flex-1 border border-x-transparent border-b-4 lg:border-b-transparent border-b-gray-700 justify-between px-6 font-bold '>
        <div className='lg:border border-black py-10 lg:py-5.5  lg:px-20 border-t-transparent  '>
          <a href='/' className='flex items-center space-x-2 cursor-pointer text-[#333333] text-lg'><SiEagle className='text-orange-500 text-xl' />Airticks<span className='text-orange-500'>Event</span></a>
        </div>
        <div className='hidden lg:flex'>
          {navItems.map((item, idx) => (
            <div key={idx} className='border text-[#333333]  hover:bg-yellow-400 active:scale-90 hidden lg:flex border-t-transparent'>
              <a href={item.href} className='py-6 px-16'>{item.id}</a>
            </div>
          ))}

          {!currentUser ? (
            <a
              href="/Register"
              className="bg-orange-500 flex items-center py-3 px-16 text-white cursor-pointer active:scale-90 hover:bg-orange-600"
            >
              Register
            </a>
          ) : (
            <div onClick={() => setDropdown(!dropdown)} className="relative cursor-pointer flex items-center bg-orange-500 active:scale-90 py-3 px-16">
              <h1 className='text-gray-700'>{currentUser?.fullName?.slice(0, 2)}</h1>
              <RiUser3Line
                className="text-3xl cursor-pointer hover:scale-105"
              />

              {dropdown && (
                <div className="absolute top-20 right-2 mt-3 w-48 bg-white rounded-xl shadow-lg border z-50">
                  <ul className="flex flex-col py-2">
                    {/* {currentUser?.isAdmin && (
                       <li onClick={() => navigate("/create")} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 cursor-pointer"><RiTicket2Line />Create Event</li>
                    )} */}
                    {currentUser?.isAdmin && (
                      <li onClick={() => navigate("/dashboard")} className="flex items-center gap-2 px-4 py-2 text-orange-600 hover:bg-gray-100 cursor-pointer"><RiDashboard2Line />Dashboard</li>
                    )}

                    {/* {currentUser?.isAdmin && (
                      <li onClick={() => navigate("/scanner")} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 cursor-pointer"><RiQrScanLine />Scanner</li>
                    )}
                    {currentUser?.isAdmin && (
                      <li onClick={() => navigate("/tracking")} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 cursor-pointer"><FaMoneyBillTrendUp/>Analytic</li>
                    )} */}
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


      <div onClick={handleOpen} className={`lg:hidden fixed top-30 px-6 left-0 z-40 h-full w-[60%] bg-gray-100 opacity-90 custom-scrollbar shadow-md transform transition-all duration-1000 ease-in-out ${open ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
        }`}>
        <div className='p-6 flex flex-col gap-8 text-[#333333]'>
          {navItems.map((item, idx) => (
            <a key={idx} href={item.href} className="hover:text-orange-500 active:scale-90 ">
              {item.id}
            </a>
          ))}

          {!currentUser ? (
            <a
              href="/Register"
              className="bg-orange-500 text-white px-6 py-2 rounded-md active:scale-90 hover:bg-orange-600"
            >
              Register
            </a>
          ) : (
            <div className="flex flex-col  gap-2">
              {/* {currentUser?.isAdmin && (
                  <button
                  onClick={() => navigate("/create")}
                  className="px-4 py-2 bg-gray-100 rounded-md active:scale-90  hover:bg-gray-200"
                >
                  CreateEvents
                </button>
                )} */}
              {/* {currentUser?.isAdmin && (
                <button
                  onClick={() => navigate("/scanner")}
                  className="px-4 py-2 bg-gray-100 rounded-md active:scale-90 hover:bg-gray-200"
                >
                  Scanner
                </button>
              )} */}


              {currentUser?.isAdmin && (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-4 py-2 bg-gray-100 rounded-md active:scale-90 hover:bg-gray-200"
                >
                  Dashboard
                </button>
              )}

              {/* {currentUser?.isAdmin && (
                <button
                  onClick={() => navigate("/tracking")}
                  className="px-4 py-2 bg-gray-100 rounded-md active:scale-90 hover:bg-gray-200"
                >
                  Analytic
                </button>
              )} */}

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-100 text-red-600 rounded-md active:scale-90 hover:bg-red-200"
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