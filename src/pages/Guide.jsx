// src/pages/Guide.jsx
import React from "react";
import walkGif from "../assets/dog.gif"

const Guide = () => {
  return (
    <>
      <div data-aos="fade-out" className="min-h-screen  flex justify-center items-center py-10 px-4">
        <div className="max-w-3xl w-full bg-white shadow-xl rounded-2xl p-8 space-y-8">
          <h1 className="text-3xl font-bold text-center text-gray-900">
            🎟 AirTicks<span className="text-orange-500">Events</span> – User Guide
          </h1>

          {/* Section 1 */}
          <section>
            <h2 className="text-xl text-[#333333] font-semibold mb-2">1. Buying a Ticket</h2>
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              <li>Go to the <strong>Airways Events website</strong>.</li>
              <li>Select the <strong>event</strong> you want to attend.</li>
              <li>
                Choose your ticket type:
                <ul className="list-disc list-inside ml-5">
                  <li>🎫 Regular </li>
                  <li>🎫 VIP </li>
                  <li>🍾 Table for 4 </li>
                  <li>💎 Big Boys Package </li>
                </ul>
              </li>
              <li>Complete payment securely online.</li>
              <li>After payment, you’ll receive a <strong>confirmation email</strong>.</li>
            </ol>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl text-[#333333] font-semibold mb-2">2. Receiving Your Ticket</h2>
            <p className="text-gray-700">The email will contain:</p>
            <ul className="list-disc list-inside ml-5 text-gray-700">
              <li>✅ Ticket details (type, price, and reference number)</li>
              <li>✅ A <strong>QR code</strong> image (this is your entry pass)</li>
            </ul>
            <p className="mt-2 font-medium">
              👉 Keep this email safe. You don’t need to log in again.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl text-[#333333] font-semibold mb-2">3. At the Event</h2>
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              <li>Go to the entry gate with your QR code (on your phone or printed).</li>
              <li>An event staff member will scan your QR code.</li>
              <li>
                The scanner will show one of these results:
                <ul className="list-disc list-inside ml-5">
                  <li>✅ <strong>Valid Ticket</strong> → You can enter 🎉</li>
                  <li>⚠️ <strong>Already Used</strong> → Ticket has been scanned before</li>
                  <li>❌ <strong>Invalid Ticket</strong> → Ticket not recognized</li>
                </ul>
              </li>
            </ol>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl text-[#333333] font-semibold mb-2">4. Important Notes</h2>
            <ul className="list-disc list-inside ml-5 text-gray-700">
              <li>Each ticket can only be used <strong>once</strong>.</li>
              <li>
                If you try to reuse or share your QR code, it will be marked as{" "}
                <strong>already used</strong>.
              </li>
              <li>
                Always buy tickets directly from the official{" "}
                <strong>Airways Events website</strong>.
              </li>
            </ul>
          </section>

          <p className="text-center text-lg font-semibold text-green-600">
            ✨ That’s it! Enjoy your event 🎶💃🕺
          </p>

        </div>
      </div>
      <footer className='mt-10'>
        <img src={walkGif} alt='walking gif' className='w-20 h-20 animation-walk' />
      </footer>
    </>

  );
};

export default Guide;
