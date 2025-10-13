import React, { useRef, useState } from "react";
import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { db, auth } from "../firebase/firebase";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";


const WriteBlog = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
    const [photo, setPhoto] = useState(null);
     const fileInputRef = useRef(null);

  const [author, setAuthor] = useState("");
  const navigate = useNavigate();

   const handlePhotoUpload = (e) => {
    setPhoto(e.target.files[0]);
  };

  const imageHandler = () => {
  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.setAttribute("accept", "image/*");
  input.click();

  input.onchange = async () => {
    const file = input.files[0];
    if (file) {
      try {
        // Upload to Cloudinary
        const url = await uploadToCloudinary(file);

        // Insert uploaded image URL into the editor
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
  const quillRef = useRef(null);

  const modules = {
    toolbar: {
    container: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"], // image button stays
      ["clean"],
    ],
    handlers: {
      image: imageHandler, // override default image behavior
    },
  },
  };

  const formats = [
  "header",
  "bold", "italic", "underline", "strike",
  "list",
  "link", "image"
];




  const handleSubmit = async (e) => {
    const user = auth.currentUser;
        if (!user) {
          alert("You must be logged in to create an event.");
          return;
        }
    e.preventDefault();
    if (!title.trim() || !description.trim() || !content.trim() || !author.trim()) {
      alert("Please fill all fields");
      return;
    }
  
     const blogId = `${Date.now()}_${user.uid}`;
          const blogRef = doc(db, "blogs", blogId);

    let photoURL = "";
    
          // If photo is uploaded
          if (photo) {
            try {
              photoURL = await uploadToCloudinary(photo);
            } catch (err) {
              alert("Photo upload failed. Please try again.");
              return;
            }
          }

    try {
      await setDoc(blogRef, {
        title,
        description,
        content,
        photoURL,
        published: `By ${author} • ${new Date().toDateString()}`,
        createdAt: serverTimestamp(),
        userId: user.uid, 
      });
      alert("Blog posted successfully!");
      setPhoto(null);
      setTitle("");
      setDescription("");
      setContent("");
      setImage("");
      setAuthor("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      navigate("/"); // redirect back to blog list
    } catch (error) {
      console.error("Error adding blog: ", error);
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

        {/* <input
          type="text"
          placeholder="Image URL"
          className="w-full p-3 border rounded-lg"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        /> */}   
         
          <input ref={fileInputRef} onChange={handlePhotoUpload} type='file' name='photo' accept='image/*' className='border w-[100%] p-3 rounded-lg' />

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
          className="rounded-lg "
        />
        

        <button
          type="submit"
          className="w-full bg-orange-500 cursor-pointer active:scale-90 text-white py-3 rounded-lg hover:bg-orange-600"
        >
          Publish Blog
        </button>
      </form>
    </section>
  );
};

export default WriteBlog;
