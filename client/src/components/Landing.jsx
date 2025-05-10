import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/react.svg';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-green-100 flex flex-col">
      <header className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
          <img src={logo} alt="XenoReach Logo" className="h-8 w-8" />
          <span className="text-2xl font-bold text-gray-800">XenoReach CRM</span>
        </div>
        <div>
          <Link to="/login" className="text-blue-600 font-semibold hover:underline mr-4">Sign In</Link>
          <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">Get Started</Link>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">Grow Your Business with <span className="text-blue-600">XenoReach CRM</span></h1>
        <p className="text-lg md:text-2xl text-gray-700 mb-8 max-w-2xl">A modern, multi-tenant CRM platform to manage your customers, campaigns, and analytics—all in one place. Secure, scalable, and easy to use for every business.</p>
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <Link to="/register" className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition">Start Free</Link>
          <Link to="/login" className="bg-white border border-blue-600 text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50 transition">Sign In</Link>
        </div>
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full">
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
            <span className="text-3xl mb-2">🔒</span>
            <h2 className="text-xl font-bold mb-2">Secure & Private</h2>
            <p className="text-gray-600">Your business data is always safe, private, and never shared with others. Multi-tenant architecture ensures complete isolation.</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
            <span className="text-3xl mb-2">🚀</span>
            <h2 className="text-xl font-bold mb-2">Easy Campaigns</h2>
            <p className="text-gray-600">Create, launch, and track campaigns with just a few clicks. Powerful segmentation and analytics built in.</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
            <span className="text-3xl mb-2">📈</span>
            <h2 className="text-xl font-bold mb-2">Actionable Insights</h2>
            <p className="text-gray-600">Visualize your growth and campaign performance with beautiful, real-time analytics dashboards.</p>
          </div>
        </section>
      </main>
      <footer className="text-center text-gray-400 py-6 text-sm">© {new Date().getFullYear()} XenoReach CRM. All rights reserved.</footer>
    </div>
  );
} 