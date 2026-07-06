import React, { useRef, useState } from 'react'
import { RiArrowLeftFill } from 'react-icons/ri'
import { FaCalendarCheck, FaPlus } from 'react-icons/fa6'
import { FiX } from 'react-icons/fi'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { doc, setDoc } from "firebase/firestore"
import { db, auth } from "../../firebase/firebase"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { formatEventStatus } from '../../utils/formatEventRange'
import { uploadToCloudinary } from '../../utils/cloudinaryUpload'
import { notifyFollowersOfNewEvent } from '../../utils/notifyFollowersOfNewEvent'
import axios from 'axios'
import { toPng } from 'html-to-image'

const bankCodes = {
  "ACCESS BANK": "044",
  "GTBANK": "058",
  "UBA": "033",
  "ZENITH BANK": "057",
  "FIRST BANK": "011",
  "ECOBANK": "050",
  "FCMB": "214",
  "STERLING BANK": "232",
  "PROVIDUS BANK": "076",
  "POLARIS BANK": "076",
  "JAIZ BANK": "301",
  "WEMA BANK": "035",
  "CITIBANK": "023",
  "HERITAGE BANK": "030",
  "KEYSTONE BANK": "082",
  "SKYE BANK": "076",
  "STANDARD CHARTERED BANK": "068",
  "UNITY BANK": "215",
  "VFD MICROFINANCE BANK": "562",
  "ALAT BY WEMABANK": "035",
  "OPAY": "999992",
  "KUDA BANK": "50211",
  "MONIEPOINT": "000"
};

