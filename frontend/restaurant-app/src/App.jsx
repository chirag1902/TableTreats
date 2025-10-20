import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RestaurantDashboard from "./pages/Dashboard";
import RestaurantOnboarding from "./pages/OnboardingForm";
import RestaurantEditForm from "./pages/RestaurantEditForm";
import SignIn from "./pages/SignIn";
import Landing from "./pages/Landing";
import SignUp from "./pages/Signup";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<RestaurantDashboard />} />
        <Route path="/onboarding" element={<RestaurantOnboarding />} />
        <Route path="/edit-profile" element={<RestaurantEditForm />} />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
