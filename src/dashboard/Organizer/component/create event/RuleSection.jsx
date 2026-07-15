import React from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";

const RulesSection = ({
  faqs,
  setFaqs,
  rules,
  setRules,
}) => {

  const addFAQ = () => {
    setFaqs([
      ...faqs,
      {
        id: crypto.randomUUID(),
        question: "",
        answer: "",
      },
    ]);
  };

  const updateFAQ = (id, field, value) => {
    setFaqs(
      faqs.map(item =>
        item.id === id
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  const removeFAQ = id => {
    setFaqs(
      faqs.filter(item => item.id !== id)
    );
  };

  return (
    <section className="space-y-8">

      <div>

        <h2 className="text-2xl font-bold">
          Rules & FAQs
        </h2>

        <p className="text-xs opacity-70">
          Help attendees prepare before arriving.
        </p>

      </div>

      <div>

        <label className="font-semibold">
          Event Rules
        </label>

        <textarea
          rows={5}
          value={rules}
          onChange={(e)=>setRules(e.target.value)}
          placeholder="No smoking...
No weapons...
Respect everyone..."
          className="mt-2 w-full rounded-xl border p-4"
        />

      </div>

      <div className="flex justify-between items-center">

        <h3 className="text-xl font-semibold">
          Frequently Asked Questions
        </h3>

        <button
          type="button"
          onClick={addFAQ}
          className="bg-(--primary) text-white px-4 py-3 rounded-xl flex items-center gap-2"
        >
          <FiPlus />

          Add FAQ

        </button>

      </div>

      {faqs.map(faq=>(

        <div
          key={faq.id}
          className="rounded-2xl border p-5 space-y-4"
        >

          <input
            placeholder="Question"
            value={faq.question}
            onChange={(e)=>
              updateFAQ(
                faq.id,
                "question",
                e.target.value
              )
            }
            className="w-full rounded-xl border p-4"
          />

          <textarea
            rows={3}
            placeholder="Answer"
            value={faq.answer}
            onChange={(e)=>
              updateFAQ(
                faq.id,
                "answer",
                e.target.value
              )
            }
            className="w-full rounded-xl border p-4"
          />

          <button
            type="button"
            onClick={()=>removeFAQ(faq.id)}
            className="text-red-500 flex items-center gap-2"
          >

            <FiTrash2 />

            Remove

          </button>

        </div>

      ))}

    </section>
  );
};

export default RulesSection;