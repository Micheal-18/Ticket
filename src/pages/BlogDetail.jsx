import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../firebase/firebase';
import LoadingScreen from '../components/LoadingScreen';

const BlogDetail = () => {
  const { log } = useParams(); // get the blog log from the route
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
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <img
        src={blog.photoURL}
        alt={blog.title}
        className="w-full h-1/2 object-cover rounded-2xl shadow-lg"
      />
      <div className="space-y-2">
        <p className="text-gray-500 text-sm">{blog.published}</p>
        <h1 className="text-3xl font-bold">{blog.title}</h1>
        <p className="text-gray-500">{blog.description}</p>
      </div>

      {/* Blog content from Quill (rich text) */}
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      ></div>

      <div className='text-right'>
        <p className="text-gray-500">Written by {blog.author}</p>
      </div>
    </div>
  );
};

export default BlogDetail;
