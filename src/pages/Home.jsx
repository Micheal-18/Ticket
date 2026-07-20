import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { motion, useAnimation } from 'framer-motion'

// Icons & Components
import { FaCalendar, FaClock, FaLocationArrow } from 'react-icons/fa6'
import OptimizedImage from '../components/OptimizedImage'
import Spinner from '../components/Spinner'
import Adsense from '../components/Adsense'
import { formatEventStatus } from '../utils/formatEventRange'

// Assets
import register from '../assets/register.png'
import create from '../assets/create.png'
import eventImg from '../assets/event.png'
import walkGif from '../assets/dog.gif'
import birdGif from '../assets/lilbirdie.gif'
import flySound from '../audio/fly.mp3'
import event from "../assets/unbox.JPG";

const Home = ({ currentUser }) => {
  const { log } = useParams()
  const [events, setEvents] = useState([])
  const [blog, setBlog] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')

  const text = 'airticks'

  const letterControls = text.split('').map(() => useAnimation())
  const birdControls = useAnimation()

  useEffect(() => {
    const animate = async () => {
      while (true) {
        // Reset bird
        await birdControls.set({
          x: -200,
          y: 50
        })

        // Bird flies across
        birdControls.start({
          x: window.innerWidth + 200,
          transition: {
            duration: 8,
            ease: 'linear'
          }
        })

        // Animate letters one after another
        for (let i = 0; i < text.length; i++) {
          setTimeout(() => {
            letterControls[i].start({
              y: [0, -18, 0],
              rotate: [0, -8, 8, 0],
              scale: [1, 1.18, 1],
              transition: {
                duration: 0.45
              }
            })
          }, i * 420)
        }

        await new Promise(resolve => setTimeout(resolve, 9000))
      }
    }

    animate()
  }, [])

  const categories = [
    'Arts',
    'Business',
    'Education',
    'Entertainment',
    'Food',
    'Health',
    'Music',
    'Networking',
    'Sports',
    'Technology',
    'Workshops'
  ]

  // ✅ Consolidated Safe Fetch API with Loading State
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch Events
        const eventsSnapshot = await getDocs(collection(db, 'events'))
        const eventsData = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        
        

        const isAdmin = currentUser?.isAdmin === true
        const visibleEvents = isAdmin
          ? eventsData
          : eventsData.filter(event => event.status === 'approved')
        setEvents(visibleEvents)

        // Fetch Blogs (ordered by date)
        const blogQuery = query(
          collection(db, 'blogs'),
          where('approved', '==', true),
          orderBy('createdAt', 'desc')
        )
        const blogSnapshot = await getDocs(blogQuery)
        const blogsData = blogSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setBlog(blogsData)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [currentUser?.isAdmin]) // Safeguards admin re-fetches

  // ✅ Category Filtering (safe)
