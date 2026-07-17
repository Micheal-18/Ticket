import React, { useEffect, useRef } from "react";
import {
  FiUploadCloud,
  FiRefreshCw,
  FiTrash2,
  FiImage,
} from "react-icons/fi";

const coverStyles = [
  {
    id: "standard",
    title: "Standard",
    description: "Normal hero image",
  },
  {
    id: "blur",
    title: "Blur Hero",
    description: "Blurred background",
  },
  {
    id: "glass",
    title: "Glass",
    description: "Glass card layout",
  },
  {
    id: "gradient",
    title: "Gradient",
    description: "Gradient background",
  },
];

const CoverUpload = ({
  photo,
  setPhoto,
  coverStyle,
  setCoverStyle,
}) => {

    const [preview, setPreview] = React.useState(null);
  const inputRef = useRef(null);

useEffect(() => {
  if (!photo) {
    setPreview(null);
    return;
  }

  // If photo is already a URL (Cloudinary/Firebase)
  if (typeof photo === "string") {
    setPreview(photo);
    return;
  }

  // If photo is a newly uploaded file
  if (photo instanceof File) {
    const url = URL.createObjectURL(photo);

    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }

}, [photo]);
const handleChange = (e) => {
  if (!e.target.files?.length) return;

  setPhoto(e.target.files[0]);
};

  return (
    <section className="space-y-6">

      <div>
        <h2 className="text-2xl font-bold">
          Event Cover
        </h2>

        <p className="text-xs text-gray-500">
          Your cover is the first thing attendees see.
        </p>
      </div>

      {!preview ? (
        <div
          onClick={() => inputRef.current.click()}
          className="border-2 border-dashed border-orange-400 rounded-3xl p-12 cursor-pointer hover:bg-orange-50 dark:hover:bg-(--primary)/10 transition"
        >
          <div className="flex flex-col items-center">

            <FiUploadCloud
              size={60}
              className="text-(--primary)"
            />

            <h3 className="mt-4 text-xl font-semibold">
              Upload Event Cover
            </h3>

            <p className="mt-2 text-gray-500">
              Drag & Drop or click to browse
            </p>

            <span className="mt-4 text-xs opacity-70">
              PNG • JPG • WEBP
            </span>

            <span className="text-xs opacity-70">
              Recommended 1920 × 1080
            </span>

          </div>

          <input
            ref={inputRef}
            hidden
            type="file"
            accept="image/*"
            onChange={handleChange}
          />
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-3xl shadow-lg">

            <img
              src={preview}
              alt="Preview"
              className="w-full h-[320px] object-cover"
            />

          </div>

          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              onClick={() => inputRef.current.click()}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-(--primary) text-white hover:bg-orange-600"
            >
              <FiRefreshCw />
              Replace
            </button>

            <button
              type="button"
              onClick={() => setPhoto(null)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border text-red-500 hover:bg-red-50"
            >
              <FiTrash2 />
              Remove
            </button>

            <input
              hidden
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleChange}
            />

          </div>
        </>
      )}

      <div className="space-y-4">

        <h3 className="font-semibold text-lg">
          Display Style
        </h3>

        <div className="grid md:grid-cols-2 gap-4">

          {coverStyles.map((style) => (

            <button
              key={style.id}
              type="button"
              onClick={() => setCoverStyle(style.id)}
              className={`rounded-2xl border border-(--border) p-5 text-left transition ${
                coverStyle === style.id
                  ? "border-(--primary) bg-(--primary) text-white"
                  : "hover:border-(--primary)"
              }`}
            >

              <FiImage
                size={28}
                className="mb-3"
              />

              <h4 className="font-semibold">
                {style.title}
              </h4>

              <p className="text-sm opacity-80 mt-1">
                {style.description}
              </p>

            </button>

          ))}

        </div>

      </div>

      <div className="rounded-2xl bg-orange-100 dark:bg-(--primary)/10 p-5">

        <h4 className="font-semibold">
          Airticks Tips 💡
        </h4>

        <ul className="mt-3 space-y-2 text-xs">

          <li>• Use a landscape image (16:9).</li>

          <li>• Keep important text away from the edges.</li>

          <li>• Use high-resolution images.</li>

          <li>• Avoid blurry flyers.</li>

          <li>• Bright covers usually attract more clicks.</li>

        </ul>

      </div>

    </section>
  );
};

export default CoverUpload;