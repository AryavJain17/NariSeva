import React from 'react';
import { Mail, Phone, MapPin, MessageSquare, Send } from 'lucide-react';

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white py-12 px-6 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-rose-600 mb-4">
            Contact <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-pink-500">NaariSeva</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            We're here to help and answer any questions you might have.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-20">
          

          <div className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <MessageSquare className="text-rose-600 w-6 h-6 mr-3" />
              Send us a message
            </h2>
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-gray-700 mb-2">Your Name</label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-gray-700 mb-2">Subject</label>
                <select
                  id="subject"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  <option>General Inquiry</option>
                  <option>Emergency Support</option>
                  <option>Technical Help</option>
                  <option>Partnership</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-gray-700 mb-2">Message</label>
                <textarea
                  id="message"
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Type your message here..."
                ></textarea>
              </div>
              <button
                type="submit"
                className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-lg font-medium flex items-center"
              >
                <Send className="w-5 h-5 mr-2" />
                Send Message
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <div className="flex items-start space-x-6">
              <div className="bg-rose-100 p-3 rounded-full">
                <Mail className="text-rose-600 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Us</h3>
                <p className="text-gray-700">support@naariseva.org</p>
                <p className="text-gray-700">emergency@naariseva.org</p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="bg-purple-100 p-3 rounded-full">
                <Phone className="text-purple-600 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Call Us</h3>
                <p className="text-gray-700">24/7 Helpline: +91 1800 123 4567</p>
                <p className="text-gray-700">Office: +91 80 1234 5678</p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="bg-teal-100 p-3 rounded-full">
                <MapPin className="text-teal-600 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Office</h3>
                <p className="text-gray-700">NaariSeva Foundation</p>
                <p className="text-gray-700">#24, Safety Tower, MG Road</p>
                <p className="text-gray-700">Bangalore, Karnataka 560001</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Need Immediate Help?</h2>
          <p className="text-xl mb-6">Our emergency response team is available 24/7</p>
          <button className="bg-white text-rose-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-rose-100 transition">
            Call Emergency Helpline
          </button>
        </div>
      </div>
    </div>
  );
}