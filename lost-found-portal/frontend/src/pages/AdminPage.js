import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

function StatBox({ label, value, icon, color }) {
  return (
    <div className={`card p-4 border-t-4 ${color}`}>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value ?? '–'}</p>
      <p className="text-xs text-slate-500 mt-0.5">{icon} {label}</p>
    </div>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [itemFilter, setItemFilter] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'overview') {
        const r = await adminAPI.getStats();
        setStats(r.data.stats);
      } else if (tab === 'users') {
        const params = {};
        if (userSearch) params.search = userSearch;
        const r = await adminAPI.getUsers(params);
        setUsers(r.data.data);
      } else if (tab === 'items') {
        const params = {};
        if (itemFilter === 'reported') params.reported = 'true';
        else if (itemFilter) params.status = itemFilter;
        const r = await adminAPI.getAllItems(params);
        setItems(r.data.data);
      }
    } catch { toast.error('Failed to load data'); }
    setLoading(false);
  }, [tab, userSearch, itemFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleToggleUser = async (id) => {
    try {
      const r = await adminAPI.toggleUser(id);
      toast.success(r.data.message);
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleToggleItem = async (id) => {
    try {
      const r = await adminAPI.toggleItemVisibility(id);
      toast.success(r.data.message);
      loadData();
    } catch { toast.error('Failed'); }
  };

  const handleDeleteItem = async (id, title) => {
    if (!window.confirm(`Permanently delete "${title}"?`)) return;
    try {
      await adminAPI.deleteItem(id);
      toast.success('Item deleted');
      loadData();
    } catch { toast.error('Failed'); }
  };

  const TABS = ['overview', 'users', 'items'];

  return (
    <div className="min-h-screen pt-16 pb-16 bg-surface-50 dark:bg-surface-950">
      <div className="page-container">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-700 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Panel</h1>
            <p className="text-slate-500 text-sm">Manage users, posts, and platform health</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 dark:bg-surface-800 p-1 rounded-xl w-fit mb-6">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                tab === t ? 'bg-white dark:bg-surface-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t === 'overview' ? '📊 Overview' : t === 'users' ? '👥 Users' : '📋 Items'}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          loading ? <LoadingSpinner /> : stats ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <StatBox label="Total Users" value={stats.totalUsers} icon="👥" color="border-primary-500" />
                <StatBox label="Total Posts" value={stats.totalItems} icon="📋" color="border-slate-400" />
                <StatBox label="Active Lost" value={stats.lostItems} icon="🔍" color="border-red-400" />
                <StatBox label="Active Found" value={stats.foundItems} icon="✅" color="border-emerald-400" />
                <StatBox label="Resolved" value={stats.resolvedItems} icon="🎉" color="border-blue-400" />
                <StatBox label="Reported" value={stats.reportedItems} icon="🚩" color="border-orange-400" />
              </div>
            </>
          ) : null
        )}

        {/* ── USERS ── */}
        {tab === 'users' && (
          <div>
            <div className="flex gap-2 mb-5">
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadData()}
                placeholder="Search by name or email..."
                className="input max-w-sm"
              />
              <button onClick={loadData} className="btn-primary btn-sm rounded-xl px-4">Search</button>
            </div>

            {loading ? <LoadingSpinner /> : (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-surface-800 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      <tr>
                        {['User', 'Email', 'Phone', 'Role', 'Status', 'Joined', 'Action'].map(h => (
                          <th key={h} className="px-4 py-3 text-left">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {users.map(u => (
                        <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-surface-800">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                                {u.name?.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-slate-800 dark:text-white">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{u.email}</td>
                          <td className="px-4 py-3 text-slate-500">{u.phone || '–'}</td>
                          <td className="px-4 py-3">
                            <span className={`badge ${u.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`badge ${u.isActive ? 'badge-found' : 'bg-red-100 text-red-600'}`}>
                              {u.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500">{format(new Date(u.createdAt), 'dd MMM yy')}</td>
                          <td className="px-4 py-3">
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => handleToggleUser(u._id)}
                                className={`btn btn-sm rounded-lg text-xs px-3 py-1 ${
                                  u.isActive
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                                }`}
                              >
                                {u.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && (
                    <p className="text-center py-10 text-slate-400">No users found</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ITEMS ── */}
        {tab === 'items' && (
          <div>
            <div className="flex flex-wrap gap-2 mb-5">
              {[
                { val: '', label: 'All Items' },
                { val: 'lost', label: '🔍 Lost' },
                { val: 'found', label: '✅ Found' },
                { val: 'reported', label: '🚩 Reported' },
              ].map(f => (
                <button
                  key={f.val}
                  onClick={() => setItemFilter(f.val)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    itemFilter === f.val ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-surface-800 text-slate-600 border-slate-200 hover:border-primary-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {loading ? <LoadingSpinner /> : (
              <div className="space-y-3">
                {items.length === 0 && (
                  <div className="text-center py-12 text-slate-400">No items found</div>
                )}
                {items.map(item => (
                  <div key={item._id} className={`card p-4 flex flex-col sm:flex-row sm:items-center gap-4 ${!item.isVisible ? 'opacity-60' : ''}`}>
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.image?.url ? (
                        <img src={item.image.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl">📦</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <Link to={`/items/${item._id}`} className="font-semibold text-slate-900 dark:text-white hover:text-primary-600 text-sm truncate">
                          {item.title}
                        </Link>
                        <span className={`badge text-xs ${item.status === 'lost' ? 'badge-lost' : 'badge-found'}`}>
                          {item.status}
                        </span>
                        {!item.isVisible && <span className="badge bg-red-100 text-red-600 text-xs">Hidden</span>}
                        {item.reportCount > 0 && (
                          <span className="badge bg-orange-100 text-orange-700 text-xs">🚩 {item.reportCount} reports</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        by {item.userId?.name} · {item.location} · {format(new Date(item.createdAt), 'dd MMM yyyy')}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleToggleItem(item._id)}
                        className={`btn btn-sm rounded-lg text-xs px-3 py-1.5 border ${
                          item.isVisible
                            ? 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200'
                        }`}
                      >
                        {item.isVisible ? 'Hide' : 'Restore'}
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item._id, item.title)}
                        className="btn btn-sm rounded-lg text-xs px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
