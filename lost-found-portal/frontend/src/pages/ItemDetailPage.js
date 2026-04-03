import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { itemsAPI, messagesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = { electronics:'💻', wallet:'👛', keys:'🔑', documents:'📄', bags:'🎒', clothing:'👕', jewelry:'💍', books:'📚', sports:'⚽', other:'📦' };

export default function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msgText, setMsgText] = useState('');
  const [sending, setSending] = useState(false);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    itemsAPI.getOne(id)
      .then(r => setItem(r.data.data))
      .catch(() => navigate('/items'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await itemsAPI.delete(id);
      toast.success('Item deleted');
      navigate('/dashboard');
    } catch { toast.error('Delete failed'); }
  };

  const handleResolve = async () => {
    try {
      const res = await itemsAPI.resolve(id);
      setItem(prev => ({ ...prev, resolved: res.data.data.resolved }));
      toast.success(res.data.message);
    } catch { toast.error('Failed'); }
  };

  const handleReport = async () => {
    try {
      await itemsAPI.report(id);
      toast.success('Item reported to admin');
    } catch { toast.error('Failed'); }
  };

  const handleSendMsg = async (e) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    setSending(true);
    try {
      await messagesAPI.send({ itemId: id, content: msgText.trim() });
      toast.success('Message sent!');
      setMsgText('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    }
    setSending(false);
  };

  const isOwner = user?._id === item?.userId?._id;
  const isAdmin = user?.role === 'admin';

  if (loading) return <div className="min-h-screen pt-24 flex justify-center"><LoadingSpinner /></div>;
  if (!item) return null;

  return (
    <div className="min-h-screen pt-16 pb-16 bg-surface-50 dark:bg-surface-950">
      <div className="page-container max-w-5xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <span>/</span>
          <Link to="/items" className="hover:text-primary-600">Browse</Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{item.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Image + quick info */}
          <div className="lg:col-span-2 space-y-4">
            {/* Image */}
            <div className="card overflow-hidden">
              {item.image?.url ? (
                <img src={item.image.url} alt={item.title} className="w-full h-72 lg:h-80 object-cover" />
              ) : (
                <div className="w-full h-72 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                  <span className="text-7xl">{CATEGORY_ICONS[item.category] || '📦'}</span>
                </div>
              )}
            </div>

            {/* Posted by */}
            <div className="card p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Posted By</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
                  {item.userId?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{item.userId?.name}</p>
                  <p className="text-xs text-slate-500">
                    Member since {item.userId?.createdAt ? format(new Date(item.userId.createdAt), 'MMM yyyy') : '–'}
                  </p>
                </div>
              </div>

              {/* Contact info (only revealed on click) */}
              {isAuthenticated && !isOwner && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowContact(v => !v)}
                    className="btn-secondary btn-sm w-full rounded-xl"
                  >
                    {showContact ? 'Hide Contact' : '📞 Show Contact Details'}
                  </button>
                  {showContact && (
                    <div className="mt-3 space-y-1.5 text-sm animate-fade-in">
                      {item.contactEmail && (
                        <a href={`mailto:${item.contactEmail}`} className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
                          <span>📧</span> {item.contactEmail}
                        </a>
                      )}
                      {item.contactPhone && (
                        <a href={`tel:${item.contactPhone}`} className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
                          <span>📱</span> {item.contactPhone}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Details */}
          <div className="lg:col-span-3 space-y-5">
            {/* Title & badges */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`badge font-bold ${item.status === 'lost' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                  {item.status === 'lost' ? '🔍 Lost' : '✅ Found'}
                </span>
                {item.resolved && <span className="badge bg-blue-500 text-white font-bold">✓ Resolved</span>}
                <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {CATEGORY_ICONS[item.category]} {item.category}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">{item.title}</h1>
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '📍', label: 'Location', value: item.location },
                { icon: '📅', label: 'Date', value: format(new Date(item.date), 'dd MMM yyyy') },
                { icon: '🏷️', label: 'Category', value: item.category },
                { icon: '🕐', label: 'Posted', value: format(new Date(item.createdAt), 'dd MMM yyyy') },
              ].map(({ icon, label, value }) => (
                <div key={label} className="card p-3">
                  <p className="text-xs text-slate-400 uppercase tracking-wide">{icon} {label}</p>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm mt-0.5 capitalize">{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="card p-5">
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wide mb-3">Description</h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{item.description}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {isOwner && (
                <>
                  <Link to={`/items/${id}/edit`} className="btn-secondary btn-sm rounded-xl">✏️ Edit</Link>
                  <button onClick={handleResolve} className={`btn btn-sm rounded-xl ${item.resolved ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'}`}>
                    {item.resolved ? '↩️ Mark Unresolved' : '✓ Mark Resolved'}
                  </button>
                  <button onClick={handleDelete} className="btn-danger btn-sm rounded-xl">🗑️ Delete</button>
                </>
              )}
              {isAdmin && !isOwner && (
                <button onClick={handleDelete} className="btn-danger btn-sm rounded-xl">🗑️ Delete (Admin)</button>
              )}
              {isAuthenticated && !isOwner && (
                <button onClick={handleReport} className="btn-ghost btn-sm rounded-xl text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                  🚩 Report
                </button>
              )}
            </div>

            {/* Messaging */}
            {isAuthenticated && !isOwner && !item.resolved && (
              <div className="card p-5">
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">💬 Send a Message</h3>
                <form onSubmit={handleSendMsg} className="flex gap-2">
                  <input
                    type="text"
                    value={msgText}
                    onChange={e => setMsgText(e.target.value)}
                    placeholder="I think I found your item..."
                    className="input flex-1 text-sm"
                    maxLength={500}
                  />
                  <button type="submit" disabled={sending || !msgText.trim()} className="btn-primary btn-sm rounded-xl px-4">
                    {sending ? '...' : 'Send'}
                  </button>
                </form>
                <p className="text-xs text-slate-400 mt-2">Your message will be sent to {item.userId?.name}</p>
              </div>
            )}

            {!isAuthenticated && (
              <div className="card p-5 bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800">
                <p className="text-primary-700 dark:text-primary-300 text-sm font-medium">
                  <Link to="/login" className="underline font-bold">Sign in</Link> to contact the poster or send a message.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
