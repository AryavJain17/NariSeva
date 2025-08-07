import React from 'react';
import { Users, HeartHandshake, Lightbulb, Globe, Shield, Activity, MessageSquare, MapPin } from 'lucide-react';

export default function AboutUs() {
  const stats = [
    { value: "50K+", label: "Women Protected", icon: <Shield className="w-6 h-6" /> },
    { value: "120+", label: "Cities Covered", icon: <MapPin className="w-6 h-6" /> },
    { value: "24/7", label: "Support Available", icon: <MessageSquare className="w-6 h-6" /> },
    { value: "95%", label: "Response Rate", icon: <Activity className="w-6 h-6" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white py-12 px-6 md:px-12 lg:px-24">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-rose-600 mb-6">
          About <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-pink-500">NaariSeva</span>
        </h1>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
          Born from a powerful vision to create safer spaces for women, NaariSeva combines technology, community, and compassion to build a movement that empowers and protects.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20 max-w-5xl mx-auto">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="text-rose-500 mb-3">
              {stat.icon}
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Mission Section */}
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="flex items-center mb-6">
              <div className="bg-rose-100 p-3 rounded-full mr-4">
                <HeartHandshake className="text-rose-600 w-6 h-6" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Our Mission</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              We empower women with real-time safety tools, emotional support resources, and community networks. From harassment reporting to emergency response, we're building comprehensive solutions that address both physical safety and mental wellbeing.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="flex items-center mb-6">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <Lightbulb className="text-purple-600 w-6 h-6" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Innovation with Impact</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Using AI-powered harassment detection, predictive risk mapping, and verified community networks, NaariSeva goes beyond traditional safety apps. Our technology adapts to real-world challenges through continuous research and user feedback.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="flex items-center mb-6">
              <div className="bg-teal-100 p-3 rounded-full mr-4">
                <Users className="text-teal-600 w-6 h-6" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">The Team</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              A passionate collective of technologists, social workers, and survivors working across India. Our diversity is our strength — engineers, psychologists, and activists united by the goal of creating safer communities through empathy-driven solutions.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="flex items-center mb-6">
              <div className="bg-emerald-100 p-3 rounded-full mr-4">
                <Globe className="text-emerald-600 w-6 h-6" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Our Vision</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              We envision cities where women reclaim public spaces without fear. Through technology, education, and policy advocacy, we're working toward a cultural shift where safety becomes the norm, not the exception.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-12 text-white mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Protection First</h3>
              <p>Every feature prioritizes immediate safety without compromise</p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeartHandshake className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Power</h3>
              <p>Verified networks create real-world safety nets</p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Innovate Boldly</h3>
              <p>We challenge norms to develop breakthrough solutions</p>
            </div>
          </div>
        </div>

        {/* Closing Statement */}
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-xl font-medium text-gray-700 mb-6">
            "NaariSeva isn't just building an app — we're cultivating a movement where safety becomes fundamental to the female experience in India."
          </p>
          <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-pink-500">
            Join us in creating a safer tomorrow.
          </p>
        </div>
      </div>
    </div>
  );
}