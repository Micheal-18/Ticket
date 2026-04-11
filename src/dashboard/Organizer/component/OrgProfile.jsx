import React, { useEffect, useState } from 'react';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { uploadToCloudinary } from '../../../utils/cloudinaryUpload';
import { auth, db } from '../../../firebase/firebase';
import logo from '../../../assets/Default.png'
import { FiX } from 'react-icons/fi';

const OrgProfile = ({profileOpen, setProfileOpen}) => {
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    bio: '',
    profilePic: null,
    profilePicPreview: null,
  });

  

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Load user data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData({
            fullName: data.fullName || "",
            email: data.email || "",
            bio: data.bio || "",
            profilePic: null,
            profilePicPreview: data.photoURL || null,
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };

    fetchProfile();
  }, []);

  // ✅ Input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Image select
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData((prev) => ({
        ...prev,
        profilePic: file,
        profilePicPreview: URL.createObjectURL(file), // preview only
      }));
    }
  };

  // ✅ Save profile (Cloudinary + Firestore)
  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return alert("Not logged in");

      setLoading(true);

      let photoURL = profileData.profilePicPreview;

      // Upload if new image selected
      if (profileData.profilePic) {
        photoURL = await uploadToCloudinary(profileData.profilePic);
      }

      await setDoc(
        doc(db, "users", user.uid),
        {
          fullName: profileData.fullName,
          email: profileData.email,
          bio: profileData.bio,
          photoURL: photoURL,
        },
        { merge: true }
      );

      setProfileData((prev) => ({
        ...prev,
        profilePic: null,
        profilePicPreview: photoURL,
      }));

      setIsEditing(false);
      alert("✅ Profile updated!");
    } catch (error) {
      console.error(error);
      alert("❌ Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 mb-10  w-full h-full bg-black/40 backdrop-blur-sm flex justify-center items-center z-[9999]">
      <div className="relative flex flex-col bg-(--bg-color) dark:bg-(--bg-color) text-(--text-color) dark:text-(--text-color) space-y-4 p-6 rounded-lg shadow-lg w-[80%] md:w-[60%] max-h-[80vh] custom-scrollbar overflow-y-auto">

        {/* Header */}
        <h1 className="text-2xl font-bold text-center uppercase">Profile</h1>

        <button
  onClick={() => setProfileOpen(false)}
  className="absolute right-4 top-6 text-lg hover:scale-110"
>
  <FiX />
</button>

        {/* Profile Image */}
        <div className="flex flex-col items-center space-y-3">
          {profileData.profilePicPreview ? (
            <img
              src={profileData.profilePicPreview}
              alt="Profile"
              className="w-50 h-50 rounded-full object-cover shadow-md"
            />
          ) : (
            <div className="w-50 h-50 flex items-center justify-center rounded-full bg-gray-300 text-gray-600">
             <img src={logo} alt="logo" className="w-50 h-50 rounded-full" />
            </div>
          )}

          {isEditing && (
            <label className="px-4 py-2 bg-orange-500 text-white rounded-lg cursor-pointer hover:bg-orange-600">
              Change Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Info */}
        <div>
          {isEditing ? (
            <div className="space-y-4">

              <div>
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Bio</label>
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save"}
                </button>

                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-gray-300 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>

            </div>
          ) : (
            <div className="space-y-4">

              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{profileData.fullName || "Not set"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{profileData.email || "Not set"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Bio</p>
                <p className="font-medium">{profileData.bio || "Not set"}</p>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600"
              >
                Edit Profile
              </button>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default OrgProfile;