import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { messagesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

export default function MessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('received');

  useEffect(() => {
    messagesAPI.getAll()
      .then(r => setMessages(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const received = messages.filter(m => m.receiverId?._id === user?._id);
  const sent = messages.filter(m => m.senderId?._id === user?._id);
  const display = tab === 'received' ? received : sent;

  return (
    <div className="min-h-screen pt-16 pb-16 bg-surface-50 dark:bg-surface-950">
      <div className="page-container max-w-3xl">
        <h1 className="section-title mb-6">💬 Messages</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 dark:bg-surface-800 p-1 rounded-xl mb-6 w-fit">
          {[
            { key: 'received', label: `Received (${received.length})` },
            { key: 'sent', label: `Sent (${sent.length})` },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.key
                  ? 'bg-white dark:bg-surface-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner text="Loading messages..." />
        ) : display.length === 0 ? (
          <EmptyState icon="💬" title="No messages yet" description="Messages about your items will appear here." />
        ) : (
          <div className="space-y-3">
            {display.map(msg => {
              const other = tab === 'received' ? msg.senderId : msg.receiverId;
              return (
                <div key={msg._id} className={`card p-4 flex gap-4 ${!msg.isRead && tab === 'received' ? 'border-primary-200 bg-primary-50/50 dark:bg-primary-950/30' : ''}`}>
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {other?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white text-sm">{other?.name}</span>
                        {!msg.isRead && tab === 'received' && (
                          <span className="ml-2 inline-block w-2 h-2 bg-primary-500 rounded-full" />
                        )}
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        {format(new Date(msg.createdAt), 'dd MMM, HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{msg.content}</p>
                    {msg.itemId && (
                      <Link
                        to={`/items/${msg.itemId._id}`}
                        className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium bg-primary-50 dark:bg-primary-950 px-2.5 py-1 rounded-full"
                      >
                        <span>{msg.itemId.status === 'lost' ? '🔍' : '✅'}</span>
                        {msg.itemId.title}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