const CreateEvent = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const { currentUser } = useOutletContext()

  // Event state
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [organizer, setOrganizer] = useState("")
  const [date, setDate] = useState(new Date())
  const [startTime, setStartTime] = useState(new Date())
  const [endTime, setEndTime] = useState(new Date())
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(false)
  const [flyerImage, setFlyerImage] = useState("");
  const [loadingFlyer, setLoadingFlyer] = useState(false);
  const [loadingDescription, setLoadingDescription] = useState(false);
  const flyerRef = useRef();

  
  // Ticket Mode & Pricing States
  const [ticketType, setTicketType] = useState("paid")
  const [price, setPrice] = useState([{ id: 1, label: "", amount: "", currency: "₦" }])
  const [openDate, setOpenDate] = useState(false)

  // Bank info
  const [accountNumber, setAccountNumber] = useState("")
  const [bankName, setBankName] = useState("")
  const banks = Object.keys(bankCodes)

  const Category = [
    "Art", "Business", "Education", "Entertainment", "Food", "Health", "Music",
    "Networking", "Sports", "Technology", "Other..."
  ]
  const currencies = ["₦", "$", "€"]

  // Use Date.now() for unique dynamic item IDs to prevent react mutation keys collisions
  const handleAddInput = () => setPrice([...price, { id: Date.now(), label: "", amount: "", currency: "₦" }])
  const handlePriceChange = (id, field, value) => setPrice(price.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  const handleRemoveInput = (id) => setPrice(price.filter((p) => p.id !== id))
  const handleOpenDate = () => setOpenDate(!openDate)
  const handlePhotoUpload = (e) => setPhoto(e.target.files[0])

  const generateDescription = async () => {
    try {
      setLoadingDescription(true);
  
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/description`,
        {
          name,
          category,
          location,
          description
        }
      );
  
      setDescription(response.data.description);
  
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDescription(false);
    }
  };
  
  const generateFlyer = async () => {
    try {
      setLoadingFlyer(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/flyer`,
        { name, category, description, location, organizer}
      );
      setFlyerImage(response.data.image); // Works perfectly with Data URIs or normal URLs!
    } catch (err) {
      console.error(err);
      alert("Failed to generate flyer.");
    } finally {
      setLoadingFlyer(false);
    }
  };
  
  const downloadFlyer = async () => {
  
      const dataUrl = await toPng(flyerRef.current);
  
      const link = document.createElement("a");
  
      link.download = `${name}.png`;
  
      link.href = dataUrl;
  
      link.click();
  
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!currentUser) return alert("You must be logged in to create an event.")

    // Dynamic bank requirement check depending on ticket type
    if (ticketType === "paid" && (!accountNumber || !bankName)) {
      return alert("Please fill in your banking payout details for your paid tickets.")
    }

    if (!name || !category || !description || !location || !organizer) {
      return alert("Please fill all required fields.")
    }

    try {
      setLoading(true)
      const eventId = `${Date.now()}_${currentUser.uid}`
      const eventRef = doc(db, "events", eventId)

      let photoURL = ""
      if (photo) photoURL = await uploadToCloudinary(photo)

      const slug = `${name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "")}-${Date.now()}`
      const finalStart = new Date(date)
      finalStart.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0)
      
      const finalEnd = new Date(date)
      finalEnd.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0)

      // Fallback check if end time inadvertently rolled behind start time configuration
    if (finalEnd <= finalStart) {
  finalEnd.setDate(finalEnd.getDate() + 1);
}

      // Sanitize the pricing array format cleanly for DB storage
      const formattedPriceTiers = price.map(p => ({
        id: p.id,
        label: ticketType === "free" ? "General Admission" : (p.label.trim() || "Regular"),
        amount: ticketType === "free" ? 0 : parseFloat(p.amount || 0),
        currency: ticketType === "free" ? "" : p.currency
      }))

      const bankCode = ticketType === "paid" ? bankCodes[bankName] : ""

      // Save event as PENDING
      await setDoc(eventRef, {
        name,
        category,
        description,
        location,
        organizer,
        price: formattedPriceTiers,
        isFree: ticketType === "free",
        photoURL,
        date: date.toISOString(),
        startTime: finalStart.toISOString(),
        endTime: finalEnd.toISOString(),
        createdBy: currentUser.uid,
        ownerId: currentUser.uid,
        organizerEmail: currentUser.email,
        slug,
        status: "pending", // Pending admin approval
        ticketSold: 0,
        accountNumber: ticketType === "paid" ? accountNumber : "",
        adminFee: ticketType === "paid" ? 8 : 0,
        bankName: ticketType === "paid" ? bankName : "",
        bankCode,
        createdAt: new Date().toISOString(),
      })

      await setDoc(doc(db, "notifications", `${Date.now()}_${eventId}`), {
        type: "event_submission",
        title: "📢 New Event Submission",
        message: `Event "${name}" needs admin review and approval.`,
        senderId: currentUser.uid,
        senderName: organizer,
        link: "/event/" + slug,
        status: "pending",
        read: false,
        createdAt: new Date().toISOString()
      })

      if (currentUser) {
        await notifyFollowersOfNewEvent(currentUser, {
          id: eventId,
          name: name
        })
      }

      alert("✅ Event submitted for approval. Admin will review it.")
      navigate("/dashboard/organization")
    } catch (err) {
      console.error(err)
      setLoading(false)
      alert("❌ Failed to submit event.")
    }
  }

  return (
    <section className='w-full h-screen py-4 flex flex-col space-y-6 custom-scrollbar lg:px-8 shadow'>
      <div className='flex space-x-4 items-center'>
        <h1 className='uppercase font-semibold lg:text-5xl text-3xl'>Create Event</h1>
      </div>

      <form onSubmit={handleSubmit} className='uppercase font-semibold space-y-4 flex flex-col mb-4'>
        {/* Event Info */}
        <div className='flex items-center py-4 space-x-2 border-b '>
          <label>Name:</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} type='text' placeholder='Name of event place' className='p-2 w-full flex justify-center' />
        </div>

        <div className='flex items-center justify-between py-4 space-x-2 border-b '>
          <label>Category:</label>
          <select onChange={(e) => setCategory(e.target.value)} value={category} className=' py-4 border rounded-lg' required>
            <option className='bg-gray-700' value="">Choose</option>
            {Category.map((cate, idx) => (
              <option className='bg-gray-700' key={idx} value={cate}>{cate}</option>
            ))}
          </select>
        </div>

        <div className='flex py-4 space-x-2 border-b '>
          <label>Description:</label>
          <textarea required onChange={(e) => setDescription(e.target.value)} value={description} name='description' placeholder='Describe your event here...' className='border-2 border-gray-500 rounded-lg p-2 w-full h-[200px]'></textarea>
        </div>

        <button
          type="button"
          onClick={generateDescription}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg mb-4 cursor-pointer active:scale-90 hover:bg-orange-700 transition"
        >
          {loadingDescription ? "Improving..." : "✨ Improve Description"}
        </button>

        <div className='flex items-center py-4 space-x-4 border-b '>
          <label>Photos:</label>
          <input ref={fileInputRef} onChange={handlePhotoUpload} type='file' name='photo' accept='image/*' className='border rounded-xl w-[100%] p-2' />
        </div>

        <button
          type="button"
          onClick={generateFlyer}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg"
        >
          {loadingFlyer ? "Generating..." : "🎨 Generate Flyer"}
        </button>

        {/* AI Flyer Preview */}
        {flyerImage && (
          <div className="mt-4 flex justify-center flex-col items-center">
            <div
              ref={flyerRef}
              className="relative w-[340px] aspect-[3/4] overflow-hidden rounded-3xl shadow-2xl border border-white/10"
            >
              {/* Background */}
              <img
                src={flyerImage}
                alt="AI Flyer"
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-between p-4">

                {/* Category */}
                <div>
                  <span className="inline-block bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-semibold  tracking-wider">
                    {category}
                  </span>
                </div>

                {/* Event Details */}
                <div className="space-y-2">
                  <h1
                    className="text-white font-black leading-tight"
                    style={{
                      fontSize:
                        name.length > 30
                          ? "24px"
                          : name.length > 18
                          ? "30px"
                          : "38px",
                    }}
                  >
                    {name}
                  </h1>

                  <p className="text-white/90 text-[12px] line-clamp-2">
                    {description}
                  </p>
                </div>

                {/* Footer */}
                <div className="space-y-3">

                  <div className="flex justify-between gap-4 text-white/90 text-[12px] items-center">

                    <div>
                      <p className="text-xs text-gray-300 uppercase">
                        Organizer
                      </p>

                      <p className="text-white font-semibold">
                        {organizer}
                      </p>
                    </div>

                    <div className="text-right text-xs">
                      <p className="text-sm text-gray-300 uppercase">
                        Venue
                      </p>

                      <p className="text-white font-semibold">
                        {location}
                      </p>
                    </div>

                  </div>

                  <button
                    type="button"
                    className="w-full bg-orange-500 hover:bg-orange-600  py-2 rounded-xl font-bold text-white"
                  >
                    🎟 Get Ticket
                  </button>

                </div>

              </div>
            </div>

          <button
            type="button"
            onClick={downloadFlyer}
            className="mt-4 w-full bg-green-600 cursor-pointer active:scale-90 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition"
          >
            {loading ? "Downloading..." : "📥 Download Flyer"}
          </button>
          </div>
        )}

        <div className='flex items-center p-2 w-full space-x-2 border-b '>
          <label>Location:</label>
          <input required onChange={(e) => setLocation(e.target.value)} type='text' value={location} placeholder='Address (Please full detail location eg: airtick hall, city, state)' className='w-full p-4 flex justify-center' />
        </div>

        <div className='flex items-center p-2 w-full space-x-2 border-b '>
          <label>Organized by:</label>
          <input required onChange={(e) => setOrganizer(e.target.value)} type='text' value={organizer} placeholder='Organizer' className='w-full p-4 flex justify-center' />
        </div>

        {/* Calendar */}
        <div className='relative flex justify-between border-b py-6'>
          <div className='flex items-center space-x-4'>
            <h1 className='font-semibold uppercase '>Dates:</h1>
            <p className="text-sm text-gray-600">{formatEventStatus(startTime, endTime)}</p>
          </div>
          <div onClick={handleOpenDate} className='border rounded-xl px-2 space-x-2 flex items-center ' style={{ cursor: 'pointer' }}>
            <FaCalendarCheck className='text-gray-500' />
            <h1 className='uppercase font-semibold lg:text-xl text-sm'>Calendar</h1>
          </div>
        </div>
        {openDate && (
          <div className='flex flex-col gap-2 justify-center'>
            <DatePicker selected={date} onChange={(newDate) => setDate(newDate)} dateFormat="MMMM d, yyyy" className='text-white cursor-pointer bg-gray-800 p-4 rounded-lg' />
           <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400">Start Time (24h)</span>
              <DatePicker 
                selected={startTime} 
                onChange={(time) => setStartTime(time)} 
                showTimeSelect 
                showTimeSelectOnly 
                timeIntervals={30} 
                timeCaption="Start Time" 
                timeFormat="HH:mm"
                dateFormat="HH:mm" 
                className='text-white cursor-pointer bg-gray-800 p-4 rounded-lg w-full' 
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400">End Time (24h)</span>
              <DatePicker 
                selected={endTime} 
                onChange={(time) => setEndTime(time)} 
                showTimeSelect 
                showTimeSelectOnly 
                timeIntervals={30} 
                timeCaption="End Time" 
                timeFormat="HH:mm"
                dateFormat="HH:mm" 
                className='text-white cursor-pointer bg-gray-800 p-4 rounded-lg w-full' 
              />
            </div>
          </div>
        )}

        {/* Ticket Type Selector Switch */}
        <div className="flex flex-col space-y-2 border-b py-4">
          <label className="text-sm font-bold text-gray-400">Ticket Mode</label>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => {
                setTicketType("free");
                setPrice([{ id: 1, label: "Free Pass", amount: 0, currency: "" }]);
              }}
              className={`flex-1 py-3 rounded-lg font-bold border transition-all ${
                ticketType === "free"
                  ? "bg-green-600 text-white border-green-600 shadow-sm"
                  : "border-gray-600 text-gray-400 hover:bg-gray-800"
              }`}
            >
              🆓 Free Event
            </button>
            <button
              type="button"
              onClick={() => {
                setTicketType("paid");
                setPrice([{ id: 1, label: "", amount: "", currency: "₦" }]);
              }}
              className={`flex-1 py-3 rounded-lg font-bold border transition-all ${
                ticketType === "paid"
                  ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                  : "border-gray-600 text-gray-400 hover:bg-gray-800"
              }`}
            >
              💳 Paid Event
            </button>
          </div>
        </div>

        {/* Dynamic Ticket Prices Setup (Only shows up when Paid is clicked) */}
        {ticketType === "paid" && (
          <div className="flex flex-col space-y-2">
            <h2 className="font-semibold text-sm text-gray-400 uppercase">Pricing Tiers</h2>
            {price.map((p) => (
              <div key={p.id} className="flex flex-wrap space-y-2 items-center p-2 w-full space-x-4 border-b">
                <input required={ticketType === "paid"} type="text" placeholder="Ticket Type (e.g., Regular, VIP)" value={p.label} onChange={(e) => handlePriceChange(p.id, "label", e.target.value)} className="p-2 border rounded-lg"/>
                <select value={p.currency} onChange={(e) => handlePriceChange(p.id, "currency", e.target.value)} className="p-2 border rounded-lg ">
                  {currencies.map((cur, idx) => <option key={idx} value={cur}>{cur}</option>)}
                </select>
                <input required={ticketType === "paid"} type="number" min="1" placeholder="Amount" value={p.amount} onChange={(e) => handlePriceChange(p.id, "amount", e.target.value)} className="p-2 border rounded-lg w-40"/>
                {price.length > 1 && <button type="button" onClick={() => handleRemoveInput(p.id)} className="text-red-500 hover:text-red-700 font-bold"><FiX /></button>}
              </div>
            ))}
            <button type="button" onClick={handleAddInput} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mt-2 self-start"><FaPlus /> Add another ticket type</button>
          </div>
        )}

        {/* Bank Info Container (Hidden entirely if the event is 100% Free) */}
        {ticketType === "paid" && (
          <div className="flex flex-col space-y-4 pt-2">
            <h2 className="font-semibold">Bank Info (for payout)</h2>
            <input required={ticketType === "paid"} placeholder="Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="p-2 border rounded-lg" maxLength={10}/>
            <select required={ticketType === "paid"} value={bankName} onChange={(e) => setBankName(e.target.value)} className="p-2 border rounded-lg ">
              <option value="">Select Bank</option>
              {banks.map((b, i) => <option key={i} value={b}>{b}</option>)}
            </select>
          </div>
        )}

        <button type='submit' className='bg-orange-500 text-white py-3 cursor-pointer rounded-lg font-bold active:scale-90 hover:bg-orange-600 transition-all'>
         {loading ? "Submitting..." : "Submit Event for Approval"}
        </button>
      </form>
    </section>
  )
}

export default CreateEvent