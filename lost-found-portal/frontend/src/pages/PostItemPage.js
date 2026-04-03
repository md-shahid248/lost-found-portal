import React from 'react';
import { useParams } from 'react-router-dom';
import ItemForm from '../components/items/ItemForm';

export default function PostItemPage() {
  const { type } = useParams(); // 'lost' or 'found'
  const isLost = type === 'lost';

  return (
    <div className="min-h-screen pt-16 pb-16 bg-surface-50 dark:bg-surface-950">
      <div className="page-container max-w-2xl">
        <div className="mb-8">
          <h1 className="section-title">
            {isLost ? '🔍 Report a Lost Item' : '✅ Report a Found Item'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
            {isLost
              ? 'Describe your lost item clearly so others can help identify and return it.'
              : 'Describe the item you found so the owner can identify and claim it.'}
          </p>
        </div>

        <div className="card p-6 sm:p-8">
          <ItemForm type={type} />
        </div>
      </div>
    </div>
  );
}
