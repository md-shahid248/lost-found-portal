import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ItemForm from '../components/items/ItemForm';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function EditItemPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    itemsAPI.getOne(id)
      .then(r => {
        const it = r.data.data;
        // Only owner or admin can edit
        if (it.userId?._id !== user?._id && user?.role !== 'admin') {
          navigate('/dashboard');
          return;
        }
        setItem(it);
      })
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [id, navigate, user]);

  if (loading) return <div className="min-h-screen pt-24 flex justify-center"><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen pt-16 pb-16 bg-surface-50 dark:bg-surface-950">
      <div className="page-container max-w-2xl">
        <div className="mb-8">
          <h1 className="section-title">✏️ Edit Item</h1>
          <p className="text-slate-500 text-sm mt-2">Update the details of your posted item.</p>
        </div>
        <div className="card p-6 sm:p-8">
          <ItemForm existingItem={item} />
        </div>
      </div>
    </div>
  );
}
