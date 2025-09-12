import React, { useRef, useState } from 'react'
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // default styling
import { FaCalendarCheck } from 'react-icons/fa6'
import { RiArrowLeftFill } from 'react-icons/ri'
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { useNavigate } from 'react-router-dom';

const CreateEvent = () => {
  const [openDate, setOpenDate] = useState(false);
  const [date, setDate] = useState(new Date());
  const [currency, setCurrency] = useState("₦");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [photo, setPhoto] = useState(null);
  const [price, setPrice] = useState("");
  const navigate = useNavigate()
  const fileInputRef = useRef(null);

  const Category = ["Art", "Business", "Entertainment"]
  const currencies = ["₦", "$", "€"];

  const handleOpenDate = () => {
    setOpenDate(!openDate)
  }

  const handlePhotoUpload = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleDate = (selectedDate) => {
    setDate(selectedDate);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to create an event.");
      return;
    }
    // basic validation
    if (!name.trim() || !category || !description.trim() || !location.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    const numericPrice = parseFloat(price);
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      alert("Please enter a valid price.");
      return;
    }

    try {
      // Generate unique ID for event
      const eventId = `${Date.now()}_${user.uid}`;
      const eventRef = doc(db, "events", eventId);

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



      // Save event in Firestore
      await setDoc(eventRef, {
        name,
        category,
        description,
        location,
        price: parseFloat(price),
        currency,
        photoURL,
        date: date.toISOString(),
        createdBy: user.uid,
        ownerId: user.uid,
        createdAt: new Date().toISOString(),
      });

      alert("✅ Event created successfully! 🎉🤡")
      navigate("/event"); //
      setName("");
      setCategory("");
      setDescription("");
      setLocation("");
      setPrice("");
      setPhoto(null);
      setDate(new Date());
      if (fileInputRef.current) fileInputRef.current.value = "";


    } catch (error) {
      console.error("Error uploading event:", error);
      alert("❌ Failed to create event. Check console for details.");
    }
  }

  return (
    <section className='w-full h-screen px-4 flex flex-col space-y-6 custom-scrollbar'>
      <div className=' border-b p-4 border-gray-600 space-y-4'>
        <RiArrowLeftFill onClick={() => navigate("/")} />
        <h1 className='uppercase font-semibold lg:text-5xl text-2xl'>What are you creating</h1>
      </div>
      <form onSubmit={handleSubmit} className='uppercase font-semibold space-y-4 flex flex-col mb-4'>
        <div className='flex items-center py-4 space-x-2 border-b '>
          <label htmlFor="name">Name:</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} type='text' placeholder='Name of event place' className='p-2 w-full flex justify-center' />
        </div>

        <div className='flex items-center justify-between py-4 space-x-2 border-b '>
          <label htmlFor="category">Category:</label>
          <select onChange={(e) => setCategory(e.target.value)} value={category} className=' py-4 border rounded-lg' required>
            <option value="">Choose</option>
            {Category.map((cate, idx) => (
              <option key={idx} value={cate}>
                {cate}
              </option>
            ))}
          </select>
        </div>

        <div className='flex  py-4 space-x-2 border-b '>
          <label htmlFor="description">Description:</label>
          <textarea required onChange={(e) => setDescription(e.target.value)} value={description} name='description' placeholder='Describe your event here...' className='border-2 border-gray-500 rounded-lg p-2 w-full h-[200px]'></textarea>
        </div>

        <div className='flex items-center py-4 space-x-4  border-b '>
          <label htmlFor="photo">Photos:</label>
          <input ref={fileInputRef} onChange={handlePhotoUpload} type='file' name='photo' accept='image/*' className='border w-[100%] p-2' />

        </div>

        <div className='flex items-center p-2 w-full space-x-2 border-b '>
          <label htmlFor="Location">Location:</label>
          <input required onChange={(e) => setLocation(e.target.value)} type='text' value={location} placeholder='Address' className='w-full p-6 flex justify-center' />
        </div>

        {/* Calendar */}
        <div className='relative flex justify-between border-b py-6'>
          <div className='flex items-center space-x-4'>
            <h1 className='font-semibold text-xl uppercase '>Dates:</h1>
            <p className="text-sm text-gray-600">{date.toDateString()}</p>
          </div>
          <div onClick={handleOpenDate} className='border p-2 space-x-2 flex items-center'>
            <FaCalendarCheck className='text-gray-500' />
            <h1 className='uppercase font-semibold text-xl'>Calendar</h1>
          </div>
        </div>
        {openDate && (<div className='flex justify-center'>
          <Calendar onChange={handleDate} value={date} className='text-[#333333]'/></div>
        )}


        <div className="flex items-center p-2 w-full space-x-4 border-b">
          <label htmlFor="price">Price:</label>
          <select
            name="currency"
            className="p-2 border rounded-lg"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {currencies.map((cur, idx) => (
              <option key={idx} value={cur}>
                {cur}
              </option>
            ))}
          </select>
          <input
            id="price"
            type="number"
            placeholder="0.00"
            className="p-2 border rounded-lg w-40"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0"
          />
        </div>


        <button type='submit' className='bg-orange-500 text-white py-3 rounded-lg font-bold active:scale-90 hover:bg-orange-600'>
          Save Event
        </button>
      </form>
    </section>
  )
}

export default CreateEvent