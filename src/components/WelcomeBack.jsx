import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const WelcomeBack = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

useEffect(() => {
  if (!state?.redirectTo) {
    navigate("/login", { replace: true });
    return;
  }

  const timer = setTimeout(() => {
    navigate(state.redirectTo, { replace: true });
  }, 2500);

  return () => clearTimeout(timer);
}, [state?.redirectTo, navigate]);


  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-lg md:text-4xl font-bold italic">
        Welcome back, {state?.userData?.fullName}
      </h1>
      <p className="opacity-70 mt-2">Preparing your dashboard…</p>
    </div>
  );
};

export default WelcomeBack;
