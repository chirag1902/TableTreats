import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const nav = useNavigate();
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("restaurant_token");
    if (!token) {
      nav("/");
      return;
    }
    // TODO: fetch /restaurants/me when endpoint ready
    // stub for now
    setRestaurant({ name: "Bella Vista" });
  }, [nav]);

  if (!restaurant) return <p className="p-8">Loading…</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">
          Welcome back, {restaurant.name}
        </h1>
        <button
          onClick={() => {
            localStorage.removeItem("restaurant_token");
            nav("/");
          }}
          className="text-sm text-gray-600 underline"
        >
          Logout
        </button>
      </header>

      <main className="p-6 grid md:grid-cols-3 gap-6">
        <Card
          title="Reservations"
          desc="Accept or reject table bookings"
          action="Manage"
        />
        <Card
          title="Live Deals"
          desc="Create flash deals & happy hours"
          action="Create"
        />
        <Card
          title="Menu & Profile"
          desc="Update menu, photos, hours"
          action="Edit"
        />
      </main>
    </div>
  );
}

function Card({ title, desc, action }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col justify-between">
      <div>
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{desc}</p>
      </div>
      <button className="mt-4 w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600">
        {action}
      </button>
    </div>
  );
}