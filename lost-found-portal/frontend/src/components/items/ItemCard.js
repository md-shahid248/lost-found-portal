import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const CATEGORY_ICONS = {
  electronics: '💻', wallet: '👛', keys: '🔑', documents: '📄',
  bags: '🎒', clothing: '👕', jewelry: '💍', books: '📚',
  sports: '⚽', other: '📦',
};

const PLACEHOLDER_COLORS = [
  'from-blue-100 to-blue-200', 'from-purple-100 to-purple-200',
  'from-emerald-100 to-emerald-200', 'from-orange-100 to-orange-200',
  'from-pink-100 to-pink-200',
];

export default function ItemCard({ item }) {
  const colorIdx = item._id?.charCodeAt(0) % PLACEHOLDER_COLORS.length || 0;

  return (
    <Link to={`/items/${item._id}`} className="block group">
      <div className="card-hover overflow-hidden flex flex-col h-full">
        {/* Image */}
        <div className={`relative h-48 overflow-hidden bg-gradient-to-br ${PLACEHOLDER_COLORS[colorIdx]}`}>
          {item.image?.url ? (
            <img
              src={item.image.url}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl opacity-60">{CATEGORY_ICONS[item.category] || '📦'}</span>
            </div>
          )}

          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <span className={`badge text-xs font-bold shadow-sm ${
              item.status === 'lost' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
            }`}>
              {item.status === 'lost' ? '🔍 Lost' : '✅ Found'}
            </span>
          </div>

          {/* Resolved badge */}
          {item.resolved && (
            <div className="absolute top-3 right-3">
              <span className="badge bg-blue-500 text-white text-xs font-bold shadow-sm">
                ✓ Resolved
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-1 group-hover:text-primary-600 transition-colors">
              {item.title}
            </h3>
            <span className="text-lg flex-shrink-0" title={item.category}>
              {CATEGORY_ICONS[item.category] || '📦'}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 flex-1">
            {item.description}
          </p>

          <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate max-w-[100px]">{item.location}</span>
            </span>
            <span>
              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
            </span>
          </div>

          {/* Posted by */}
          {item.userId && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-[9px] font-bold">
                {item.userId.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {item.userId.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
