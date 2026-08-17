import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';

export default function EditCustomer() {
  const { id } = useParams();
  const [form, setForm] = useState({ name: '', phone: '', address: '', mealType: 'Lunch', status: 'Active' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/customers/${id}`).then((res) => setForm(res.data));
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/customers/${id}`, form);
      navigate('/customers');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update customer');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await api.delete(`/customers/${id}`);
      navigate('/customers');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete customer');
    }
  };

  return (
    <Layout title="Edit Customer">
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
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Update'}</button>
            <button type="button" onClick={() => navigate('/customers')} className="btn-secondary">Cancel</button>
            <button type="button" onClick={handleDelete} className="btn-danger ml-auto">Delete</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
