import React, { useEffect, useState } from 'react';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { 
  updateEmail, 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithPopup
} from "firebase/auth";
import { auth, db } from '../../firebase/firebase';
import logo from '../../assets/Default.png';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';
import { uploadToCloudinary } from '../../utils/cloudinaryUpload';
import { FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa6';

const UserProfile = ({ currentUser }) => {
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    profilePic: null,
    profilePicPreview: null,
  });

  const [activeTab, setActiveTab] = useState('details'); 
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  // Split eye-toggle flags
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Secure Auth Fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Hydrate profile data and check provider type
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        // Check if the user authenticated with Google
        const providerIds = user.providerData.map(p => p.providerId);
        setIsGoogleUser(providerIds.includes('google.com'));

        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData({
            fullName: data.fullName || user?.displayName || "",
            email: user.email || data.email || "", 
            phoneNumber: data.phoneNumber || "",
            profilePic: null,
            profilePicPreview: data.photoURL || null,
          });
          setNewEmail(user.email || data.email || "");
        }
      } catch (error) {
        console.error("Error loading user profile context:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData((prev) => ({
        ...prev,
        profilePic: file,
        profilePicPreview: URL.createObjectURL(file),
      }));
    }
  };

  // Adaptive re-verification module supporting Google & Email/Password sessions
  const handleReauthentication = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("No active session tracked.");

    if (isGoogleUser) {
      // Re-authenticate Google accounts using a fresh popup session
      const provider = new GoogleAuthProvider();
      return await reauthenticateWithPopup(user, provider);
    } else {
      // Re-authenticate standard accounts via password
      if (!currentPassword) throw new Error("Please enter your current password.");
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      return await reauthenticateWithCredential(user, credential);
    }
  };

  // Save Name, Phone, and Avatar modifications
  const handleSaveProfileDetails = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return alert("Session expired. Please log in again.");

      setLoading(true);
      let photoURL = profileData.profilePicPreview;

      if (profileData.profilePic) {
        photoURL = await uploadToCloudinary(profileData.profilePic);
      }

      await setDoc(
        doc(db, "users", user.uid),
        {
          fullName: profileData.fullName,
          phoneNumber: profileData.phoneNumber,
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
      alert("✅ Profile details updated successfully!");
    } catch (error) {
      console.error(error);
      alert("❌ Failed to update profile details.");
    } finally {
      setLoading(false);
    }
  };

  // Handle email changes across providers
  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    if (newEmail === auth.currentUser?.email) return alert("This matches your current email address.");

    try {
      setLoading(true);
      await handleReauthentication();
      
      await updateEmail(auth.currentUser, newEmail);
      await setDoc(doc(db, "users", auth.currentUser.uid), { email: newEmail }, { merge: true });

      setProfileData(prev => ({ ...prev, email: newEmail }));
      setCurrentPassword('');
      alert("✅ Email updated successfully!");
      setActiveTab('details');
    } catch (error) {
      console.error(error);
      alert(`❌ Email update failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Password structural update execution (Disabled for Google core authentications)
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return alert("New passwords do not match.");
    if (newPassword.length < 6) return alert("Password must be at least 6 characters long.");

    try {
      setLoading(true);
      await handleReauthentication();
      
      await updatePassword(auth.currentUser, newPassword);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrentPass(false);
      setShowNewPass(false);
      setShowConfirmPass(false);
      alert("✅ Password altered successfully!");
      setActiveTab('details');
    } catch (error) {
      console.error(error);
      alert(`❌ Security update failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div  className="w-full min-h-screen  p-4 md:p-8 flex justify-center items-start">
      <div className="flex flex-col bg-(--bg-color) p-6 rounded-xl shadow-md w-full max-w-2xl border border-gray-100 dark:border-gray-800">
        
        <h1 className="text-xl font-bold  mb-6">Account Profile</h1>

        {/* Tab Selection Row */}
        <div className="flex gap-2 shadow p-2 mb-6 text-sm font-medium">
          <button 
            type="button"
            onClick={() => { setActiveTab('details'); setIsEditing(false); }}
            className={`flex items-center gap-1.5 pb-3 px-2 border-b-2 transition-all ${activeTab === 'details' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400'}`}
          >
            <FiUser size={12} /> Details
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('email')}
            className={`flex items-center gap-1.5 pb-3 px-2 border-b-2 transition-all ${activeTab === 'email' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400'}`}
          >
            <FiMail size={12} /> Email 
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('password')}
            className={`flex items-center gap-1.5 pb-3 px-2 border-b-2 transition-all ${activeTab === 'password' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400'}`}
          >
            <FiLock size={12} /> Security
          </button>
        </div>

        {/* PROFILE PICTURE */}
        {activeTab === 'details' && (
          <div className="flex flex-col items-center space-y-3 mb-6">
            <div className="relative group">
              <img
                src={profileData.profilePicPreview || logo}
                alt="User Profile"
                className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover shadow-inner border border-gray-100 dark:border-gray-800"
              />
              {isEditing && (
                <label className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-[10px] text-white font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  Upload New
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>
            {isEditing && <p className="text-xs text-gray-400">Hover photo to swap avatar image file</p>}
          </div>
        )}

        <div>
          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleInputChange}
                      className="w-full mt-1 p-3 bg-(--bg-color) border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Phone Number</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      placeholder="+234..."
                      value={profileData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full mt-1 p-3 bg-(--bg-color) border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none text-sm"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleSaveProfileDetails}
                      disabled={loading}
                      className="flex-1 bg-orange-500 text-white py-2.5 rounded-lg hover:bg-orange-600 font-bold uppercase text-xs tracking-wider transition-all disabled:opacity-50"
                    >
                      {loading ? "Saving Changes..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-gray-100 dark:bg-gray-800 py-2.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 font-bold uppercase text-xs tracking-wider transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-(--bg-color)/40 p-4 rounded-xl space-y-3.5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Display Identity</p>
                      <p className="font-semibold mt-0.5">{profileData.fullName || "Guest Attendee"}</p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Registered Email</p>
                      <p className="text-sm font-medium mt-0.5 text-gray-600 dark:text-gray-300">{profileData.email}</p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Phone Line</p>
                      <p className="text-sm font-medium mt-0.5 text-gray-600 dark:text-gray-300">{profileData.phoneNumber || "No phone added"}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-bold uppercase text-xs tracking-widest transition-all shadow-md shadow-orange-500/10"
                  >
                    Edit Profile Details
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EMAIL SYNC */}
          {activeTab === 'email' && (
            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-lg text-xs text-orange-600 dark:text-orange-400 leading-relaxed">
                Notice: Altering your email updates your access credentials. For security verification, you will be prompted to authenticate your session.
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">New Delivery Email</label>
                <input
                  required
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full mt-1 p-3 bg-(--bg-color) border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                />
              </div>

              {/* Only render password validation fields if NOT a Google Auth provider account */}
              {!isGoogleUser ? (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Current Security Password</label>
                  <div className="relative mt-1">
                    <input
                      required
                      type={showCurrentPass ? "text" : "password"}
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full p-3 pr-10 bg-(--bg-color) border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                      {showCurrentPass ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-xs text-gray-500">
                  <FaGoogle className="text-red-500" /> Verify change via Google profile prompt upon submission.
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-bold uppercase text-xs tracking-wider disabled:opacity-50 transition-all"
              >
                {loading ? "Verifying..." : "Update Registered Email"}
              </button>
            </form>
          )}

          {/* TAB 3: SECURITY / PASSWORD ENGINE */}
          {activeTab === 'password' && (
            <div>
              {isGoogleUser ? (
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed dark:border-gray-800">
                  <FaGoogle size={28} className="text-red-500 animate-pulse" />
                  <h3 className="font-bold text-sm">Managed by Google Authentication</h3>
                  <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
                    This account is securely linked directly to your Google identity profile. Password modifications or recovery options must be altered via Google Account settings.
                  </p>
                  <a 
                    href="https://myaccount.google.com/signin-options" 
                    target="_blank" 
                    rel="noreferrer"
                    className="mt-2 text-xs font-semibold text-orange-500 hover:underline"
                  >
                    Go to Google Account Manager &rarr;
                  </a>
                </div>
              ) : (
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Current Security Password</label>
                    <div className="relative mt-1">
                      <input
                        required
                        type={showCurrentPass ? "text" : "password"}
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full p-3 pr-10 bg-(--bg-color) border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      >
                        {showCurrentPass ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-800 my-2" />

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">New Secret Password</label>
                    <div className="relative mt-1">
                      <input
                        required
                        type={showNewPass ? "text" : "password"}
                        placeholder="6 characters minimum"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full p-3 pr-10 bg-(--bg-color) border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      >
                        {showNewPass ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Verify New Password</label>
                    <div className="relative mt-1">
                      <input
                        required
                        type={showConfirmPass ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full p-3 pr-10 bg-(--bg-color) border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      >
                        {showConfirmPass ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-bold uppercase text-xs tracking-wider disabled:opacity-50 transition-all"
                  >
                    {loading ? "Saving Changes..." : "Save New Password"}
                  </button>
                </form>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default UserProfile;