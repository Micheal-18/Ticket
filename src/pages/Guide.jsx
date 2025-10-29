// src/pages/Guide.jsx
import React from "react";
import walkGif from "../assets/dog.gif";

const Guide = () => {
  return (
    <>
      <section
        data-aos="fade-out"
        className="min-h-screen bg-gray-50 flex justify-center items-center py-16 px-4"
      >
        <div className="max-w-3xl w-full bg-white shadow-2xl rounded-3xl p-8 md:p-12 space-y-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900">
            🎟 AirTicks<span className="text-orange-500">Events</span> Guide
          </h1>
          <p className="text-center text-gray-600 text-sm md:text-base">
            Learn how to buy tickets, receive confirmations, and attend your events with ease.
          </p>

          {/* Section 1 */}
          <section data-aos="fade-up" data-aos-delay="100">
            <h2 className="text-xl font-semibold text-[#333333] mb-3">
              1️⃣ Buying a Ticket
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>Visit the <strong>AirTicks Events</strong> website.</li>
              <li>Select your desired <strong>event</strong>.</li>
              <li>
                Choose a ticket type:
                <ul className="list-disc list-inside ml-6 mt-1">
                  <li>🎫 Regular</li>
                  <li>🎫 VIP</li>
                  <li>🍾 Table for 4</li>
                  <li>💎 Big Boys Package</li>
                </ul>
              </li>
              <li>Pay securely online.</li>
              <li>Receive a <strong>confirmation email</strong> after payment.</li>
            </ol>
          </section>

          {/* Section 2 */}
          <section data-aos="fade-up" data-aos-delay="200">
            <h2 className="text-xl font-semibold text-[#333333] mb-3">
              2️⃣ Receiving Your Ticket
            </h2>
            <p className="text-gray-700">Your confirmation email includes:</p>
            <ul className="list-disc list-inside ml-6 space-y-1 text-gray-700">
              <li>✅ Ticket details (type, price, reference number)</li>
              <li>✅ A <strong>QR code</strong> — your entry pass</li>
            </ul>
            <p className="mt-3 font-medium text-gray-800">
              👉 Keep this email safe — no need to log in again.
            </p>
          </section>

          {/* Section 3 */}
          <section data-aos="fade-up" data-aos-delay="300">
            <h2 className="text-xl font-semibold text-[#333333] mb-3">
              3️⃣ At the Event
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>Present your QR code (on phone or printed).</li>
              <li>Event staff will scan your QR code.</li>
              <li>
                Possible results:
                <ul className="list-disc list-inside ml-6">
                  <li>✅ <strong>Valid Ticket</strong> → Entry granted 🎉</li>
                  <li>⚠️ <strong>Already Used</strong> → Previously scanned</li>
                  <li>❌ <strong>Invalid Ticket</strong> → Not recognized</li>
                </ul>
              </li>
            </ol>
          </section>

          {/* Section 4 */}
          <section data-aos="fade-up" data-aos-delay="400">
            <h2 className="text-xl font-semibold text-[#333333] mb-3">
              4️⃣ Important Notes
            </h2>
            <ul className="list-disc list-inside ml-6 space-y-2 text-gray-700 leading-relaxed">
              <li>Ticket creation is for users; AirTicks takes <strong>10%</strong> of paid tickets 🤝🏾.</li>
              <li>Each ticket can only be used <strong>once</strong>.</li>
              <li>Sharing or reusing a QR code will mark it as <strong>already used</strong>.</li>
              <li>Always purchase from the official <strong>AirTicks Events website</strong>.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section data-aos="fade-up" data-aos-delay="500">
            <h2 className="text-xl font-semibold text-[#333333] mb-3">
              5️⃣ Need Help?
            </h2>
            <p className="text-gray-700">
              If you have any issues, reach our support team at{" "}
              <a
                href='/contact' 
                className="text-blue-500 hover:text-blue-700 underline"
              >
                Contact us
              </a>.
            </p>
          </section>

          {/* Closing Message */}
          <p
            data-aos="fade-up"
            data-aos-delay="600"
            className="text-center text-lg font-semibold text-green-600"
          >
            ✨ That’s it! Enjoy your event 🎶💃🕺
          </p>

          {/* Back Button */}
          <div className="flex justify-center">
            <a
              href="/event"
              className="bg-orange-500 text-white font-semibold px-6 py-3 rounded-xl shadow hover:bg-orange-600 transition-transform transform hover:scale-105 active:scale-95"
            >
              🔙 Explore Events
            </a>
          </div>
        </div>
      </section>

      {/* Footer animation */}
      <footer className="mt-10 flex justify-center">
        <img
          src={walkGif}
          alt="walking gif"
          className="w-20 h-20 animation-walk"
        />
      </footer>
    </>
  );
};

export default Guide;
