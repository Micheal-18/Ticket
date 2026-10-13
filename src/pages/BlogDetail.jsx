import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../firebase/firebase';
import LoadingScreen from '../components/LoadingScreen';

const BlogDetail = () => {
  const { log } = useParams();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const q = query(
          collection(db, "blogs"),
          where("log", "==", log)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const blogData = querySnapshot.docs[0].data();
          setBlog(blogData);
        } else {
          console.error("No such blog!");
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
      }
    };

    fetchBlog();
  }, [log]);

  if (!blog) {
    return <LoadingScreen />;
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <article className="overflow-hidden rounded-[32px] border border-zinc-200 bg-white shadow-[0_25px_60px_rgba(15,23,42,0.08)] dark:border-zinc-800 dark:bg-zinc-950">
        <div className="relative h-[320px] w-full overflow-hidden sm:h-[420px]">
          <img
            src={blog.photoURL || "/placeholder-blog.jpg"}
            alt={blog.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            <span className="inline-flex rounded-full bg-orange-500/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white">
              {blog.published || "Featured article"}
            </span>
          </div>
        </div>

        <div className="space-y-6 p-6 sm:p-8 lg:p-10">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
              <span className="rounded-full bg-orange-100 px-2.5 py-1 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300">
                {blog.category || "Event Journal"}
              </span>
              <span>{blog.readTime || "4 min read"}</span>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-4xl lg:text-5xl">
              {blog.title}
            </h1>

            <p className="max-w-3xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
              {blog.description}
            </p>
          </div>

          <div className="flex items-center justify-between border-y border-zinc-200 py-4 dark:border-zinc-800">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Author</p>
              <p className="mt-1 text-sm font-semibold text-zinc-800 dark:text-zinc-100">{blog.author || "Ticket Editorial"}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Published</p>
              <p className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-200">{blog.published || "Recently"}</p>
            </div>
          </div>

          <div
            className="prose prose-lg max-w-none prose-headings:font-black prose-headings:text-zinc-900 prose-p:text-zinc-700 prose-a:text-orange-500 prose-strong:text-zinc-900 dark:prose-headings:text-white dark:prose-p:text-zinc-200 dark:prose-strong:text-white"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>
      </article>
    </div>
  );
};

export default BlogDetail;
