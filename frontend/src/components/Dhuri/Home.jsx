import React, { useState, useEffect } from 'react';
import {
  Shield, AlertTriangle, Heart, Users,
  Phone, MapPin, MessageSquare, ThumbsUp, Zap, Globe
} from 'lucide-react';

const Home = () => {
  const testimonials = [
    {
      id: 1,
      quote: "NaariSeva helped me feel safe during my late-night commute. The emergency features are a lifesaver!",
      author: "Priya M., Bangalore"
    },
    {
      id: 2,
      quote: "As a college student, this app gives me confidence to move around campus at night.",
      author: "Ananya S., Delhi"
    },
    {
      id: 3,
      quote: "The real-time location sharing with my family gives us all peace of mind.",
      author: "Neha R., Mumbai"
    },
    {
      id: 4,
      quote: "I reported an incident using NaariSeva and received immediate support. It's powerful and easy to use.",
      author: "Kavita R., Pune"
    }
  ];

  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [stats, setStats] = useState([
    { value: "85%", label: "Women feel unsafe at night", icon: <AlertTriangle className="w-8 h-8" /> },
    { value: "1 in 3", label: "Women experience harassment", icon: <Heart className="w-8 h-8" /> },
    { value: "60%", label: "Incidents go unreported", icon: <Users className="w-8 h-8" /> }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-pink-50 text-gray-900">

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Your Safety, <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-pink-500">Our Priority</span>
        </h1>
        <p className="text-xl text-pink-700 max-w-3xl mx-auto mb-10">
          NaariSeva provides real-time protection and emergency assistance for women through advanced AI technology and community support.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="bg-rose-600 hover:bg-rose-700 px-8 py-3 rounded-lg text-lg font-semibold text-white transition transform hover:scale-105">
            Get Protected Now
          </button>
          <button className="bg-transparent border-2 border-rose-500 text-rose-600 hover:bg-rose-50 px-8 py-3 rounded-lg text-lg font-semibold transition transform hover:scale-105">
            Learn More
          </button>
        </div>
      </section>

      {/* Quote Banner */}
      <section className="bg-white py-8">
        <div className="container mx-auto text-center px-4">
          <p className="text-xl italic text-gray-600">
            "Empowered women empower societies. Let safety be your right, not a privilege."
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">
            The Stark Reality of Women's Safety
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="text-purple-500 mb-4">{stat.icon}</div>
                <h3 className="text-4xl font-bold mb-2 text-rose-600">{stat.value}</h3>
                <p className="text-gray-700">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-center text-lg text-gray-600 max-w-3xl mx-auto">
            At NaariSeva, we believe every woman deserves to feel safe, wherever she goes. Our app bridges the gap between concern and confidence.
          </p>
        </div>
      </section>

      {/* Protection Features */}
      <section className="py-20 bg-gradient-to-b from-white to-rose-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">
            How NaariSeva Protects You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Feature icon={<Phone className="w-6 h-6 text-purple-600" />} title="Instant Emergency Alerts" text="One-tap emergency button sends your location and activates audio/video recording to trusted contacts." />
            <Feature icon={<MapPin className="w-6 h-6 text-teal-600" />} title="Live Location Sharing" text="Share your live location with family while traveling in unsafe or unfamiliar areas." />
            <Feature icon={<MessageSquare className="w-6 h-6 text-emerald-600" />} title="AI Harassment Detection" text="Our AI constantly analyzes surrounding behavior and movement to detect threats early." />
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">Why Choose NaariSeva?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <WhyItem icon={<ThumbsUp className="w-8 h-8 text-pink-500 mx-auto" />} title="Trusted Nationwide" text="Used by women across India with 100,000+ safe alerts sent." />
            <WhyItem icon={<Zap className="w-8 h-8 text-yellow-500 mx-auto" />} title="Fast Response" text="Get help in seconds with automated smart emergency protocols." />
            <WhyItem icon={<Globe className="w-8 h-8 text-blue-500 mx-auto" />} title="24/7 Protection" text="Always active, always alert—safety around the clock." />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-b from-rose-50 to-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-16">Voices of Women We Protect</h2>
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg relative">
            <div className="absolute -top-5 -left-5 text-6xl text-rose-300">"</div>
            <p className="text-xl italic mb-6 text-gray-700">
              {testimonials[currentTestimonial].quote}
            </p>
            <p className="text-rose-600 font-semibold">
              — {testimonials[currentTestimonial].author}
            </p>
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full ${currentTestimonial === index ? 'bg-rose-500' : 'bg-rose-200'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-rose-500 to-pink-500">
        <div className="container mx-auto px-6 text-center">
          <div className="rounded-2xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Ready to Take Control of Your Safety?
            </h2>
            <p className="text-xl text-rose-100 max-w-2xl mx-auto mb-10">
              Join thousands of empowered women using NaariSeva for daily confidence and peace of mind.
            </p>
            <button className="bg-white text-rose-600 hover:bg-rose-100 px-8 py-4 rounded-lg text-lg font-bold transition transform hover:scale-105">
              Download Now - It's Free
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

// Reusable Feature Card
const Feature = ({ icon, title, text }) => (
  <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition">
    <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6 bg-rose-100">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-gray-600">{text}</p>
  </div>
);

// Reusable Why Choose Card
const WhyItem = ({ icon, title, text }) => (
  <div className="p-6 bg-rose-50 rounded-xl shadow hover:shadow-lg transition">
    {icon}
    <h4 className="mt-4 font-semibold text-lg">{title}</h4>
    <p className="text-gray-600 mt-2">{text}</p>
  </div>
);

export default Home;
