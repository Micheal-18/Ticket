import React, { useEffect, useState } from 'react'
import { FaMoon, FaSun } from 'react-icons/fa';
import { FiSun, FiMoon } from 'react-icons/fi';

const Darkmode = () => {

    const [darkMode, setDarkMode] = useState(false);

    const toggleDarkMode = () => {
        localStorage.setItem('darkMode', !darkMode);
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle('dark', !darkMode);
    }

    useEffect(() => {
        const storedDarkMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(storedDarkMode);
        document.documentElement.classList.toggle('dark', storedDarkMode);
    }, []);

  return (
    <div className='flex justify-center items-center p-2' onClick={toggleDarkMode}>
        <div className='flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 cursor-pointer'>
            {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800 dark:text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" onClick={toggleDarkMode}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-10.34l-.707.707M5.05 5.05l-.707.707m14.142 14.142l-.707-.707M5.05 18.95l-.707-.707M21 12h-1m-16 0H3m16.95-6.95l-.707.707M5.05 18.95l-.707-.707M18.95 5.05l-.707-.707M7.05 18.95l-.707-.707" />
            </svg> */}
            <div className='text-[var(--brandMoon)] dark:text-[var(--brandMoon)]' >
                {darkMode ? <FaMoon /> : <FiSun />}
            </div>
        </div>

        {/* <div className='hidden md:flex ml-2 text-[var(--brandMoon)] dark:' >Toggle Dark Mode</div>      */}
    </div>
  )
}

export default Darkmode