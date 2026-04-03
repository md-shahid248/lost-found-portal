import React from 'react';

export default function Pagination({ current, total, onPageChange }) {
  if (total <= 1) return null;

  const pages = [];
  const delta = 2;
  const left = Math.max(1, current - delta);
  const right = Math.min(total, current + delta);

  for (let i = left; i <= right; i++) pages.push(i);

  const btnBase = 'w-9 h-9 rounded-lg text-sm font-medium flex items-center justify-center transition-colors';

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      {/* Prev */}
      <button
        onClick={() => onPageChange(current - 1)}
        disabled={current === 1}
        className={`${btnBase} ${current === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {left > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className={`${btnBase} text-slate-600 hover:bg-slate-100`}>1</button>
          {left > 2 && <span className="px-1 text-slate-400">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`${btnBase} ${p === current ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          {p}
        </button>
      ))}

      {right < total && (
        <>
          {right < total - 1 && <span className="px-1 text-slate-400">…</span>}
          <button onClick={() => onPageChange(total)} className={`${btnBase} text-slate-600 hover:bg-slate-100`}>{total}</button>
        </>
      )}

      <button
        onClick={() => onPageChange(current + 1)}
        disabled={current === total}
        className={`${btnBase} ${current === total ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
