import React from 'react';
import { Link } from 'react-router-dom';

export default function EmptyState({ icon = '📭', title, description, actionLabel, actionTo }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">{title}</h3>
      {description && <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">{description}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn-primary btn-md rounded-xl">{actionLabel}</Link>
      )}
    </div>
  );
}
