// pages/BecomeOrganizer.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBuilding,
  FaChartLine,
  FaWallet,
  FaTicketAlt,
  FaQrcode,
  FaUsers,
} from "react-icons/fa";
import { auth, db } from "../firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";

const BecomeOrganizer = ({currentUser}) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    orgName: "",
    phone: "",
    country: "",
    website: "",
    description: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  useEffect(() => {
  if (currentUser?.accountType === "organization") {
    navigate("/dashboard/organization", { replace: true });
  }
}, [currentUser]);

  const becomeOrganizer = async () => {
    if (!form.orgName || !form.phone || !form.country) {
      return alert("Please complete the required fields.");
    }

    try {
      setLoading(true);

      const uid = auth.currentUser.uid;

      await updateDoc(doc(db, "users", uid), {
        accountType: "organization",
        orgName: form.orgName,
        phone: form.phone,
        country: form.country,
        website: form.website,
        description: form.description,
        onboardingCompleted: true,
        updatedAt: new Date().toISOString(),
      });

      navigate("/dashboard/organization");
    } catch (err) {
      console.log(err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <FaBuilding />,
      title: "Unlimited Events",
    },
    {
      icon: <FaTicketAlt />,
      title: "Sell Tickets",
    },
    {
      icon: <FaQrcode />,
      title: "QR Ticket Scanner",
    },
    {
      icon: <FaChartLine />,
      title: "Analytics",
    },
    {
      icon: <FaWallet />,
      title: "Wallet & Payouts",
    },
    {
      icon: <FaUsers />,
      title: "Grow Followers",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">

      <Link
        to="/dashboard/users"
        className="text-orange-500 font-medium"
      >
        ← Back
      </Link>

      <h1 className="text-4xl font-black mt-5">
        Become an Organizer
      </h1>

      <p className="text-gray-500 mt-2">
        Start creating events and selling tickets on Airticks.
      </p>

      <div className="grid md:grid-cols-3 gap-5 mt-10">

        {features.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border p-6"
          >
            <div className="text-orange-500 text-3xl">
              {item.icon}
            </div>

            <h3 className="font-bold mt-4">
              {item.title}
            </h3>
          </div>
        ))}

      </div>

      <div className="rounded-2xl border mt-10 p-8">

        <div className="grid md:grid-cols-2 gap-5">

          <input
            name="orgName"
            placeholder="Organization Name *"
            value={form.orgName}
            onChange={handleChange}
            className="border rounded-xl p-3"
          />

          <input
            name="phone"
            placeholder="Phone Number *"
            value={form.phone}
            onChange={handleChange}
            className="border rounded-xl p-3"
          />

          <input
            name="country"
            placeholder="Country *"
            value={form.country}
            onChange={handleChange}
            className="border rounded-xl p-3"
          />

          <input
            name="website"
            placeholder="Website (optional)"
            value={form.website}
            onChange={handleChange}
            className="border rounded-xl p-3"
          />

        </div>

        <textarea
          name="description"
          placeholder="Tell people about your organization..."
          value={form.description}
          onChange={handleChange}
          className="border rounded-xl p-3 mt-5 w-full h-36 resize-none"
        />

        <button
          onClick={becomeOrganizer}
          disabled={loading}
          className="mt-6 bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-8 py-3 font-semibold"
        >
          {loading ? "Creating..." : "Continue →"}
        </button>

      </div>

    </div>
  );
};

export default BecomeOrganizer;