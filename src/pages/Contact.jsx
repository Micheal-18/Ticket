import React, { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    number: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback("");

    try {
      const res = await fetch("https://tick-backend-2.onrender.com/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setFeedback("✅ Message sent successfully!");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setFeedback("❌ Failed to send message.");
      }
    } catch (error) {
      setFeedback("⚠️ Server error. Try again later.");
    }

    setLoading(false);
  };

  return (
    <section className="min-h-screen flex items-center justify-center py-20 ">
      <div className="px-4 w-full max-w-md">
        <h1 className="text-3xl text-[#eeeeee] font-bold mb-6 text-center">
          Contact Us
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            type="text"
            placeholder="Your Name"
            className="p-3 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
            placeholder="Your Email"
            className="p-3 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
          <input 
            name="number"
            value={formData.number}
            onChange={handleChange}
            type="tel"
            placeholder="Phone number"
            className="p-3 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="6"
            placeholder="Your Message"
            className="p-3 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          ></textarea>

          <button
            type="submit"
            className="bg-orange-500 text-white p-2 rounded-md active:scale-90 transition-all"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send"}
          </button>

          {feedback && <p className="text-sm text-gray-200 text-center">{feedback}</p>}
        </form>
      </div>
    </section>
  );
};

export default Contact;
