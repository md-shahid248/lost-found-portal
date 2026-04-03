import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import ItemCard from '../components/items/ItemCard';
import SearchBar from '../components/common/SearchBar';
import LoadingSpinner from '../components/common/LoadingSpinner';

const STATS = [
  { label: 'Items Reunited', value: '500+', icon: '🎉' },
  { label: 'Active Users', value: '1,200+', icon: '👥' },
  { label: 'Campus Buildings', value: '15+', icon: '🏛️' },
  { label: 'Items Resolved', value: '95%', icon: '✅' },
];

const FEATURES = [
  { icon: '📸', title: 'Post with Photo', desc: 'Upload images to help identify lost/found items faster.' },
  { icon: '🔔', title: 'Instant Alerts', desc: 'Get notified when someone finds a match for your item.' },
  { icon: '💬', title: 'Direct Messaging', desc: 'Contact the poster directly through our secure inbox.' },
  { icon: '🗂️', title: 'Smart Categories', desc: 'Filter by type, location, and status for quick results.' },
];

export default function HomePage() {
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    itemsAPI.getAll({ limit: 6, sort: '-createdAt' })
      .then(r => setRecentItems(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900">
        <div className="absolute inset-0 bg-grid opacity-30" />
        {/* Glowing orbs */}
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-700/15 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/30 text-primary-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 animate-fade-in">
            <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse-soft" />
            Campus Lost & Found Portal
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight animate-fade-up">
            Lost something on
            <span className="block text-gradient mt-1">campus?</span>
            <span className="text-white/90 text-3xl sm:text-4xl font-normal mt-2 block">We'll help you find it.</span>
          </h1>

          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto animate-fade-up" style={{ animationDelay: '0.1s' }}>
            A community-driven platform for reporting and recovering lost items across your college campus.
          </p>

          <div className="flex justify-center mb-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <SearchBar />
          </div>

          <div className="flex flex-wrap justify-center gap-3 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/post/lost" className="btn btn-lg bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-lg hover:shadow-red-500/30">
              🔍 Report Lost Item
            </Link>
            <Link to="/post/found" className="btn btn-lg bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg hover:shadow-emerald-500/30">
              ✅ Report Found Item
            </Link>
            <Link to="/items" className="btn btn-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl backdrop-blur-sm">
              Browse All Items
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white dark:bg-surface-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</div>
              <div className="text-sm text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent items */}
      <section className="py-16 bg-surface-50 dark:bg-surface-950">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Recent Reports</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Latest lost & found items from campus</p>
            </div>
            <Link to="/items" className="btn-secondary btn-sm rounded-xl">View All →</Link>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading recent items..." />
          ) : recentItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentItems.map((item) => <ItemCard key={item._id} item={item} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400">
              <p className="text-4xl mb-3">📭</p>
              <p>No items posted yet. Be the first!</p>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white dark:bg-surface-900">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="section-title">How It Works</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Simple, fast, and effective item recovery</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-6 text-center hover:shadow-card-hover transition-shadow">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-primary-100 mb-8">Join your campus community and help reunite people with their belongings.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn btn-lg bg-white text-primary-700 hover:bg-primary-50 rounded-xl font-bold shadow-lg">
              Create Free Account
            </Link>
            <Link to="/items" className="btn btn-lg bg-primary-500/50 text-white hover:bg-primary-500/70 border border-white/30 rounded-xl">
              Browse Items
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 text-center text-sm">
        <p className="font-semibold text-white mb-1">FindItCampus</p>
        <p>© {new Date().getFullYear()} Campus Lost & Found Portal. Built for students, by students.</p>
      </footer>
    </div>
  );
}
