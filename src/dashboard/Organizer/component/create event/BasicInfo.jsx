import React from "react";

const categories = [
  { icon: "🎵", value: "Music" },
  { icon: "🎤", value: "Conference" },
  { icon: "🙏", value: "Church" },
  { icon: "⚽", value: "Sports" },
  { icon: "🎭", value: "Comedy" },
  { icon: "🎬", value: "Entertainment" },
  { icon: "🎓", value: "Workshop" },
  { icon: "🎉", value: "Festival" },
  { icon: "🛍️", value: "Exhibition" },
  { icon: "✨", value: "Other" }
];

const BasicInfo = ({
  name,
  setName,
  category,
  setCategory,
}) => {
  return (
    <div className="space-y-8">

      <div>
        <label className="font-semibold text-lg">
          Event Name
        </label>

        <input
          value={name}
          onChange={(e)=>setName(e.target.value)}
          placeholder="ERROR 404"
          className="mt-2 w-full rounded-xl border border-(--border) p-4"
        />
      </div>

      <div>

        <label className="font-semibold text-lg">
          Event Type
        </label>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">

          {categories.map(type=>(
            <button
              key={type.value}
              type="button"
              onClick={()=>setCategory(type.value)}
              className={`rounded-2xl border border-(--border) px-10 py-2 transition text-xs flex flex-col justify-center items-center gap-2 flex-1
              ${
                category===type.value
                ? "border-(--primary) bg-(--primary) text-white"
                :"hover:border-(--primary)"
              }`}
            >

              <div className="text-3xl">
                {type.icon}
              </div>

              <p className="mt-3 font-medium">
                {type.value}
              </p>

            </button>
          ))}

        </div>

      </div>

    </div>
  )
}

export default BasicInfo