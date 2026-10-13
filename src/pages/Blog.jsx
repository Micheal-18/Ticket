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

  const featuredStory = blog[0];

  return (
    <>
      <section className="relative flex flex-col min-h-[52vh] md:min-h-[60vh] w-full items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={event}
            alt="unbox banner asset"
            className="w-full h-full object-cover scale-105 hover:scale-110 duration-700 transition-transform"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/40" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-20 text-center text-white">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/90 backdrop-blur-sm">
            Event Insider
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-black uppercase tracking-tight text-white md:text-6xl">
            Find your next unforgettable experience
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base text-white/80 md:text-lg">
            Explore event stories, behind-the-scenes inspiration, and the moments that turn an ordinary night into a remarkable memory.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#recent-updates"
              className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-transform hover:-translate-y-0.5 hover:bg-amber-400"
            >
              Explore stories
            </a>
            <Link
              to="/events"
              className="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              Browse events
            </Link>
          </div>
        </div>
      </section>

      <section id="recent-updates" className="relative mx-auto my-12 mb-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-500">Latest drops</p>
            <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-(--text-color) sm:text-4xl">
              Recent updates
            </h1>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border-(--border) bg-(--bg-color)/70 px-3 py-2 text-xs font-medium text-(--text-color) shadow-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-(--border)" />
            {blog.length} curated stories
          </div>
        </div>

        {featuredStory && (
          <div className="mb-10 overflow-hidden rounded-[28px] border-(--border) bg-(--bg-color) shadow-[0_20px_60px_rgba(15,23,42,0.08)] ">
            <div className="grid gap-0 md:grid-cols-[1.2fr_0.8fr]">
              <div className="relative h-72 overflow-hidden md:h-full">
                <OptimizedImage
                  src={featuredStory.photoURL || "/placeholder-blog.jpg"}
                  alt={featuredStory.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-transparent" />
              </div>

              <div className="flex flex-col justify-center p-6 md:p-8">
                <span className="mb-3 inline-flex w-fit rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                  {featuredStory.published || "Featured story"}
                </span>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white md:text-3xl">
                  {featuredStory.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                  {featuredStory.description}
                </p>
                <Link
                  to={`/blogs/${featuredStory.log || featuredStory.id}`}
                  className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-amber-500 transition-colors hover:text-amber-600"
                >
                  Read feature <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="w-full">
          {blog.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {blog.map((news) => (
                <article
                  key={news.id}
                  className="group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-zinc-200/80 bg-white text-zinc-900 shadow-[0_18px_45px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_55px_rgba(15,23,42,0.08)] dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                >
                  {currentUser?.isAdmin && (
                    <button className="absolute right-4 top-4 z-30 rounded-full bg-black/40 p-2 text-white backdrop-blur-md transition-all hover:bg-black/60">
                      <FaEllipsisV size={12} />
                    </button>
                  )}

                  <div className="relative overflow-hidden bg-(--surface-hover)">
                    <OptimizedImage
                      src={news.photoURL || "/placeholder-blog.jpg"}
                      alt={news.title}
                      className="aspect-[16/10] h-full w-full object-cover transition-transform duration-600 group-hover:scale-105"
                    />
                    <span className="absolute left-4 top-4 rounded-full border border-white/30 bg-black/25 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                      {news.published || "Recent post"}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                        {news.category || "Event Journal"}
                      </span>
                      <span>{news.readTime || "4 min read"}</span>
                    </div>

                    <h2 className="line-clamp-2 text-xl font-bold text-zinc-900 transition-colors group-hover:text-amber-500 dark:text-zinc-100">
                      {news.title}
                    </h2>

                    <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                      {news.description}
                    </p>

                    <div className="mt-5 pt-4">
                      <Link
                        to={`/blogs/${news.log || news.id}`}
                        className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-amber-500 transition-colors hover:text-amber-600"
                      >
                        Read more <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-zinc-200 bg-zinc-50 px-6 py-14 text-center dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-lg font-medium text-zinc-500 dark:text-zinc-400">
                No recent updates or articles have been documented yet.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Blog;