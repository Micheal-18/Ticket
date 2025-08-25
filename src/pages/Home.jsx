import React from 'react'
import unbox from "../assets/unbox.JPG"
import astera from "../assets/Astera.jpg"
import rep from "../assets/rep.jpg"
import { FaCalendar, FaLocationArrow } from 'react-icons/fa6'

const Home = () => {

  const data = [
    {

      title: "Unboxed party, Akwa",
      date: "Sat,Aug 23rd, 5pm",
      location: "Ikpeazu Stadium, Akwa",
      price: 300,
      image: unbox,
    },
    {

      title: "Astera",
      date: "Sat,Aug 31st, 10pm",
      location: "Grace Manor, Pusle Night Life",
      price: 300,
      image: astera,
    },
    {

      title: "Unboxed party, UNN. ",
      date: "Sat,Aug 23rd, 5pm",
      location: "The Verde",
      price: 300,
      image: rep,
    }
  ]

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
        <header className='flex flex-1 flex-col items-center justify-center text-black  uppercase space-y-3'>
          <h1 className='lg:text-9xl md:text-8xl text-5xl tracking-tighter font-bold'>airticks event</h1>
          <div className='border-y-2 py-4 '>
            <p className='lg:text-6xl md:text-5xl text-2xl font-semibold'>magical meeting places</p>
          </div>
        </header>
      </section>

      <section className='relative w-full min-h-screen bg-yellow-400 p-4 z-40'>
        <div className='flex flex-col space-y-2 '>
          <h1 className='uppercase md:text-6xl text-5xl font-bold mt-4'>Categories</h1>
          <div className='flex custom-scrollbar py-8 space-x-4'>
            <a className='p-4 uppercase bg-black text-[#eeeeee] rounded-full'>All</a>
            {categories.map((cate) => (
              <a className='p-4  uppercase rounded-full bg-[#eeeeee]' href={cate.link}>{cate.title}</a>
            ))}
          </div>
        </div>

        <div className='flex justify-center items-center mx-auto w-full max-w-6xl px-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
            {data.map((Update) => (
              <div className='flex justify-between flex-1 gap-10 relative py-10 px-8  h-[300px] bg-[#eeeeee]   rounded-3xl'>
                <span className='space-y-2 flex flex-col'>
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
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
