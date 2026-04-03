import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(form);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
    setSaving(false);
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setChangingPw(true);
    try {
      await authAPI.changePassword(pwForm);
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
    setChangingPw(false);
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen pt-16 pb-16 bg-surface-50 dark:bg-surface-950">
      <div className="page-container max-w-2xl">
        <h1 className="section-title mb-8">👤 My Profile</h1>

        {/* Avatar banner */}
        <div className="card p-6 mb-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-2xl font-bold shadow-glow">
            {initials}
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Member since {user?.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : '–'}
            </p>
          </div>
          {user?.role === 'admin' && (
            <span className="ml-auto badge bg-violet-100 text-violet-700 font-bold">Admin</span>
          )}
        </div>

        {/* Edit profile */}
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-5">Edit Profile</h2>
          <form onSubmit={handleProfile} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
                className="input" required minLength={2} />
            </div>
            <div>
              <label className="label">Email <span className="text-slate-400 font-normal text-xs">(cannot be changed)</span></label>
              <input type="email" value={user?.email} className="input bg-slate-50 dark:bg-slate-800 cursor-not-allowed" disabled />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input type="tel" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))}
                placeholder="+91 98765 43210" className="input" />
            </div>
            <button type="submit" disabled={saving} className="btn-primary btn-md rounded-xl">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-5">Change Password</h2>
          <form onSubmit={handlePassword} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input type="password" value={pwForm.currentPassword}
                onChange={e => setPwForm(p => ({...p, currentPassword: e.target.value}))}
                className="input" required />
            </div>
            <div>
              <label className="label">New Password</label>
              <input type="password" value={pwForm.newPassword}
                onChange={e => setPwForm(p => ({...p, newPassword: e.target.value}))}
                placeholder="Min. 6 characters" className="input" required minLength={6} />
            </div>
            <button type="submit" disabled={changingPw} className="btn-secondary btn-md rounded-xl">
              {changingPw ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
