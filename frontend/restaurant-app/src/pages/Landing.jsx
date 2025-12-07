import React, { useRef, useState } from "react";
import {
  TrendingUp,
  Users,
  Zap,
  BarChart3,
  Shield,
  Smartphone,
  ChevronRight,
  Star,
  ArrowRight,
  Play,
  X,
} from "lucide-react";
import authSideImage from "./assets/auth-side.png";

export default function Landing() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);

  const scrollTo = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
              T
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              TableTreats
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => scrollTo(featuresRef)}
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Features
            </button>
            <button
              onClick={() => scrollTo(howItWorksRef)}
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              How It Works
            </button>
            <button
              onClick={() => (window.location.href = "/signin")}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section
        className="relative overflow-hidden w-full h-screen flex items-center justify-center"
        style={{
          backgroundImage: `url(${authSideImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="relative z-10 text-center px-4 max-w-2xl">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Bring More Guests to Your Tables
          </h1>
          <p className="text-lg md:text-xl text-white/95 mb-12 leading-relaxed">
            TableTreats Partner helps restaurants grow dine-in traffic through
            real-time reservations, local discovery, and smart deals — all
            without commissions or hidden costs. Boost your visibility and fill
            every seat.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => (window.location.href = "/signin")}
              className="px-8 py-3 bg-white text-purple-600 font-bold rounded-lg hover:shadow-2xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 group"
            >
              Sign In{" "}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scrollTo(featuresRef)}
              className="px-8 py-3 bg-white text-gray-900 font-bold rounded-lg hover:shadow-2xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 group"
            >
              Learn More ↓
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section ref={featuresRef} className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to Grow
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful tools designed specifically for restaurant success
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                color: "from-orange-500 to-red-500",
                title: "Smart Deals",
                desc: "Launch flash offers, happy hours, and seasonal promos in seconds. Boost off-peak traffic instantly.",
              },
              {
                icon: <Users className="w-8 h-8" />,
                color: "from-pink-500 to-rose-500",
                title: "Real-Time Reservations",
                desc: "Manage bookings, guest preferences, and table assignments all in one dashboard.",
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                color: "from-purple-500 to-indigo-500",
                title: "Analytics & Insights",
                desc: "Track occupancy, revenue, popular dishes, and customer trends instantly.",
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                color: "from-green-500 to-emerald-500",
                title: "Local Discovery",
                desc: "Get featured in search results for local diners looking for your cuisine.",
              },
              {
                icon: <Shield className="w-8 h-8" />,
                color: "from-blue-500 to-cyan-500",
                title: "Zero Commission",
                desc: "Keep 100% of your revenue. Transparent pricing with no hidden fees.",
              },
              {
                icon: <Smartphone className="w-8 h-8" />,
                color: "from-indigo-500 to-purple-500",
                title: "Mobile Friendly",
                desc: "Manage everything from your phone. Perfect for busy restaurant operations.",
              },
            ].map((feature, idx) => (
              <div key={idx} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-white border border-gray-200 rounded-2xl p-8 hover:border-pink-300 transition-all h-full">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        ref={howItWorksRef}
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple Setup, Real Results
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in minutes, not weeks
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Create Profile",
                desc: "Add your restaurant details, photos, menu, and hours",
              },
              {
                step: "02",
                title: "Configure Settings",
                desc: "Set table layouts, seating capacity, and operating hours",
              },
              {
                step: "03",
                title: "Launch Deals",
                desc: "Create promotions and manage special offers",
              },
              {
                step: "04",
                title: "Start Growing",
                desc: "Accept reservations and track performance in real-time",
              },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl p-8 h-full">
                  <div className="text-5xl font-black text-transparent bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 justify-center items-center w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Fill Every Table?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join 500+ restaurants already growing with TableTreats Partner.
            Start your free trial today.
          </p>
          <button
            onClick={() => (window.location.href = "/signin")}
            className="px-10 py-4 bg-white text-purple-600 font-bold rounded-lg hover:shadow-2xl transition-all transform hover:scale-105 text-lg flex items-center justify-center gap-2 mx-auto group"
          >
            Get Started Now{" "}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  T
                </div>
                <span className="font-bold text-white">TableTreats</span>
              </div>
              <p className="text-sm">
                Dine-in growth platform for restaurants.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Updates
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>
              © 2025 TableTreats. All rights reserved. | partner@tabletreats.com
            </p>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      {isVideoOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="relative max-w-2xl w-full">
            <button
              onClick={() => setIsVideoOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="bg-gray-900 rounded-2xl aspect-video flex items-center justify-center">
              <div className="text-center">
                <Play className="w-16 h-16 text-white mx-auto mb-4" />
                <p className="text-white text-lg">Demo Video Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
