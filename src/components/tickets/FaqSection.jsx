import React, { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

const FAQSection = ({ faqs = [] }) => {
  const [open, setOpen] = useState(null);

  if (!faqs.length) return null;

  return (
    <section className="space-y-8">

      <div>
        <h2 className="text-3xl font-bold">
          Frequently Asked Questions
        </h2>

        <p className="opacity-70">
          Everything you need to know before attending.
        </p>
      </div>

      <div className="space-y-4">

        {faqs.map((faq, index) => (
          <div
            key={faq.id || index}
            className="rounded-2xl border overflow-hidden bg-white dark:bg-zinc-900"
          >
            <button
              onClick={() =>
                setOpen(open === index ? null : index)
              }
              className="w-full flex justify-between items-center p-5 text-left"
            >
              <span className="font-semibold">
                {faq.question}
              </span>

              <FiChevronDown
                className={`transition duration-300 ${
                  open === index ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`transition-all duration-300 overflow-hidden ${
                open === index
                  ? "max-h-96 p-5 pt-0"
                  : "max-h-0"
              }`}
            >
              <p className="opacity-80">
                {faq.answer}
              </p>
            </div>
          </div>
        ))}

      </div>

    </section>
  );
};

export default FAQSection;