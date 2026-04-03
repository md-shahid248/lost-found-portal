import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { itemsAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { value: 'electronics', label: 'Electronics', icon: '💻' },
  { value: 'wallet', label: 'Wallet / Purse', icon: '👛' },
  { value: 'keys', label: 'Keys', icon: '🔑' },
  { value: 'documents', label: 'Documents / ID', icon: '📄' },
  { value: 'bags', label: 'Bags / Backpack', icon: '🎒' },
  { value: 'clothing', label: 'Clothing', icon: '👕' },
  { value: 'jewelry', label: 'Jewelry', icon: '💍' },
  { value: 'books', label: 'Books / Notes', icon: '📚' },
  { value: 'sports', label: 'Sports Items', icon: '⚽' },
  { value: 'other', label: 'Other', icon: '📦' },
];

export default function ItemForm({ type, existingItem }) {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(existingItem?.image?.url || null);
  const [form, setForm] = useState({
    title: existingItem?.title || '',
    description: existingItem?.description || '',
    category: existingItem?.category || '',
    location: existingItem?.location || '',
    date: existingItem?.date ? existingItem.date.split('T')[0] : new Date().toISOString().split('T')[0],
    contactEmail: existingItem?.contactEmail || '',
    contactPhone: existingItem?.contactPhone || '',
  });
  const [file, setFile] = useState(null);

  const isEdit = !!existingItem;
  const status = type || existingItem?.status;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category || !form.location || !form.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (!isEdit) fd.append('status', status);
      if (file) fd.append('image', file);

      if (isEdit) {
        await itemsAPI.update(existingItem._id, fd);
        toast.success('Item updated successfully!');
      } else {
        await itemsAPI.create(fd);
        toast.success(`${status === 'lost' ? 'Lost item' : 'Found item'} posted!`);
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Status indicator */}
      <div className={`rounded-xl p-4 flex items-center gap-3 ${
        status === 'lost' ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200'
      }`}>
        <span className="text-2xl">{status === 'lost' ? '🔍' : '✅'}</span>
        <div>
          <p className={`font-semibold ${status === 'lost' ? 'text-red-700' : 'text-emerald-700'}`}>
            Reporting a {status === 'lost' ? 'Lost' : 'Found'} Item
          </p>
          <p className="text-sm text-slate-500">Fill in as many details as possible to help others</p>
        </div>
      </div>

      {/* Image upload */}
      <div>
        <label className="label">Item Photo</label>
        <div
          onClick={() => fileRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-colors ${
            preview ? 'border-primary-300 bg-primary-50' : 'border-slate-200 hover:border-primary-300 bg-slate-50'
          }`}
          style={{ minHeight: '180px' }}
        >
          {preview ? (
            <div className="relative">
              <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white font-medium text-sm">Click to change photo</span>
              </div>
            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center gap-2 text-slate-400">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-medium">Click to upload photo</p>
              <p className="text-xs">PNG, JPG, WEBP up to 5MB</p>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>

      {/* Title */}
      <div>
        <label className="label">Item Name <span className="text-red-500">*</span></label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Blue Nike Backpack, Samsung Galaxy S23..."
          className="input"
          required
          maxLength={100}
        />
      </div>

      {/* Category */}
      <div>
        <label className="label">Category <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setForm(prev => ({ ...prev, category: cat.value }))}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-center transition-all ${
                form.category === cat.value
                  ? 'border-primary-500 bg-primary-50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <span className="text-xl">{cat.icon}</span>
              <span className="text-xs font-medium text-slate-700 leading-tight">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="label">Description <span className="text-red-500">*</span></label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe the item in detail: color, brand, distinctive marks, condition..."
          className="input resize-none"
          rows={4}
          required
          maxLength={1000}
        />
        <p className="text-xs text-slate-400 mt-1 text-right">{form.description.length}/1000</p>
      </div>

      {/* Location & Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Location {status === 'lost' ? 'Lost' : 'Found'} <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="e.g. Library 2nd Floor, Canteen, Parking Lot A"
            className="input"
            required
          />
        </div>
        <div>
          <label className="label">Date {status === 'lost' ? 'Lost' : 'Found'} <span className="text-red-500">*</span></label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            className="input"
            required
          />
        </div>
      </div>

      {/* Contact details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Contact Email</label>
          <input
            type="email"
            name="contactEmail"
            value={form.contactEmail}
            onChange={handleChange}
            placeholder="your@email.com"
            className="input"
          />
        </div>
        <div>
          <label className="label">Contact Phone</label>
          <input
            type="tel"
            name="contactPhone"
            value={form.contactPhone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
            className="input"
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className={`btn btn-lg w-full rounded-xl ${
          status === 'lost'
            ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
            : 'btn-primary'
        }`}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {isEdit ? 'Updating...' : 'Posting...'}
          </span>
        ) : (
          isEdit ? 'Update Item' : `Post ${status === 'lost' ? 'Lost' : 'Found'} Item`
        )}
      </button>
    </form>
  );
}
