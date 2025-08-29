import axios from "axios";

export const uploadToCloudinary = async (file) => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "rx4x4sd4"); // replace with your preset name

  try {
    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/dkny4uowy/image/upload`,  // 👈 specify "image/upload"
      data
    );
    return res.data.secure_url; // ✅ final image/video URL
  } catch (err) {
    console.error("Upload error:", err);
    throw err;
  }
};
