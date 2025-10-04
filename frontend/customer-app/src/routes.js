import { Routes, Route } from "react-router-dom";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} /> {/* default route */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="*" element={<Login />} /> {/* fallback for unknown paths */}
    </Routes>
  );
}
