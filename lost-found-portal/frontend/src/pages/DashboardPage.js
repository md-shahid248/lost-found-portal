import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

const CATEGORY_ICONS = { electronics:'💻', wallet:'👛', keys:'🔑', documents:'📄', bags:'🎒', clothing:'👕', jewelry:'💍', books:'📚', sports:'⚽', other:'📦' };

function StatCard({ label, value, icon, color }) {
  return (
    <div className={`card p-5 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', resolved: '' });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filter.status) params.status = filter.status;
      if (filter.resolved !== '') params.resolved = filter.resolved;
      const res = await itemsAPI.getMyItems(params);
      setItems(res.data.data);
      setPagination(res.data.pagination);
    } catch { setItems([]); }
    setLoading(false);
  }, [page, filter]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleResolve = async (id, currentStatus) => {
    try {
      const res = await itemsAPI.resolve(id);
      toast.success(res.data.message);
      fetchItems();
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await itemsAPI.delete(id);
      toast.success('Item deleted');
      fetchItems();
    } catch { toast.error('Delete failed'); }
  };

  const stats = {
    total: pagination.count ?? items.length,
    lost: items.filter(i => i.status === 'lost').length,
    found: items.filter(i => i.status === 'found').length,
    resolved: items.filter(i => i.resolved).length,
  };

  return (
    <div className="min-h-screen pt-16 pb-16 bg-surface-50 dark:bg-surface-950">
      <div className="page-container">
        {/* Welcome header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your posted items</p>
          </div>
          <div className="flex gap-2">
            <Link to="/post/lost" className="btn btn-sm bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100">
              + Lost Item
            </Link>
            <Link to="/post/found" className="btn-primary btn-sm rounded-xl">
              + Found Item
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Posts" value={pagination.count ?? '–'} icon="📋" color="border-primary-500" />
          <StatCard label="Lost Items" value={stats.lost} icon="🔍" color="border-red-400" />
          <StatCard label="Found Items" value={stats.found} icon="✅" color="border-emerald-400" />
          <StatCard label="Resolved" value={stats.resolved} icon="🎉" color="border-blue-400" />
        </div>

        {/* Filter tabs */}
        <div className="card mb-5 p-3 flex flex-wrap gap-2 items-center">
          {[
            { label: 'All', val: '' },
            { label: '🔍 Lost', val: 'lost' },
            { label: '✅ Found', val: 'found' },
          ].map(f => (
            <button
              key={f.val}
              onClick={() => { setFilter(prev => ({ ...prev, status: f.val })); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter.status === f.val ? 'bg-primary-100 text-primary-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
          <button
            onClick={() => { setFilter(prev => ({ ...prev, resolved: prev.resolved === 'false' ? '' : 'false' })); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter.resolved === 'false' ? 'bg-primary-100 text-primary-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Active only
          </button>
        </div>

        {/* Items list */}
        {loading ? (
          <LoadingSpinner text="Loading your items..." />
        ) : items.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No items posted yet"
            description="Start by reporting a lost or found item."
            actionLabel="Post Your First Item"
            actionTo="/post/lost"
          />
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item._id} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0">
                  {item.image?.url ? (
                    <img src={item.image.url} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      {CATEGORY_ICONS[item.category] || '📦'}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Link to={`/items/${item._id}`} className="font-semibold text-slate-900 dark:text-white hover:text-primary-600 transition-colors truncate">
                      {item.title}
                    </Link>
                    <span className={`badge text-xs ${item.status === 'lost' ? 'badge-lost' : 'badge-found'}`}>
                      {item.status}
                    </span>
                    {item.resolved && <span className="badge badge-resolved text-xs">resolved</span>}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    📍 {item.location} &bull; {format(new Date(item.createdAt), 'dd MMM yyyy')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link to={`/items/${item._id}/edit`} className="btn-secondary btn-sm rounded-lg text-xs px-3 py-1.5">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleResolve(item._id, item.resolved)}
                    className={`btn btn-sm rounded-lg text-xs px-3 py-1.5 ${
                      item.resolved
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                    }`}
                  >
                    {item.resolved ? 'Unresolve' : '✓ Resolve'}
                  </button>
                  <button
                    onClick={() => handleDelete(item._id, item.title)}
                    className="btn btn-sm rounded-lg text-xs px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {/* Simple pagination */}
            {pagination.total > 1 && (
              <div className="flex justify-center gap-2 pt-4">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary btn-sm rounded-lg px-3">← Prev</button>
                <span className="px-3 py-1.5 text-sm text-slate-500">Page {page} of {pagination.total}</span>
                <button disabled={page === pagination.total} onClick={() => setPage(p => p + 1)} className="btn-secondary btn-sm rounded-lg px-3">Next →</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
