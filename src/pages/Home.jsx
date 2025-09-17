import React from 'react'
import register from "../assets/register.png"
import create from "../assets/create.png"
import event from "../assets/event.png"
import { FaCalendar, FaLocationArrow } from 'react-icons/fa6'
import walkGif from "../assets/dog.gif"

const Home = () => {

  const categories = [
    {
      title: "business",
      link: "/"
    },
    {
      title: "Branding",
      link: "/"
    },
    {
      title: "press",
      link: "/"
    },
    {
      title: "culture",
      link: "/"
    },
    {
      title: "more",
      link: "/"
    }
  ]

  return (
    <>
      <section className='relative min-h-screen w-full flex flex-col lg:mt-5 mt-4 flex-1 items-center justify-center z-10'>
        <header data-aos="zoom-out" className='flex flex-1 flex-col items-center justify-center  uppercase space-y-3'>
          <h1 className='lg:text-9xl md:text-8xl text-5xl tracking-tighter font-bold'>airticks<span className='text-orange-500'>.event</span></h1>
          <div className='border-y-2 py-4 '>
            <p className='lg:text-6xl md:text-5xl text-2xl font-semibold'>magical meeting places</p>
          </div>
          <a href='/event'><button className='bg-orange-500 p-2 rounded-lg hover:bg-orange-600 active:scale-90'>Discover Events</button></a>
        </header>
      </section>

      <section className='relative w-full min-h-screen bg-yellow-400 p-4 z-40'>
        <div data-aos="fade-out" className='flex flex-col space-y-2 '>
          <h1 className='uppercase md:text-6xl text-5xl font-bold mt-4'>Categories</h1>
          <div className='flex custom-scrollbar py-8 space-x-4'>
            <a className='p-4 uppercase bg-[#333333] text-[#eeeeee] rounded-full'>All</a>
            {categories.map((cate) => (
              <a className='p-4  uppercase rounded-full text-[#333333] bg-[#eeeeee]' href={cate.link}>{cate.title}</a>
            ))}
          </div>
        </div>

        <div data-aos="fade-out" className='flex flex-col space-y-6 justify-center items-center mx-auto w-full max-w-6xl px-4'>
          <div data-aos="fade-up" className='flex lg:flex-row flex-col  lg:justify-between items-center w-full bg-[#eeeeee] flex-1 gap-10 relative py-10 px-8   rounded-3xl'>
            <div className='space-y-4 flex flex-col justify-center items-center'>
              <h1 className='uppercase text-center text-[#333333] md:text-6xl text-4xl font-bold mt-4'>Register</h1>
              <p className='text-gray-700 md:text-lg  text-sm text-center max-w-2xl mt-2'>Join airticks.event today and unlock a world of unforgettable experiences. Create your account now to discover, book, and attend the best events around you!</p>
            </div>

            <div className='rounded-xl overflow-hidden'>
              <img src={register} className='object-contain h-50 w-full hover:scale-105 duration-500 rounded-2xl' />
            </div>
          </div>
          <div data-aos="fade-up" className='flex lg:flex-row flex-col  lg:justify-between items-center w-full bg-[#eeeeee] flex-1 gap-10 relative py-10 px-8   rounded-3xl'>
            <div className='space-y-4 flex flex-col justify-center items-center'>
              <h1 className='uppercase text-center text-[#333333] md:text-6xl text-4xl font-bold mt-4'>Create Events</h1>
              <p className='text-gray-700 md:text-lg text-sm text-center max-w-2xl mt-2'>Are you an event organizer? Create and manage your events effortlessly with our user-friendly platform. Reach a wider audience and boost your event's success!</p>
            </div>

            <div className='rounded-xl overflow-hidden'>
              <img src={create} className='object-contain h-50 w-full hover:scale-105 duration-500 rounded-2xl' />
            </div>
          </div>
          <div data-aos="fade-up" className='flex lg:flex-row flex-col  lg:justify-between items-center w-full bg-[#eeeeee] flex-1 gap-10 relative py-10 px-8   rounded-3xl'>
            <div className='space-y-4 flex flex-col justify-center items-center'>
              <h1 className='uppercase text-center text-[#333333]  md:text-6xl text-4xl font-bold mt-4'>Upcoming Events</h1>
              <p className='text-gray-700 md:text-lg text-sm text-center max-w-2xl mt-2'>Explore our curated selection of upcoming events, from electrifying concerts to inspiring workshops. Find your next unforgettable experience here!</p>
            </div>

            <div className='rounded-xl overflow-hidden'>
              <img src={event} className='object-contain h-50 w-full hover:scale-105 duration-500 rounded-2xl' />
            </div>
          </div>

        </div>
      </section>
      <section className='flex flex-col justify-center items-center pt-10 w-full h-[50vh]'>
        <div data-aos="fade-out" className='border-t-2 border-gray-400 '>
          <h1 className='lg:text-9xl md:text-8xl mt-15 text-6xl font-bold'>airticks<span className='text-orange-500'>.event</span></h1>
        </div>
        <footer className='mt-10'>
          <img src={walkGif} alt='walking gif' className='w-20 h-20 animation-walk' />
        </footer>
      </section>
    </>
  )
}

export default Home
