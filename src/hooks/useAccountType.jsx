import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

export const useAccountType = (user) => {
  const [accountType, setAccountType] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchAccountType = async () => {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setAccountType(docSnap.data().accountType);
      }
    };

    fetchAccountType();
  }, [user]);

  return accountType;
};
