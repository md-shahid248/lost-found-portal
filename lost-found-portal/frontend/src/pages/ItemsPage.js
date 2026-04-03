import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import ItemCard from '../components/items/ItemCard';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

const CATEGORIES = ['electronics','wallet','keys','documents','bags','clothing','jewelry','books','sports','other'];

export default function ItemsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);

  const status = searchParams.get('status') || '';
  const category = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (status) params.status = status;
      if (category) params.category = category;
      const res = await itemsAPI.getAll(params);
      setItems(res.data.data);
      setPagination(res.data.pagination);
    } catch { setItems([]); }
    setLoading(false);
  }, [status, category, page]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const setFilter = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    p.set('page', '1');
    setSearchParams(p);
  };

  const filterBtnClass = (active) =>
    `px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
      active ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-surface-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-primary-300'
    }`;

  return (
    <div className="min-h-screen pt-16 bg-surface-50 dark:bg-surface-950">
      <div className="page-container">
        {/* Header */}
        <div className="mb-6">
          <h1 className="section-title">Browse All Items</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {pagination.count !== undefined && `${pagination.count} item${pagination.count !== 1 ? 's' : ''} listed`}
          </p>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6 flex flex-wrap gap-3 items-center">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Status:</span>
          {['', 'lost', 'found'].map(s => (
            <button key={s} onClick={() => setFilter('status', s)} className={filterBtnClass(status === s)}>
              {s === '' ? 'All' : s === 'lost' ? '🔍 Lost' : '✅ Found'}
            </button>
          ))}

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Category:</span>
          <select
            value={category}
            onChange={e => setFilter('category', e.target.value)}
            className="input py-1.5 w-auto text-sm"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>

          {(status || category) && (
            <button
              onClick={() => { setSearchParams({ page: '1' }); }}
              className="text-sm text-red-500 hover:text-red-700 font-medium"
            >
              ✕ Clear filters
            </button>
          )}
        </div>

        {/* Items */}
        {loading ? (
          <LoadingSpinner text="Fetching items..." />
        ) : items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {items.map(item => <ItemCard key={item._id} item={item} />)}
            </div>
            <Pagination
              current={page}
              total={pagination.total || 1}
              onPageChange={p => setFilter('page', String(p))}
            />
          </>
        ) : (
          <EmptyState
            icon="🔍"
            title="No items found"
            description="Try adjusting your filters or check back later."
          />
        )}
      </div>
    </div>
  );
}
