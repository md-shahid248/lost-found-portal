import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import ItemCard from '../components/items/ItemCard';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

const CATEGORIES = ['electronics','wallet','keys','documents','bags','clothing','jewelry','books','sports','other'];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [inputVal, setInputVal] = useState(searchParams.get('q') || '');

  const q = searchParams.get('q') || '';
  const status = searchParams.get('status') || '';
  const category = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const doSearch = useCallback(async () => {
    if (!q.trim() || q.trim().length < 2) { setItems([]); return; }
    setLoading(true);
    try {
      const params = { q, page, limit: 12 };
      if (status) params.status = status;
      if (category) params.category = category;
      const res = await itemsAPI.search(params);
      setItems(res.data.data);
      setPagination(res.data.pagination);
    } catch { setItems([]); }
    setLoading(false);
  }, [q, status, category, page]);

  useEffect(() => { doSearch(); }, [doSearch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    setSearchParams({ q: inputVal.trim(), page: '1' });
  };

  const setFilter = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    p.set('page', '1');
    setSearchParams(p);
  };

  const filterBtn = (active) =>
    `px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
      active ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-surface-800 text-slate-600 dark:text-slate-300 border-slate-200 hover:border-primary-300'
    }`;

  return (
    <div className="min-h-screen pt-16 pb-16 bg-surface-50 dark:bg-surface-950">
      <div className="page-container">
        <h1 className="section-title mb-6">Search Items</h1>

        {/* Search input */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder="Search by name, description, or location..."
              className="input pl-10 py-3"
            />
          </div>
          <button type="submit" className="btn-primary btn-lg rounded-xl px-6">Search</button>
        </form>

        {/* Filters */}
        {q && (
          <div className="flex flex-wrap gap-2 mb-6 items-center">
            <span className="text-xs font-semibold text-slate-500 uppercase">Status:</span>
            {['', 'lost', 'found'].map(s => (
              <button key={s} onClick={() => setFilter('status', s)} className={filterBtn(status === s)}>
                {s === '' ? 'All' : s === 'lost' ? '🔍 Lost' : '✅ Found'}
              </button>
            ))}
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-xs font-semibold text-slate-500 uppercase">Category:</span>
            <select value={category} onChange={e => setFilter('category', e.target.value)} className="input py-1 text-xs w-auto">
              <option value="">All</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

        {/* Results */}
        {!q ? (
          <EmptyState icon="🔍" title="Search for items" description="Enter a keyword to find lost or found items." />
        ) : loading ? (
          <LoadingSpinner text={`Searching for "${q}"...`} />
        ) : items.length > 0 ? (
          <>
            <p className="text-sm text-slate-500 mb-4">
              Found <span className="font-semibold text-slate-800 dark:text-white">{pagination.count}</span> result{pagination.count !== 1 ? 's' : ''} for "<span className="italic">{q}</span>"
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {items.map(item => <ItemCard key={item._id} item={item} />)}
            </div>
            <Pagination current={page} total={pagination.total || 1} onPageChange={p => setFilter('page', String(p))} />
          </>
        ) : (
          <EmptyState icon="😔" title={`No results for "${q}"`} description="Try a different keyword or remove filters." />
        )}
      </div>
    </div>
  );
}
