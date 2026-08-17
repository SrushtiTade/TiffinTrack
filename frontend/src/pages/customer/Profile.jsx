import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import CustomerLayout from '../../components/CustomerLayout';

export default function Profile() {
  const { user } = useAuth(); const [form, setForm] = useState({ fullName: user?.fullName || '', email: user?.email || '', phone: user?.phone || '', address: user?.address || '' }); const [message, setMessage] = useState(''); const [saving, setSaving] = useState(false);
  const submit = async (e) => { e.preventDefault(); setSaving(true); try { await api.put('/customer-portal/profile', form); setMessage('Profile updated successfully.'); } catch (err) { setMessage(err.response?.data?.message || 'Unable to update profile.'); } finally { setSaving(false); } };
  return <CustomerLayout title="Profile"><form onSubmit={submit} className="card max-w-xl space-y-4"><p className={message.includes('success') ? 'text-green-600' : 'text-red-600'}>{message}</p>{[['fullName','Name'],['email','Email'],['phone','Phone']].map(([name,label]) => <label className="block" key={name}>{label}<input className="input-field mt-1" name={name} value={form[name]} disabled={name === 'email'} onChange={(e) => setForm({...form,[name]:e.target.value})}/></label>)}<label className="block">Address<textarea className="input-field mt-1" rows="3" value={form.address} onChange={(e) => setForm({...form,address:e.target.value})}/></label><button className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button></form></CustomerLayout>;
}
