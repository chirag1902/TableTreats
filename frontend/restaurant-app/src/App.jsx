import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RestaurantDashboard from "./pages/Dashboard";
import RestaurantOnboarding from "./pages/OnboardingForm";
import RestaurantEditForm from "./pages/RestaurantEditForm";
import SeatingConfiguration from './pages/SeatingConfiguration';
import AllReservations from './pages/AllReservations';
import CreateDealPage from './pages/CreateDealPage';
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
        <Route path="/seating-configuration" element={<SeatingConfiguration />} />
        <Route path="/reservations" element={<AllReservations />} />
        <Route path="/deals" element={<CreateDealPage />} />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
