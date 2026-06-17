import React, { useEffect } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase/firebase";
import OptimizedImage from "../components/OptimizedImage";
import { FaEllipsisV } from "react-icons/fa";
import event from "../assets/unbox.JPG";

const Blog = ({ blog = [], setBlog, currentUser }) => {
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const q = query(
          collection(db, "blogs"),
          where("approved", "==", true),
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
      {/* HERO HERO CONTAINER */}
      <section className="relative flex flex-col h-[50vh] md:min-h-screen w-full items-center justify-center overflow-hidden">
        <div className='absolute inset-0 z-0'>
          <img src={event} alt="unbox banner asset" className='w-full h-full object-cover hover:scale-105 duration-700 transition-transform' />
          <div className='bg-black/60 absolute inset-0'></div>
        </div>
        <div className="relative z-10 space-y-6 text-center mx-auto px-6 py-20 text-white">
          <h1 className="font-bold max-w-xl text-4xl md:text-5xl text-[#eeeeee] uppercase tracking-tight">
            Find Your Next Unforgettable Experience
          </h1>
          <p className="text-[#eeeeee]/90 text-md max-w-md mx-auto">
            Explore the world of events, from concerts to conferences, all in one place.
          </p>
        </div>
      </section>

      {/* RECENT BLOGS GRID VIEWPORT */}
      <section className="relative my-12 mb-10 max-w-7xl mx-auto px-4">
        <div className="flex flex-col mb-6">
          <h1 className="font-black text-2xl sm:text-4xl uppercase tracking-tight">Recent Updates</h1>
        </div>

        <div className="w-full">
          {blog.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 gap-y-10">
              {blog.map((news) => (
                <div
                  key={news.id}
                  className="relative flex flex-col group bg-(--bg-color) dark:bg-(--bg-color) text-(--text-color) dark:text-(--text-color) rounded-2xl shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Administrative Context Action Dots */}
                  {currentUser?.isAdmin && (
                    <button className="absolute top-3 right-3 z-30 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-transform active:scale-95 backdrop-blur-xs">
                      <FaEllipsisV size={12} />
                    </button>
                  )}

                  {/* Asset Display Box */}
                  <div className="overflow-hidden aspect-[16/10] w-full bg-zinc-100 dark:bg-zinc-900">
                    <OptimizedImage
                      src={news.photoURL || "/placeholder-blog.jpg"}
                      alt={news.title}
                      className="object-cover h-full w-full group-hover:scale-105 duration-500"
                    />
                  </div>

                  {/* Written Content Data Frame */}
                  <div className="p-5 flex-1 flex flex-col space-y-2.5">
                    <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider">
                      {news.published || "Recent Post"}
                    </p>
                    <h2 className="font-bold text-lg text-zinc-800 dark:text-zinc-100 line-clamp-1 group-hover:text-orange-500 transition-colors">
                      {news.title}
                    </h2>
                    <p className="line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400 flex-1 leading-relaxed">
                      {news.description}
                    </p>
                    <div className="pt-2">
                      <Link
                        to={`/blogs/${news.log}`}
                        className="text-orange-500 font-bold text-xs uppercase tracking-widest hover:text-orange-600 transition-colors"
                      >
                        Read More &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-400 font-medium italic text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
              No recent updates or articles have been documented yet.
            </p>
          )}
        </div>
      </section>
    </>
  );
};

export default Blog;