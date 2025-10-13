import React, { useEffect } from 'react'
import event from "../assets/unbox.JPG"
import iphone from "../assets/rep.jpg"
import gadget from "../assets/download2.jpeg"
import tech from "../assets/download3.jpeg"
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { Link } from 'react-router-dom'
const Blog = ({blog, setBlog}) => {

    // const data = [
    //     {
    //         No: 1,
    //         title: "How to choose perfect smartphone",
    //         description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus, voluptatibus.",
    //         published: "October 1, 2023 by Jane Doe",
    //         image: iphone,
    //     },
    //     {
    //         No: 2,
    //         title: "How to choose perfect gadget",
    //         description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus, voluptatibus.",
    //         published: "October 2, 2023 by John Smith",
    //         image: gadget,
    //     },
    //     {
    //         No: 3,
    //         title: "Latest trends in technology",
    //         description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus, voluptatibus.",
    //         published: "October 3, 2023 by Alice Johnson",
    //         image: tech,
    //     }
    // ]

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "blogs"));
                const blogsData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setBlog(blogsData);
            } catch (error) {
                console.error("Error fetching blogs:", error);
            }
        };
        fetchBlog();
    }, [setBlog]);
    return (
        <>

            <section className='relative flex flex-col  min-h-screen w-full items-center justify-center'>

                <img src={event} alt="unbox" className='w-full h-full object-cover absolute top-0 left-0 ' />
                <div className='bg-black/60 absolute top-0 left-0 w-full h-full '></div>
                <div className='absolute  space-y-6 text-center mx-auto px-6 py-20 text-white'>
                    <h1 className='font-bold max-w-xl text-4xl md:text-5xl text-[#eeeeee]'>Find Your Next Unforgettable Experience</h1>
                    <p className='text-[#eeeeee] text-md'>Explore the world of events, from concert to conference, all in one places</p>
                    <a href='/Write' className='bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-md font-medium transition'>Write a Blog</a>
                </div>
            </section>
            <section className=" relative my-12  mb-10 ">
                <div data-aos="fade-up" className='flex flex-col ml-4 mb-4'>
                    <h1 className='font-bold text-2xl sm:text-4xl'>Recent Update</h1>
                    <p className='text-sm'></p>
                </div>
                <div className='flex justify-center items-center mx-auto w-full max-w-6xl px-4'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 gap-y-8 sm:gap-4 md:gap-7 my-8  place-items-center '>
                        {blog.map((News) => (
                            <div key={News.No} className='flex flex-col cursor-pointer group'>
                                {/*card*/}
                                <div data-aos="fade-out" className='overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300'>
                                    <img src={News.photoURL} alt='data' className='object-cover h-[220px] w-full hover:scale-105 duration-500 rounded-2xl' />
                                </div>
                                {/*content info */}
                                <div className='space-y-2'>
                                    <p data-aos="fade-up" className='text-xs text-gray-500'>{News.published}</p>
                                    <h1 data-aos="fade-up" className='font-bold  line-clamp-1'>{News.title}</h1>
                                    <p data-aos="fade-up" className='line-clamp-2 text-sm text-gray-600 '>{News.description}</p>
                                </div>

                                <Link to={`/blogs/${News.id}`} className='text-orange-500 hover:underline'>Read More</Link>
                            </div>

                        ))}
                    </div>
                </div>
            </section>
        </>

    )
}

export default Blog