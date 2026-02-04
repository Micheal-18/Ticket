import React, { useRef, useState } from 'react'
import { RiArrowLeftFill } from 'react-icons/ri'
import { FaCalendarCheck, FaPlus } from 'react-icons/fa6'
import { FiX } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { doc, setDoc } from "firebase/firestore"
import { db, auth } from "../../firebase/firebase"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { formatEventStatus } from '../../utils/formatEventRange'
import { uploadToCloudinary } from '../../utils/cloudinaryUpload'

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
  "OPAY": "035",
  "KUDA BANK": "50211",
  "MONIEPOINT": "000"
};

const CreateEvent = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

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

  const handleAddInput = () => setPrice([...price, { id: price.length + 1, label: "", amount: "", currency: "₦" }])
  const handlePriceChange = (id, field, value) => setPrice(price.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  const handleRemoveInput = (id) => setPrice(price.filter((p) => p.id !== id))
  const handleOpenDate = () => setOpenDate(!openDate)
  const handlePhotoUpload = (e) => setPhoto(e.target.files[0])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const user = auth.currentUser
    if (!user) return alert("You must be logged in to create an event.")

    if (!name || !category || !description || !location || !organizer || !accountNumber || !bankName) {
      return alert("Please fill all required fields.")
    }

    try {
      const eventId = `${Date.now()}_${user.uid}`
      const eventRef = doc(db, "events", eventId)

      let photoURL = ""
      if (photo) photoURL = await uploadToCloudinary(photo)

      const slug = `${name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "")}-${Date.now()}`
      const finalStart = new Date(date)
      finalStart.setHours(startTime.getHours(), startTime.getMinutes())
      const finalEnd = new Date(date)
      finalEnd.setHours(endTime.getHours(), endTime.getMinutes())

      const bankCode = bankCodes[bankName] // Get Paystack bank code

      // Save event as PENDING
      await setDoc(eventRef, {
        name,
        category,
        description,
        location,
        organizer,
        price,
        photoURL,
        date: date.toISOString(),
        startTime: finalStart.toISOString(),
        endTime: finalEnd.toISOString(),
        createdBy: user.uid,
        ownerId: user.uid,
        organizerEmail: user.email,
        slug,
        status: "pending", // ✅ Pending admin approval
        ticketSold: 0,
        accountNumber,
        adminFee: 8,
        bankName,
        bankCode,
        createdAt: new Date().toISOString(),
      })

      await setDoc(doc(db, "notifications", `${Date.now()}_${eventId}`), {
        type: "event_submission",
        title: "📢 New Event Submission",
        message: `Your event "${name}" has been submitted for approval.`,
        userId: user.uid,
        link: "/event/" + slug,
        status: "pending",
        read: false,
        createdAt: new Date().toISOString()
      })

      alert("✅ Event submitted for approval. Admin will review it.")
      navigate("/dashboard/organization")
    } catch (err) {
      console.error(err)
      alert("❌ Failed to submit event.")
    }
  }

  return (
    <section className='w-full h-screen pb-4 flex flex-col space-y-6 custom-scrollbar'>
      <div className=' flex space-x-4'>
        {/* <RiArrowLeftFill onClick={() => navigate("/dashboard")} className='cursor-pointer text-xl text-orange-600'/> */}
        <h1 className='uppercase font-semibold lg:text-5xl text-2xl'>Create Event</h1>
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

        <div className='flex  py-4 space-x-2 border-b '>
          <label>Description:</label>
          <textarea required onChange={(e) => setDescription(e.target.value)} value={description} name='description' placeholder='Describe your event here...' className='border-2 border-gray-500 rounded-lg p-2 w-full h-[200px]'></textarea>
        </div>

        <div className='flex items-center py-4 space-x-4  border-b '>
          <label>Photos:</label>
          <input ref={fileInputRef} onChange={handlePhotoUpload} type='file' name='photo' accept='image/*' className='border rounded-xl w-[100%] p-2' />
        </div>

        <div className='flex items-center p-2 w-full space-x-2 border-b '>
          <label>Location:</label>
          <input required onChange={(e) => setLocation(e.target.value)} type='text' value={location} placeholder='Address' className='w-full p-6 flex justify-center' />
        </div>

        <div className='flex items-center p-2 w-full space-x-2 border-b '>
          <label>Organized by:</label>
          <input required onChange={(e) => setOrganizer(e.target.value)} type='text' value={organizer} placeholder='Organizer' className='w-full p-6 flex justify-center' />
        </div>

        {/* Calendar */}
        <div className='relative flex justify-between border-b py-6'>
          <div className='flex items-center space-x-4'>
            <h1 className='font-semibold  uppercase '>Dates:</h1>
            <p className="text-sm text-gray-600">{formatEventStatus(startTime, endTime)}</p>
          </div>
          <div onClick={handleOpenDate} className='border rounded-xl px-2 space-x-2 flex items-center'>
            <FaCalendarCheck className='text-gray-500' />
            <h1 className='uppercase font-semibold lg:text-xl text-sm'>Calendar</h1>
          </div>
        </div>
        {openDate && (
          <div className='flex flex-col  gap-2  justify-center'>
            <DatePicker selected={date} onChange={(newDate) => setDate(newDate)} dateFormat="MMMM d, yyyy" className='text-white cursor-pointer bg-gray-800 p-4 rounded-lg' />
            <DatePicker selected={startTime} onChange={(time) => setStartTime(time)} showTimeSelect showTimeSelectOnly timeIntervals={30} timeCaption="Start Time" dateFormat="h:mm aa" className='text-white cursor-pointer bg-gray-800 p-4 rounded-lg'/>
            <DatePicker selected={endTime} onChange={(time) => setEndTime(time)} showTimeSelect showTimeSelectOnly timeIntervals={30} timeCaption="End Time" dateFormat="h:mm aa" className='text-white cursor-pointer bg-gray-800 p-4 rounded-lg'/>
          </div>
        )}

        {/* Ticket Prices */}
        <div className="flex flex-col space-y-2">
          {price.map((p) => (
            <div key={p.id} className="flex flex-wrap space-y-2 items-center p-2 w-full space-x-4 border-b">
              <input type="text" placeholder="Ticket Type" value={p.label} onChange={(e) => handlePriceChange(p.id, "label", e.target.value)} className="p-2 border rounded-lg"/>
              <select value={p.currency} onChange={(e) => handlePriceChange(p.id, "currency", e.target.value)} className="p-2 border  rounded-lg">
                {currencies.map((cur, idx) => <option key={idx} value={cur}>{cur}</option>)}
              </select>
              <input type="number" placeholder="0.00" value={p.amount} onChange={(e) => handlePriceChange(p.id, "amount", e.target.value)} className="p-2 border rounded-lg w-40"/>
              {price.length > 1 && <button type="button" onClick={() => handleRemoveInput(p.id)} className="text-red-500 hover:text-red-700 font-bold"><FiX /></button>}
            </div>
          ))}
          <button type="button" onClick={handleAddInput} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mt-2"><FaPlus /> Add another ticket type</button>
        </div>

        {/* Bank Info */}
        <h2 className="font-semibold">Bank Info (for payout)</h2>
        <input required placeholder="Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="p-2 border rounded-lg"/>
        <select required value={bankName} onChange={(e) => setBankName(e.target.value)} className="p-2 border rounded-lg">
          <option value="">Select Bank</option>
          {banks.map((b, i) => <option key={i} value={b}>{b}</option>)}
        </select>

        <button type='submit' className='bg-orange-500 text-white py-3 rounded-lg font-bold active:scale-90 hover:bg-orange-600'>
          Submit for Approval
        </button>
      </form>
    </section>
  )
}

export default CreateEvent