const filteredEvents = [...events]
  .sort((a, b) => {
    const aDate = a.createdAt?.seconds
      ? a.createdAt.toDate()
      : new Date(a.createdAt);

    const bDate = b.createdAt?.seconds
      ? b.createdAt.toDate()
      : new Date(b.createdAt);

    return bDate - aDate; // newest first
  })
  .filter(event =>
    selectedCategory === "All"
      ? true
      : event?.category === selectedCategory
  );

  
  const filteredBlogs =
    selectedCategory === 'All'
      ? blog
      : blog.filter(
          b =>
            b?.content
              ?.toLowerCase()
              .includes(selectedCategory.toLowerCase()) ||
            b?.title?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
            b?.tags?.some(t =>
              t.toLowerCase().includes(selectedCategory.toLowerCase())
            )
        )

  // ✅ Fixed Loading Condition
  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen bg-(--bg-color)'>
        <Spinner />
      </div>
    )
  }

  return (
    <>
      {/* HERO */}
      <section className='relative min-h-screen bg-(--bg-color) dark:bg-(--bg-color) text-(--text-color) dark:text-(--text-color) w-full flex items-center justify-center z-10 overflow-hidden '>
        <header
          data-aos='zoom-out'
          className='h-[50vh] md:min-h-screen flex flex-1 flex-col items-center justify-center uppercase space-y-6 text-center px-4'
        >
          <motion.h1 className='relative lg:text-8xl md:text-8xl text-3xl font-black tracking-tight'>
            {text.split('').map((letter, index) => (
              <motion.span
                key={index}
                animate={letterControls[index]}
                whileHover={{
                  y: -8,
                  color: '#f97316'
                }}
                className='inline-block'
              >
                {letter}
              </motion.span>
            ))}

            <motion.span
              initial={{
                opacity: 0
              }}
              animate={{
                opacity: 1
              }}
              transition={{
                delay: 5
              }}
              className='ml-2 bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-600 bg-clip-text text-transparent'
            >
              event
            </motion.span>
          </motion.h1>
          <motion.img
            src={birdGif}
            alt='bird'
            animate={birdControls}
            className='absolute top-0 left-0 w-10 md:w-14 pointer-events-none z-40'
          />

          <div className='border-y-2 py-4 px-6 border-gray-700/50'>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className='text-2xl md:text-5xl font-semibold'
            >
              Discover. <span className='text-(--primary)'>Connect.</span>{' '}
              Experience.
            </motion.p>
          </div>

          {/* Ambient Blurred Background Elements */}
          <div className='absolute top-10 left-10 w-80 h-80 rounded-full bg-(--primary)/20 blur-[150px] animate-pulse pointer-events-none' />
          <div className='absolute bottom-0 right-10 w-96 h-96 rounded-full bg-yellow-400/10 blur-[180px] animate-pulse pointer-events-none' />
        
          {/* Particle Effects */}
          <div className='absolute inset-0 overflow-hidden pointer-events-none'>
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className='absolute rounded-full bg-amber-400/70'
                style={{
                  width: Math.random() * 14 + 2,
                  height: Math.random() * 10 + 2,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`
                }}
                animate={{
                  y: [0, -40, 0],
                  opacity: [0, 0.8, 0]
                }}
                transition={{
                  duration: Math.random() * 5 + 5,
                  repeat: Infinity,
                  delay: Math.random() * 5
                }}
              />
            ))}
          </div>

          <div className='flex flex-col items-center gap-4'>
            <Link to='/event'>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    '0 0 0px rgba(249, 115, 22, 0)',
                    '0 0 20px rgba(249, 115, 22, 0.6)',
                    '0 0 0px rgba(249, 115, 22, 0)'
                  ]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2
                }}
                className='bg-(--primary) hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-semibold transition-colors'
              >
                Discover Events
              </motion.button>
            </Link>
          </div>

        </header>
      </section>

      <div className='my-10 flex justify-center'>
        <Adsense />
      </div>

      {/* CATEGORIES */}
      <section className='relative w-full min-h-screen border-t border-gray-800 p-4 z-40'>
        <div data-aos='fade-out' className='flex flex-col space-y-2'>
          <h1 className='uppercase md:text-6xl text-5xl font-bold mt-4'>
            Categories
          </h1>
          <div className='flex custom-scrollbar py-8 space-x-4 overflow-x-auto'>
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-6 py-3 uppercase rounded-full font-medium transition-all duration-300 ${
                selectedCategory === 'All'
                  ? 'bg-(--primary) '
                  : 'bg-(--surface) hover:bg-(--surface-hover)'
              }`}
            >
              All
            </button>
            {categories.map(cate => (
              <button
                key={cate}
                onClick={() => setSelectedCategory(cate)}
                className={`px-6 py-3 flex items-center uppercase rounded-full font-medium transition-all duration-300 whitespace-nowrap ${
                  selectedCategory === cate
                    ? 'bg-(--primary) text-white'
                    : 'bg-(--surface) hover:bg-(--surface-hover) '
                }`}
              >
                {cate}
              </button>
            ))}
          </div>
        </div>

        {/* EVENTS SECTION */}
        <h2 className='text-2xl font-bold mb-4 mt-8 uppercase'>🔥 Events</h2>
        <div
          data-aos='fade-up'
          className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-8 my-8 place-items-center'
        >
          {filteredEvents.length > 0 ? (
            filteredEvents.map(event => (
              <Link
                to={`/event/${event.slug}`}
                key={event.id}
                className='w-full'
              >
                <div className='relative flex flex-col cursor-pointer group bg-(--bg-color) dark:bg-(--bg-color) text-(--text-color) dark:text-(--text-color) rounded-2xl p-2'>
                  <div className='overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300'>
                    <img
                      src={event.photoURL || event.photo || '/fallback.jpg'}
                      alt={event.name || 'event'}
                      className='object-cover h-[220px] w-full hover:scale-105 duration-500 rounded-2xl'
                    />
                  </div>
                  <div className='space-y-2 mt-2'>
                    <h1 className='font-bold  uppercase text-2xl truncate w-[250px]'>
                      {event.name || 'Untitled Event'}
                    </h1>
                    <p className='text-xs text-gray-500 flex items-center gap-2'>
                      <FaCalendar />
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <p className='text-sm w-[300px] text-gray-500 flex items-center gap-2'>
                      <FaClock />
                      <span className='truncate'>
                        {formatEventStatus(event.startTime, event.endTime)}
                      </span>
                    </p>
                    <p className='line-clamp-2 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2'>
                      <FaLocationArrow />
                      {event.location || event.venue?.name || 'No location'}
                    </p>

                    {event.isFree ? (
                      <span className='text-green-500 text-sm font-bold bg-green-500/10 px-2 py-0.5 rounded-md inline-block'>
                        🆓 Free Admission
                      </span>
                    ) : Array.isArray(event.tickets) ? (
                      event.tickets.slice(0, 1).map((priceOption, index) => (
                        <p key={index}>
                          <span className='text-(--primary) text-sm font-semibold'>
                            {priceOption.name}:{' '}
                            {Number(priceOption.price) > 0 ? (
                              `${
                                priceOption.currency
                              } ${priceOption.price.toLocaleString()}`
                            ) : (
                              <span className='text-green-500 text-sm font-bold bg-green-500/10 px-2 py-0.5 rounded-md'>
                                Free Admission
                              </span>
                            )}
                          </span>
                        </p>
                      ))
                    ) : (
                      <p>
                        <span className='text-(--primary) text-lg font-semibold'>
                          {event.currency}{' '}
                          {Number(event.tickets?.price) +
                            ((1.5 / 100) * Number(event.tickets?.price) + 100)}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className='text-gray-400 text-lg font-medium col-span-full text-center'>
              No events found for this category.
            </p>
          )}
        </div>

        {/* BLOGS SECTION */}
        <h2 className='text-2xl font-bold mb-4 uppercase'>📰 Blogs</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 gap-y-8 sm:gap-4 md:gap-7 my-8 place-items-center'>
          {filteredBlogs.length > 0 ? (
            filteredBlogs.map(news => (
              <div
                key={news.id}
                className='relative flex flex-col cursor-pointer group w-full'
              >
                <div
                  data-aos='fade-out'
                  className='overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300'
                >
                  <OptimizedImage
                    src={news.photoURL || '/fallback.jpg'}
                    alt={news.title || 'news'}
                    className='object-cover h-[220px] w-full hover:scale-105 duration-500 rounded-2xl'
                  />
                </div>
                <div className='space-y-2 mt-2'>
                  <p data-aos='fade-up' className='text-xs text-gray-500'>
                    {news.published || 'Recently'}
                  </p>
                  <h1
                    data-aos='fade-up'
                    className='font-bold line-clamp-1 text-xl'
                  >
                    {news.title || 'Untitled Blog'}
                  </h1>
                  <p
                    data-aos='fade-up'
                    className='line-clamp-2 text-sm text-gray-600 dark:text-gray-400'
                  >
                    {news.description || 'No description available'}
                  </p>
                </div>
                <Link
                  to={`/blogs/${news.log}`}
                  className='text-(--primary) hover:underline mt-2 inline-block'
                >
                  Read More
                </Link>
              </div>
            ))
          ) : (
            <p className='text-gray-400 text-lg font-medium col-span-full text-center'>
              No blog posts found for this category.
            </p>
          )}
        </div>
      </section>

      {/* STEPS SECTION */}
      <section className='relative w-full min-h-screen bg-(--surface) dark:bg-(--surface) p-4 z-40'>
        <h1 className='uppercase md:text-6xl text-5xl font-bold p-4'>Steps</h1>
        <div
          data-aos='fade-out'
          className='flex flex-col space-y-6 justify-center items-center mx-auto w-full max-w-6xl px-4'
        >
          {/* Step 1 */}
          <div
            data-aos='fade-up'
            className='flex lg:flex-row flex-col lg:justify-between items-center w-full bg-(--bg-color) dark:bg-(--bg-color) text-(--text-color) dark:text-(--text-color) shadow-md flex-1 gap-10 relative py-10 px-8 rounded-3xl'
          >
            <div className='space-y-4 flex flex-col justify-center items-center text-center lg:text-left lg:items-start max-w-2xl'>
              <h1 className='uppercase md:text-6xl text-4xl font-bold mt-4'>
                Register
              </h1>
              <p className='md:text-lg text-sm text-gray-500 dark:text-gray-400 mt-2'>
                Join airticks.event today and unlock a world of unforgettable
                experiences. Create your account now to discover, book, and
                attend the best events around you!
              </p>
            </div>
            <div className='rounded-xl overflow-hidden shadow-md flex-shrink-0'>
              <img
                src={register}
                alt='Register preview'
                className='object-cover h-50 w-80 hover:scale-105 duration-500 rounded-2xl'
              />
            </div>
          </div>

          {/* Step 2 */}
          <div
            data-aos='fade-up'
            className='flex lg:flex-row flex-col lg:justify-between items-center w-full bg-(--bg-color) dark:bg-(--bg-color) text-(--text-color) dark:text-(--text-color) shadow-md flex-1 gap-10 relative py-10 px-8 rounded-3xl'
          >
            <div className='space-y-4 flex flex-col justify-center items-center text-center lg:text-left lg:items-start max-w-2xl'>
              <h1 className='uppercase md:text-6xl text-4xl font-bold mt-4'>
                Create Events
              </h1>
              <p className='md:text-lg text-sm text-gray-500 dark:text-gray-400 mt-2'>
                Are you an event organizer? Create and manage your events
                effortlessly with our user-friendly platform. Reach a wider
                audience and boost your event's success!
              </p>
            </div>
            <div className='rounded-xl overflow-hidden shadow-md flex-shrink-0'>
              <img
                src={create}
                alt='Create event preview'
                className='object-cover h-50 w-80 hover:scale-105 duration-500 rounded-2xl'
              />
            </div>
          </div>

          {/* Step 3 */}
          <div
            data-aos='fade-up'
            className='flex lg:flex-row flex-col lg:justify-between items-center w-full bg-(--bg-color) dark:bg-(--bg-color) text-(--text-color) dark:text-(--text-color) shadow-md flex-1 gap-10 relative py-10 px-8 rounded-3xl'
          >
            <div className='space-y-4 flex flex-col justify-center items-center text-center lg:text-left lg:items-start max-w-2xl'>
              <h1 className='uppercase md:text-6xl text-4xl font-bold mt-4'>
                Upcoming Events
              </h1>
              <p className='md:text-lg text-sm text-gray-500 dark:text-gray-400 mt-2'>
                Explore our curated selection of upcoming events, from
                electifying concerts to inspiring workshops. Find your next
                unforgettable experience here!
              </p>
            </div>
            <div className='rounded-xl overflow-hidden shadow-md flex-shrink-0'>
              <img
                src={eventImg}
                alt='Upcoming events preview'
                className='object-cover h-50 w-80 hover:scale-105 duration-500 rounded-2xl'
              />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <section className='flex flex-col justify-center items-center pt-10 w-full lg:h-[70vh] h-[50vh] border-t border-gray-800 bg-(--bg-color)'>
        <div data-aos='fade-out' className='border-t-2 border-gray-500/30 pt-4'>
          <h1 className='lg:text-9xl md:text-7xl mt-15 text-6xl font-bold px-2'>
            airticks<span className='text-(--primary)'>.event</span>
          </h1>
        </div>
        <footer className='w-full mt-10 overflow-hidden'>
          <motion.img
            src={walkGif}
            alt='dog walking'
            className='w-20 pointer-events-none '
            animate={{
              x: ['-50vw', '100vw'],
              y: [0, -20, 10, -10, 0]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'linear',
              repeatDelay: 5
            }}
          />
        </footer>
      </section>
    </>
  )
}

export default Home
