import React, { useEffect, useState, useRef } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, orderBy, addDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload";
import OptimizedImage from "../../components/OptimizedImage";

const Dashblog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const fileInputRefs = useRef({});

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        // Fetch all blogs ordered by creation
        const blogSnap = await getDocs(
          collection(db, "blogs")
        );
        const blogList = blogSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBlogs(blogList);
      } catch (err) {
        console.error("Error fetching blogs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const handleApprove = async (blogId) => {
    setActioning(true);
    try {
      const blogRef = doc(db, "blogs", blogId);
      await updateDoc(blogRef, {
        approved: true,
        status: "approved",
        publishedAt: serverTimestamp(),
      });
      setBlogs(prev => prev.map(b => b.id === blogId ? { ...b, approved: true, status: "approved" } : b));
    } catch (err) {
      console.error(err);
    } finally {
      setActioning(false);
    }
  };

  const handleReject = async (blogId) => {
    const reason = prompt("Enter reason for rejecting this blog:");
    if (!reason) return;

    setActioning(true);
    try {
      const blogRef = doc(db, "blogs", blogId);
      await updateDoc(blogRef, {
        approved: false,
        status: "rejected",
        rejectionReason: reason,
        reviewedAt: serverTimestamp(),
      });
      setBlogs(prev => prev.map(b => b.id === blogId ? { ...b, status: "rejected", rejectionReason: reason } : b));
    } catch (err) {
      console.error(err);
    } finally {
      setActioning(false);
    }
  };

  const handleDelete = async (blogId) => {
    if (!window.confirm("Delete this blog permanently?")) return;

    setActioning(true);
    try {
      const blogRef = doc(db, "blogs", blogId);
      await deleteDoc(blogRef);
      setBlogs(prev => prev.filter(b => b.id !== blogId));
    } catch (err) {
      console.error(err);
    } finally {
      setActioning(false);
    }
  };

  const handleResubmit = async (blogId) => {
    setActioning(true);
    try {
      const blog = blogs.find(b => b.id === blogId);
      const blogRef = doc(db, "blogs", blogId);

      let photoURL = blog.photoURL;
      const file = fileInputRefs.current[blogId]?.files?.[0];
      if (file) {
        photoURL = await uploadToCloudinary(file);
      }

      await updateDoc(blogRef, {
        title: blog.title,
        description: blog.description,
        photoURL,
        status: "pending",
        approved: false,
        rejectionReason: "",
        reviewedAt: serverTimestamp(),
      });

      await addDoc(collection(db, "notifications"), {
        type: "blog_resubmitted",
        title: "📝 Blog Resubmitted",
        userId: blog.userId,
        createdAt: serverTimestamp(),
      });

      setBlogs(prev => prev.map(b => b.id === blogId ? { ...b, status: "pending", photoURL, approved: false, rejectionReason: "" } : b));
    } catch (err) {
      console.error(err);
    } finally {
      setActioning(false);
    }
  };

  const handleChangeField = (blogId, field, value) => {
    setBlogs(prev => prev.map(b => b.id === blogId ? { ...b, [field]: value } : b));
  };

  if (loading) return <p className="text-center mt-10">Loading blogs...</p>;

  const pendingBlogs = blogs.filter(b => b.status === "pending" && !b.approved);
  const rejectedBlogs = blogs.filter(b => b.status === "rejected");

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      {/* PENDING */}
      <section>
        <h1 className="text-3xl font-bold mb-6">Pending Blog Approvals</h1>
        {pendingBlogs.length === 0 ? <p className="text-gray-500">No pending blogs.</p> : pendingBlogs.map(blog => (
          <div key={blog.id} className="bg-white dark:bg-zinc-900 rounded-xl shadow p-5 mb-4">
            <h2 className="text-xl font-semibold mb-2">{blog.title}</h2>
            <p className="text-gray-500 mb-2">{blog.description}</p>
            {blog.photoURL && <img src={blog.photoURL} alt={blog.title} className="mb-4 rounded-lg max-h-64 object-cover" />}
            <div className="flex gap-3">
              <button onClick={() => handleApprove(blog.id)} disabled={actioning} className="bg-green-600 px-4 py-2 rounded-lg text-white">{actioning ? "Processing..." : "Approve"}</button>
              <button onClick={() => handleReject(blog.id)} disabled={actioning} className="bg-red-600 px-4 py-2 rounded-lg text-white">{actioning ? "Processing..." : "Reject"}</button>
              <button onClick={() => handleDelete(blog.id)} disabled={actioning} className="bg-gray-600 px-4 py-2 rounded-lg text-white">Delete</button>
            </div>
          </div>
        ))}
      </section>

      {/* REJECTED */}
      <section>
        <h1 className="text-3xl font-bold mb-6 text-red-600">Rejected Blogs</h1>
        {rejectedBlogs.length === 0 ? <p className="text-gray-500">No rejected blogs yet.</p> : rejectedBlogs.map(blog => (
          <div key={blog.id} className="bg-white dark:bg-zinc-900 rounded-xl shadow p-5 mb-4 border-l-4 border-red-600">
            <input type="text" value={blog.title} onChange={(e) => handleChangeField(blog.id, "title", e.target.value)} className="w-full p-2 mb-2 border rounded" placeholder="Blog Title" />
            <textarea value={blog.description} onChange={(e) => handleChangeField(blog.id, "description", e.target.value)} className="w-full p-2 mb-2 border rounded" placeholder="Short description" />
            {blog.photoURL && 
            <OptimizedImage src={blog.photoURL} alt={blog.title} className="mb-2 rounded-lg max-h-64 object-cover" />}
            <input type="file" ref={el => fileInputRefs.current[blog.id] = el} className="mb-2" accept="image/*" />
            <p className="text-sm text-red-600 mb-2">Reason: {blog.rejectionReason || "No reason provided"}</p>
            <div className="flex gap-3">
              <button onClick={() => handleResubmit(blog.id)} disabled={actioning} className="bg-orange-600 px-4 py-2 rounded-lg text-white">{actioning ? "Processing..." : "Resubmit"}</button>
              <button onClick={() => handleDelete(blog.id)} disabled={actioning} className="bg-gray-600 px-4 py-2 rounded-lg text-white">Delete</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Dashblog;
