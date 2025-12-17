import React, { useRef, useState } from 'react'
// import Calendar from "react-calendar";
// import "react-calendar/dist/Calendar.css"; // default styling
import { FaCalendarCheck, FaPlus } from 'react-icons/fa6'
import { RiArrowLeftFill } from 'react-icons/ri'
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { useNavigate } from 'react-router-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { formatEventStatus } from '../utils/formatEventRange';
import { FiX } from 'react-icons/fi';

const CreateEvent = () => {
  const [openDate, setOpenDate] = useState(false);
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [currency, setCurrency] = useState("₦");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [photo, setPhoto] = useState(null);
  const [price, setPrice] = useState([
    { id: 1, label: "", amount: "", currency: "₦" },
  ]);;
  const navigate = useNavigate()
  const fileInputRef = useRef(null);

  const Category = ["Art", "Business", "Education" ,"Entertainment", "Food", "Health", "Music","Networking", "Sports", "Technology", "Other..."];
  const currencies = ["₦", "$", "€"];

  const handleAddInput = () => {
    setPrice([
      ...price,
      { id: price.length + 1, label: "", amount: "", currency: "₦" },
    ]);
  };

  const handlePriceChange = (id, field, value) => {
    setPrice(price.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const handleRemoveInput = (id) => {
    setPrice(price.filter((p) => p.id !== id));
  };

  const handleOpenDate = () => {
    setOpenDate(!openDate)
  }

  const handlePhotoUpload = (e) => {
    setPhoto(e.target.files[0]);
  };

  // const handleDate = (selectedDate) => {
  //   setDate(selectedDate);
  // };



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

    // const numericPrice = parseFloat(price);
    // if (Number.isNaN(numericPrice) || numericPrice < 0) {
    //   alert("Please enter a valid price.");
    //   return;
    // }

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

      const slug = `${name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")}-${Date.now()}`;


      // Combine selected date with startTime
      const finalStart = new Date(date);
      finalStart.setHours(startTime.getHours(), startTime.getMinutes());

      // Combine selected date with endTime
      const finalEnd = new Date(date);
      finalEnd.setHours(endTime.getHours(), endTime.getMinutes());


      // Save event in Firestore
      await setDoc(eventRef, {
        name,
        category,
        description,
        location,
        organizer,
        price,
        currency,
        photoURL,
        date: date.toISOString(),       // main date
        startTime: finalStart.toISOString(), // start datetime
        endTime: finalEnd.toISOString(),
        createdBy: user.uid,
        ownerId: user.uid,
        slug,
        ticketSold: 0,
        followersCount: 0, 
        createdAt: new Date().toISOString(),
      });

      alert("✅ Event created successfully! 🎉🤡")
      navigate("/event"); //
      setName("");
      setCategory("");
      setDescription("");
      setLocation("");
      setOrganizer("");
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
    <section className='w-full h-screen py-4 flex flex-col space-y-6 custom-scrollbar'>
      <div className=' border-b p-4 border-gray-600 flex space-x-4'>
        <RiArrowLeftFill onClick={() => navigate("/dashboard")} className='cursor-pointer text-xl text-orange-600'/>
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
            <option className='bg-gray-700' value="">Choose</option>
            {Category.map((cate, idx) => (
              <option className='bg-gray-700' key={idx} value={cate}>
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
          <input ref={fileInputRef} onChange={handlePhotoUpload} type='file' name='photo' accept='image/*' className='border  rounded-xl w-[100%] p-2' />

        </div>

        <div className='flex items-center p-2 w-full space-x-2 border-b '>
          <label htmlFor="Location">Location:</label>
          <input required onChange={(e) => setLocation(e.target.value)} type='text' value={location} placeholder='Address' className='w-full p-6 flex justify-center' />
        </div>

        <div className='flex items-center p-2 w-full space-x-2 border-b '>
          <label className='flex' htmlFor="Location">Organized by:</label>
          <input required onChange={(e) => setOrganizer(e.target.value)} type='text' value={organizer} placeholder='Organizer' className='w-full p-6 flex justify-center' />
        </div>

        {/* Calendar */}
        <div className='relative flex justify-between border-b py-6'>
          <div className='flex items-center space-x-4'>
            <h1 className='font-semibold  uppercase '>Dates:</h1>
            <p className="text-sm text-gray-600">
              {startTime && !endTime && `Starts: ${startDate.toLocaleDateString()} at ${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              {endTime && `From ${startTime.toLocaleDateString()} ${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} →  ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              {formatEventStatus(startTime, endTime)}
            </p>
          </div>
          <div onClick={handleOpenDate} className='border rounded-xl px-2 space-x-2 flex items-center'>
            <FaCalendarCheck className='text-gray-500' />
            <h1 className='uppercase font-semibold lg:text-xl text-sm'>Calendar</h1>
          </div>
        </div>
        {openDate && (<div className='flex flex-col  gap-2  justify-center'>
          {/* Date */}
          <DatePicker
            selected={date}
            onChange={(newDate) => setDate(newDate)}
            dateFormat="MMMM d, yyyy"
            className='text-white cursor-pointer bg-gray-800 p-4 rounded-lg'
          />



          {/* Start Time */}
          <DatePicker
            selected={startTime}
            onChange={(time) => setStartTime(time)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={30}
            timeCaption="Start Time"
            dateFormat="h:mm aa"
            className='text-white cursor-pointer bg-gray-800 p-4 rounded-lg'
          />

          {/* End Time */}
          <DatePicker
            selected={endTime}
            onChange={(time) => setEndTime(time)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={30}
            timeCaption="End Time"
            dateFormat="h:mm aa"
            className='text-white cursor-pointer bg-gray-800 p-4 rounded-lg'
          />
        </div>
        )}

        {/* <div className='flex flex-col'>
          <div className="flex items-center p-2 w-full space-x-4 border-b">
            <label htmlFor="price">Price:</label>
            <input type='text' id='value' className='p-2 border rounded-lg' />
            <select
              name="currency"
              className="p-2 border bg-gray-700 rounded-lg"
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
            <FaPlus onClick={handleAddInput
            } className='text-2xl text-gray-500' />

          </div>
          {addInput && (
            <div className="flex items-center p-2 w-full space-x-4 border-b">
              <label htmlFor="price">Price:</label>
              <input type='text' id='value' className='p-2 border rounded-lg' />
              <select
                name="currency"
                className="p-2 border bg-gray-700 rounded-lg"
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
              /></div>
          )}
        </div> */}

        {/* Price Section */}
        <div className="flex flex-col space-y-2">
          {price.map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap space-y-2 items-center p-2 w-full space-x-4 border-b"
            >
              <label htmlFor={`label-${p.id}`}>Ticket:</label>

              {/* Ticket type (Regular, VIP, etc.) */}
              <input
                type="text"
                id={`label-${p.id}`}
                className="p-2 border rounded-lg"
                placeholder="Type (e.g. Regular, VIP)"
                value={p.label}
                onChange={(e) => handlePriceChange(p.id, "label", e.target.value)}
              />

              {/* Currency */}
              <select
                value={p.currency}
                onChange={(e) => handlePriceChange(p.id, "currency", e.target.value)}
                className="p-2 border bg-gray-700 rounded-lg"
              >
                {currencies.map((cur, idx) => (
                  <option key={idx} value={cur}>
                    {cur}
                  </option>
                ))}
              </select>

              {/* Amount */}
              <input
                type="number"
                placeholder="0.00"
                className="p-2 border rounded-lg w-40"
                value={p.amount}
                onChange={(e) => handlePriceChange(p.id, "amount", e.target.value)}
                min="0"
              />

              {/* Delete row (only if > 1 row exists) */}
              {price.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveInput(p.id)}
                  className="text-red-500 hover:text-red-700 font-bold"
                >
                  <FiX />
                </button>
              )}
            </div>
          ))}

          {/* Add new tier */}
          <button
            type="button"
            onClick={handleAddInput}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mt-2"
          >
            <FaPlus /> Add another price
          </button>
        </div>

        <button type='submit' className='bg-orange-500 text-white py-3 rounded-lg font-bold active:scale-90 hover:bg-orange-600'>
          Save Event
        </button>
      </form>
    </section>
  )
}

export default CreateEvent