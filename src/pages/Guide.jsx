// src/pages/Guide.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  FiCalendar,
  FiCreditCard,
  FiMail,
  FiMapPin,
  FiShield,
  FiHelpCircle,
  FiUsers,
  FiArrowRight,
} from "react-icons/fi";
import walkGif from "../assets/dog.gif";

const steps = [
  {
    icon: <FiCalendar size={26} />,
    title: "Discover Events",
    description:
      "Browse concerts, conferences, church programs, sports, festivals, comedy shows, workshops, exhibitions and more. View event details, venue, schedule and ticket prices before booking.",
  },
  {
    icon: <FiCreditCard size={26} />,
    title: "Purchase Tickets",
    description:
      "Choose your preferred ticket type, select the quantity, provide attendee information if required and complete your payment securely.",
  },
  {
    icon: <FiUsers size={26} />,
    title: "Multiple Attendees",
    description:
      "Buying for friends or family? AirTicks lets you register multiple attendees in one purchase. Every attendee receives their own unique ticket.",
  },
  {
    icon: <FiMail size={26} />,
    title: "Receive Your Ticket",
    description:
      "After successful payment, you'll receive a confirmation email containing your ticket details, order reference and unique QR code.",
  },
  {
    icon: <FiMapPin size={26} />,
    title: "Attend Your Event",
    description:
      "Arrive at the venue, present your QR code on your phone or as a printed copy and let the event staff scan it for quick entry.",
  },
  {
    icon: <FiShield size={26} />,
    title: "Stay Secure",
    description:
      "Never share your QR code publicly. Every ticket can only be scanned once. Purchase tickets only through the official AirTicks platform.",
  },
];

const faqs = [
  {
    question: "I haven't received my ticket.",
    answer:
      "Check your Spam or Promotions folder. If you still can't find it, contact our support team.",
  },
  {
    question: "Can I use my phone instead of printing my ticket?",
    answer:
      "Yes. Simply present the QR code on your mobile device at the event entrance.",
  },
  {
    question: "Can I buy tickets for other people?",
    answer:
      "Absolutely. During checkout, you can add multiple attendees and each person receives their own ticket.",
  },
  {
    question: "What happens if my ticket has already been scanned?",
    answer:
      "Tickets can only be used once. If your ticket has already been scanned, entry will be denied.",
  },
];

const Guide = () => {
  return (
    <>
      <section className="min-h-screen bg-(--bg-color) text-(--text-color) py-16 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Hero */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-(--primary)/10 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold">
              🎟 AirTicks Guide
            </div>

            <h1 className="mt-6 text-4xl md:text-5xl font-black">
              Everything You Need to Know
            </h1>

            <p className="mt-4 text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-7">
              Learn how to discover events, purchase tickets, receive your QR
              code and enjoy a seamless event experience with AirTicks.
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {steps.map((step, index) => (
              <div
                key={index}
                className="rounded-3xl border border-(--border) bg-(--bg-color) p-7 shadow-sm hover:shadow-lg transition"
              >
                <div className="w-14 h-14 rounded-2xl bg-(--primary) text-white flex items-center justify-center">
                  {step.icon}
                </div>

                <h2 className="mt-5 text-xl font-bold">
                  {step.title}
                </h2>

                <p className="mt-3 text-zinc-500 dark:text-zinc-400 leading-7">
                  {step.description}
                </p>
              </div>
            ))}

          </div>

          {/* Ticket Status */}
          <div className="mt-16 rounded-3xl border border-(--border) p-8">
            <h2 className="text-2xl font-bold mb-6">
              Ticket Status
            </h2>

            <div className="grid md:grid-cols-3 gap-5">

              <div className="rounded-2xl bg-green-500/10 p-5 border border-green-500/20">
                <h3 className="font-bold text-green-600">
                  ✅ Valid
                </h3>

                <p className="mt-2 text-sm text-zinc-500">
                  Your ticket is genuine and ready for entry.
                </p>
              </div>

              <div className="rounded-2xl bg-yellow-500/10 p-5 border border-yellow-500/20">
                <h3 className="font-bold text-yellow-600">
                  ⚠ Already Used
                </h3>

                <p className="mt-2 text-sm text-zinc-500">
                  This QR code has already been scanned.
                </p>
              </div>

              <div className="rounded-2xl bg-red-500/10 p-5 border border-red-500/20">
                <h3 className="font-bold text-red-600">
                  ❌ Invalid
                </h3>

                <p className="mt-2 text-sm text-zinc-500">
                  The ticket could not be verified.
                </p>
              </div>

            </div>
          </div>

          {/* FAQ */}
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-6">
              <FiHelpCircle size={28} />
              <h2 className="text-3xl font-bold">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-5">

              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-(--border) p-6"
                >
                  <h3 className="font-semibold text-lg">
                    {faq.question}
                  </h3>

                  <p className="mt-2 text-zinc-500 dark:text-zinc-400">
                    {faq.answer}
                  </p>
                </div>
              ))}

            </div>
          </div>

          {/* Help */}
          <div className="mt-16 rounded-3xl bg-(--primary) text-white p-10 text-center">
            <h2 className="text-3xl font-bold">
              Need More Help?
            </h2>

            <p className="mt-4 max-w-2xl mx-auto opacity-90">
              Our support team is available to help with ticket purchases,
              payments, missing confirmation emails and other event-related
              questions.
            </p>

            <Link
              to="/contact"
              className="inline-flex items-center gap-2 mt-8 bg-white text-(--primary) font-semibold px-6 py-3 rounded-xl hover:scale-105 transition"
            >
              Contact Support
              <FiArrowRight />
            </Link>
          </div>

        </div>
      </section>

      <footer className="flex justify-center py-8">
        <img
          src={walkGif}
          alt="Walking mascot"
          className="w-20 h-20 animation-walk"
        />
      </footer>
    </>
  );
};

export default Guide;