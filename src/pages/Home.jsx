import React, { useEffect, useState } from 'react'
import register from "../assets/register.png"
import create from "../assets/create.png"
import event from "../assets/event.png"
import { FaCalendar, FaLocationArrow } from 'react-icons/fa6'
import walkGif from "../assets/dog.gif"
import { collection, getDocs, query, where, orderBy, } from "firebase/firestore";

import { db } from '../firebase/firebase'
import { FaEllipsisV } from 'react-icons/fa'
import OptimizedImage from '../components/OptimizedImage'
import Spinner from '../components/Spinner'
import { Link } from 'react-router-dom'

const Home = ({currentUser}) => {
  const [events, setEvents] = useState([]);
  const [blog, setBlog] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["Arts",
    "Business", "Education", "Entertainment", "Food", "Health", "Music", "Networking", "Sports", "Technology",
    "Workshops"
  ];

  // ✅ Fetch Events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        const eventsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const isAdmin = currentUser?.isAdmin === true;

        const visibleEvents = isAdmin
          ? eventsData
          : eventsData.filter(event => event.status === "approved");

        setEvents(visibleEvents);

      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, [setEvents]);

  // ✅ Fetch Blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        // Fetch only approved blogs
        const q = query(
          collection(db, "blogs"),
          where("status", "==", "approved"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const blogsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBlog(blogsData);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };
    fetchBlogs();
  }, [setBlog]);

  // ✅ Category Filtering (safe)
  const filteredEvents =
    selectedCategory === "All"
      ? events
      : events.filter((event) => event?.category === selectedCategory);

  const filteredBlogs =
    selectedCategory === "All"
      ? blog
      : blog.filter(
        (b) =>
          b?.content?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
          b?.title?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
          b?.tags?.some((t) =>
            t.toLowerCase().includes(selectedCategory.toLowerCase())
          )
      );


  // ✅ Optional Loading UI
  if (!events.length && !blog.length) {
    return (
      <div className='flex space-x-2 justify-center items-center h-screen'>
        <Spinner />
      </div>
    );
  }

  return (
    <>
      {/* HERO */}
      <section className='relative min-h-screen bg-(--bg-color) dark:bg-(--bg-color) text-(--text-color) dark:text-(--text-color) w-full flex flex-col lg:mt-5 mt-4 flex-1 items-center justify-center z-10'>
        <header data-aos="zoom-out" className='flex flex-1 flex-col items-center justify-center uppercase space-y-3'>
          <h1 className='lg:text-9xl md:text-8xl text-5xl tracking-tighter font-bold'>
            airticks<span className='text-orange-500'>event</span>
          </h1>
          <div className='border-y-2 py-4'>
            <p className='lg:text-6xl md:text-5xl text-2xl font-semibold'>
              magical meeting places
            </p>
          </div>
          <a href='/event'>
            <button className='bg-orange-500 p-2 rounded-lg hover:bg-orange-600 active:scale-90'>
              Discover Events
            </button>
          </a>
        </header>
      </section>


      {/* CATEGORY */}
      <section className='relative w-full min-h-screen border-t-2 border-gray-900  p-4 z-40'>
        <div data-aos="fade-out" className='flex flex-col  space-y-2'>
          <h1 className='uppercase md:text-6xl text-5xl font-bold mt-4'>Categories</h1>
          <div className='flex custom-scrollbar py-8 space-x-4 overflow-x-auto'>
            <button
              onClick={() => setSelectedCategory("All")}
              className={`p-4 uppercase rounded-full ${selectedCategory === "All"
                ? 'bg-[#333333] text-[#eeeeee]'
                : 'bg-[#eeeeee] text-[#333333]'
                }`}
            >
              All
            </button>
            {categories.map((cate) => (
              <button
                key={cate}
                onClick={() => setSelectedCategory(cate)}
                className={`p-4 flex items-center uppercase rounded-full ${selectedCategory === cate
                  ? 'bg-[#333333] text-[#eeeeee]'
                  : 'bg-[#eeeeee] text-[#333333]'
                  }`}
              >
                {cate}
              </button>
            ))}
          </div>
        </div>

        {/* EVENTS */}
        <h2 className='text-2xl font-bold mb-4 mt-8 uppercase'>🔥 Events</h2>
        <div
          data-aos="fade-up"
          className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-8 my-8 place-items-center'
        >
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <a href={`/event/${event.slug}`} key={event.id} className='w-full'>
                <div className='relative flex flex-col cursor-pointer group  bg-(--bg-color) dark:bg-(--bg-color) text-(--text-color) dark:text-(--text-color) rounded-2xl p-2'>
                  <div className='overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300'>
                    <img
                      src={event.photoURL || "/fallback.jpg"}
                      alt='event'
                      className='object-cover h-[220px] w-full hover:scale-105 duration-500 rounded-2xl'
                    />
                  </div>
                  <div className='space-y-2 mt-2'>
                    <h1 className='font-bold text-gray-700 uppercase text-2xl w-[100px] truncate lg:w-[250px] '>{event.name || "Untitled Event"}</h1>
                    <p className='text-xs text-gray-500 flex items-center gap-2'>
                      <FaCalendar />{" "}
                      {new Date(event.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p className='line-clamp-2 text-sm text-gray-600 flex items-center gap-2'>
                      <FaLocationArrow /> {event.location || "No location"}
                    </p>
                  </div>
                </div>
              </a>
            ))
          ) : (
            <p className='text-gray-700 text-lg font-medium col-span-full text-center'>
              No events found for this category.
            </p>
          )}
        </div>

        {/* BLOGS */}
        <h2 className='text-2xl font-bold mb-4 uppercase'>📰 Blogs</h2>
        <div
          className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 gap-y-8 sm:gap-4 md:gap-7 my-8 place-items-center'
        >
          {filteredBlogs.length > 0 ? (
            filteredBlogs.map((News) => (
              <div key={News.id} className='relative flex flex-col cursor-pointer group'>
                <FaEllipsisV className='absolute top-2 right-2 z-20 hover:scale-105 active:scale-90' />
                <div data-aos="fade-out" className='overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300'>
                  <OptimizedImage
                    src={News.photoURL || "/fallback.jpg"}
                    alt='data'
                    className='object-cover h-[220px] w-full hover:scale-105 duration-500 rounded-2xl'
                  />
                </div>
                <div className='space-y-2'>
                  <p data-aos="fade-up" className='text-xs text-gray-500'>
                    {News.published || "Recently"}
                  </p>
                  <h1 data-aos="fade-up" className='font-bold line-clamp-1'>
                    {News.title || "Untitled Blog"}
                  </h1>
                  <p data-aos="fade-up" className='line-clamp-2 text-sm text-gray-600'>
                    {News.description || "No description available"}
                  </p>
                </div>
                <Link to={`/blogs/${News.id}`} className='text-orange-500 hover:underline'>
                  Read More
                </Link>
              </div>
            ))
          ) : (
            <p className='text-gray-700 text-lg font-medium col-span-full text-center'>
              No blog posts found for this category.
            </p>
          )}
        </div>
      </section>

      <section className='relative w-full min-h-screen bg-[#e0d9d9] p-4 z-40'>
        <h1 className='uppercase md:text-6xl  text-5xl font-bold p-4'>Steps</h1>
        <div data-aos="fade-out" className='flex flex-col space-y-6 justify-center items-center mx-auto w-full max-w-6xl px-4'>
          <div data-aos="fade-up" className='flex lg:flex-row flex-col  lg:justify-between items-center w-full  bg-(--bg-color) dark:bg-(--bg-color) text-(--text-color) dark:text-(--text-color) flex-1 gap-10 relative py-10 px-8   rounded-3xl'>
            <div className='space-y-4 flex flex-col justify-center items-center'>
              <h1 className='uppercase text-center  md:text-6xl text-4xl font-bold mt-4'>Register</h1>
              <p className='md:text-lg text-sm text-center max-w-2xl mt-2'>Join airticks.event today and unlock a world of unforgettable experiences. Create your account now to discover, book, and attend the best events around you!</p>
            </div>

            <div className='rounded-xl overflow-hidden'>
              <img src={register} className='object-cover h-50 w-80 hover:scale-105 duration-500 rounded-2xl' />
            </div>
          </div>
          <div data-aos="fade-up" className='flex lg:flex-row flex-col  lg:justify-between items-center w-full  bg-(--bg-color) dark:bg-(--bg-color) text-(--text-color) dark:text-(--text-color) flex-1 gap-10 relative py-10 px-8   rounded-3xl'>
            <div className='space-y-4 flex flex-col justify-center items-center'>
              <h1 className='uppercase text-center  md:text-6xl text-4xl font-bold mt-4'>Create Events</h1>
              <p className=' md:text-lg text-sm text-center max-w-2xl mt-2'>Are you an event organizer? Create and manage your events effortlessly with our user-friendly platform. Reach a wider audience and boost your event's success!</p>
            </div>

            <div className='rounded-xl overflow-hidden'>
              <img src={create} className='object-cover h-50 w-80 hover:scale-105 duration-500 rounded-2xl' />
            </div>
          </div>
          <div data-aos="fade-up" className='flex lg:flex-row flex-col  lg:justify-between items-center w-full  bg-(--bg-color) dark:bg-(--bg-color) text-(--text-color) dark:text-(--text-color) flex-1 gap-10 relative py-10 px-8   rounded-3xl'>
            <div className='space-y-4 flex flex-col justify-center items-center'>
              <h1 className='uppercase text-center   md:text-6xl text-4xl font-bold mt-4'>Upcoming Events</h1>
              <p className=' md:text-lg text-sm text-center max-w-2xl mt-2'>Explore our curated selection of upcoming events, from electrifying concerts to inspiring workshops. Find your next unforgettable experience here!</p>
            </div>

            <div className='rounded-xl overflow-hidden'>
              <img src={event} className='object-cover h-50 w-80 hover:scale-105 duration-500 rounded-2xl' />
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <section className='flex flex-col justify-center items-center pt-10 w-full h-[50vh]'>
        <div data-aos="fade-out" className='border-t-2 border-gray-400'>
          <h1 className='lg:text-9xl md:text-8xl mt-15 text-6xl font-bold'>
            airticks<span className='text-orange-500'>.event</span>
          </h1>
        </div>
        <footer className='mt-10'>
          <img src={walkGif} alt='walking gif' className='w-20 h-20 animation-walk' />
        </footer>
      </section>
    </>
  );
};

export default Home;
