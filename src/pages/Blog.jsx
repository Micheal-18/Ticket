import React, { useEffect } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase/firebase";
import OptimizedImage from "../components/OptimizedImage";
import { FaEllipsisV } from "react-icons/fa";
import event from "../assets/unbox.JPG"

const Blog = ({ blog, setBlog, currentUser }) => {
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

  return (
    <>
      {/* Hero Section */}
      <section className="relative flex flex-col min-h-screen w-full items-center justify-center">
                <div className='overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300'>
                      <img src={event} alt="unbox" className='w-full h-full object-cover hover:scale-105 duration-500 absolute top-0 left-0 ' />
                </div>
                <div className='bg-black/60 absolute top-0 left-0 w-full h-full '></div>
        <div className="absolute space-y-6 text-center mx-auto px-6 py-20 text-white">
          <h1 className="font-bold max-w-xl text-4xl md:text-5xl text-[#eeeeee]">
            Find Your Next Unforgettable Experience
          </h1>
          <p className="text-[#eeeeee] text-md">
            Explore the world of events, from concerts to conferences, all in one place.
          </p>

          {currentUser?.isAdmin && (
            <div className="flex gap-4 justify-center mt-4">
              <Link
                to="/Write"
                className="bg-orange-500 hover:bg-orange-600 active:scale-90 text-white px-6 py-3 rounded-md font-medium transition"
              >
                Write a Blog
              </Link>
              <Link
                to="/dashboard/blog"
                className="bg-green-500 hover:bg-green-600 active:scale-90 text-white px-6 py-3 rounded-md font-medium transition"
              >
                Manage Blogs
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Recent Blogs */}
      <section className="relative my-12 mb-10">
        <div className="flex flex-col ml-4 mb-4">
          <h1 className="font-bold text-2xl sm:text-4xl">Recent Updates</h1>
        </div>

        <div className="flex justify-center items-center mx-auto w-full max-w-6xl px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 gap-y-8 sm:gap-4 md:gap-7 my-8 place-items-center">
            {blog.map((news) => (
              <div
                key={news.id}
                className="relative flex flex-col cursor-pointer group bg-white dark:bg-zinc-900 rounded-2xl shadow-lg overflow-hidden"
              >
                {/* Options Icon */}
                {currentUser?.isAdmin && (
                  <FaEllipsisV className="absolute top-2 right-2 z-20 hover:scale-105 active:scale-90" />
                )}

                {/* Image */}
                <OptimizedImage
                  src={news.photoURL || "/placeholder-blog.jpg"}
                  alt={news.title}
                  className="object-cover h-[220px] w-full hover:scale-105 duration-500 rounded-t-2xl"
                />

                {/* Content */}
                <div className="p-4 space-y-2">
                  <p className="text-xs text-gray-500">{news.published}</p>
                  <h2 className="font-bold line-clamp-1">{news.title}</h2>
                  <p className="line-clamp-2 text-sm text-gray-600">{news.description}</p>
                  <Link
                    to={`/blogs/${news.log}`}
                    className="text-orange-500 hover:underline"
                  >
                    Read More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Blog;
