import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';

export default function AddCustomer() {
  const [form, setForm] = useState({ name: '', phone: '', address: '', mealType: 'Lunch', status: 'Active' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/customers', form);
      navigate('/customers');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Add Customer">
      <div className="card max-w-lg">
        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input name="address" value={form.address} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
            <select name="mealType" value={form.mealType} onChange={handleChange} className="input-field">
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Both">Both</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="input-field">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Add Customer'}</button>
            <button type="button" onClick={() => navigate('/customers')} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
