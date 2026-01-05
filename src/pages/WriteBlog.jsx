import React, { useRef, useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { db, auth } from "../firebase/firebase";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";

const WriteBlog = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [photo, setPhoto] = useState(null);
  const [author, setAuthor] = useState("");
  const fileInputRef = useRef(null);
  const quillRef = useRef(null);
  const navigate = useNavigate();

  // Handle image selection for blog cover photo
  const handlePhotoUpload = (e) => setPhoto(e.target.files[0]);

  // Quill image handler
  const imageHandler = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        try {
          const url = await uploadToCloudinary(file);
          const quill = quillRef.current.getEditor();
          const range = quill.getSelection();
          quill.insertEmbed(range.index, "image", url);
        } catch (err) {
          console.error("Image upload failed:", err);
          alert("Image upload failed. Try again.");
        }
      }
    };
  };

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        ["clean"],
      ],
      handlers: { image: imageHandler },
    },
  };

  const formats = [
    "header", "bold", "italic", "underline", "strike",
    "list", "link", "image"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to create a blog.");
      return;
    }
    if (!title.trim() || !description.trim() || !content.trim() || !author.trim()) {
      alert("Please fill all fields");
      return;
    }

    const blogId = `${Date.now()}_${user.uid}`;
    const blogRef = doc(db, "blogs", blogId);
    let photoURL = "";

    if (photo) {
      try { photoURL = await uploadToCloudinary(photo); } 
      catch { alert("Photo upload failed. Please try again."); return; }
    }

    const log = `${title.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "")}-${Date.now()}`;

    try {
      // Save blog as pending (admin approval required)
      await setDoc(blogRef, {
        title,
        description,
        content,
        photoURL,
        author,
        log,
        userId: user.uid,
        createdAt: serverTimestamp(),
        status: "pending",   // pending approval
        approved: false,
        publishedAt: null,
      });

      alert("Blog submitted! It will be published once approved by an admin.");
      
      // Reset form
      setTitle(""); setDescription(""); setContent(""); setPhoto(null); setAuthor("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      navigate("/"); // redirect to home or blog list

    } catch (err) {
      console.error("Error creating blog:", err);
      alert("Failed to submit blog. Try again.");
    }
  };

  return (
    <section className="w-full max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Write a New Blog</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          placeholder="Blog Title"
          className="w-full p-3 border rounded-lg"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Short Description"
          className="w-full p-3 border rounded-lg"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="w-full p-3 border rounded-lg"
        />
        <input
          type="text"
          placeholder="Author Name"
          className="w-full p-3 border rounded-lg"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={content}
          onChange={setContent}
          modules={modules}
          formats={formats}
          placeholder="Write your full blog content here..."
          className="rounded-lg"
        />
        <button
          type="submit"
          className="w-full bg-orange-500 text-white py-3 rounded-lg active:scale-90 hover:bg-orange-600"
        >
          Submit for Approval
        </button>
      </form>
    </section>
  );
};

export default WriteBlog;
