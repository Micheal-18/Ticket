import React from 'react'
import register from "../assets/register.png"
import create from "../assets/create.png"
import event from "../assets/event.png"
import { FaCalendar, FaLocationArrow } from 'react-icons/fa6'

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
        <header data-aos="zoom-out"  className='flex flex-1 flex-col items-center justify-center text-black  uppercase space-y-3'>
          <h1 className='lg:text-9xl md:text-8xl text-5xl tracking-tighter font-bold'>airticks<span className='text-orange-500'>.event</span></h1>
          <div className='border-y-2 py-4 '>
            <p className='lg:text-6xl md:text-5xl text-2xl font-semibold'>magical meeting places</p>
          </div>
          <a href='/event'><button className='bg-orange-500 p-2 rounded-lg hover:scale-105 '>Discover Events</button></a>
        </header>
      </section>

      <section className='relative w-full min-h-screen bg-yellow-400 p-4 z-40'>
        <div data-aos="fade-out"  className='flex flex-col space-y-2 '>
          <h1 className='uppercase md:text-6xl text-5xl font-bold mt-4'>Categories</h1>
          <div className='flex custom-scrollbar py-8 space-x-4'>
            <a className='p-4 uppercase bg-black text-[#eeeeee] rounded-full'>All</a>
            {categories.map((cate) => (
              <a className='p-4  uppercase rounded-full bg-[#eeeeee]' href={cate.link}>{cate.title}</a>
            ))}
          </div>
        </div>

        <div data-aos="fade-out"  className='flex flex-col space-y-6 justify-center items-center mx-auto w-full max-w-6xl px-4'>
            <div data-aos="fade-up"  className='flex lg:flex-row flex-col  lg:justify-between items-center w-full bg-[#eeeeee] flex-1 gap-10 relative py-10 px-8   rounded-3xl'>
              <div className='space-y-4 flex flex-col justify-center items-center'>
                <h1 className='uppercase text-center md:text-6xl text-4xl font-bold mt-4'>Register</h1>
              <p className='text-gray-700 md:text-lg text-sm text-center max-w-2xl mt-2'>Join airtiks.event today and unlock a world of unforgettable experiences. Create your account now to discover, book, and attend the best events around you!</p>
              </div>

              <div className='rounded-xl overflow-hidden'>
                <img src={register} className='object-cover h-50 w-80 hover:scale-105 duration-500 rounded-2xl' />
              </div>
            </div>
            <div data-aos="fade-up"  className='flex lg:flex-row flex-col  lg:justify-between items-center w-full bg-[#eeeeee] flex-1 gap-10 relative py-10 px-8   rounded-3xl'>
              <div className='space-y-4 flex flex-col justify-center items-center'>
                <h1 className='uppercase text-center md:text-6xl text-4xl font-bold mt-4'>Create Events</h1>
              <p className='text-gray-700 md:text-lg text-sm text-center max-w-2xl mt-2'>Are you an event organizer? Create and manage your events effortlessly with our user-friendly platform. Reach a wider audience and boost your event's success!</p>
              </div>

              <div className='rounded-xl overflow-hidden'>
                <img src={create} className='object-cover h-50 w-80 hover:scale-105 duration-500 rounded-2xl' />
              </div>
            </div>
            <div data-aos="fade-up"  className='flex lg:flex-row flex-col  lg:justify-between items-center w-full bg-[#eeeeee] flex-1 gap-10 relative py-10 px-8   rounded-3xl'>
              <div className='space-y-4 flex flex-col justify-center items-center'>
                <h1 className='uppercase text-center  md:text-6xl text-4xl font-bold mt-4'>Upcoming Events</h1>
              <p className='text-gray-700 md:text-lg text-sm text-center max-w-2xl mt-2'>Explore our curated selection of upcoming events, from electrifying concerts to inspiring workshops. Find your next unforgettable experience here!</p>
              </div>

              <div className='rounded-xl overflow-hidden'>
                <img src={event} className='object-cover h-50 w-80 hover:scale-105 duration-500 rounded-2xl' />
              </div>
            </div>
            
          {/* <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
            {data.map((Update) => (
              <div className='flex justify-center items-center bg-[#eeeeee] flex-1 gap-10 relative py-10 px-8   rounded-3xl'>
                <h1>Create Events</h1>
                {/* <span className='space-y-2 flex flex-col'>
                  <h1 className='font-bold uppercase text-2xl w-[150px] truncate lg:w-auto lg:whitespace-normal lg:overflow-visible'>{Update.title}</h1>
                  <p className='md:text-lg text-sm font-regular text-gray-500 flex gap-2 items-center'><FaCalendar />{Update.date}</p>
                  <p className='md:text-lg text-md font-regular text-gray-500 flex gap-2 items-center'><FaLocationArrow />{Update.location}</p>
                  <span className='flex  justify-between items-end gap-4'>
                    <p className='font-bold text-lg text-orange-500'>${Update.price}</p>
                    <button className='bg-orange-500 p-2 rounded-lg hover:scale-105 '>Buy Ticket</button>
                  </span> 
                </span> 

                <span className='overflow-hidden rounded-xl'>
                  <img src={Update.image} className='object-cover md:h-50 h-30 w-50 md:w-50 hover:scale-105 duration-500 rounded-2xl' />
                </span>
              </div>
            ))}
          </div> */}
        </div>
      </section>
      <section className='flex flex-col justify-center items-center pt-10 w-full h-[50vh]'>
        <div data-aos="fade-out"  className='border-t-2 border-gray-400 '>
          <h1 className='lg:text-9xl md:text-8xl mt-15 text-6xl font-bold'>airtiks<span className='text-orange-500'>.event</span></h1>
        </div>
      </section>
    </>
  )
}

export default Home
