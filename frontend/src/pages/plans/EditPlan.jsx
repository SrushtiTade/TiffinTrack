import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';

export default function EditPlan() {
  const { id } = useParams();
  const [form, setForm] = useState({ planName: '', duration: 30, price: '', mealType: 'Lunch', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/plans/${id}`).then((res) => setForm(res.data));
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/plans/${id}`, { ...form, duration: Number(form.duration), price: Number(form.price) });
      navigate('/plans');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Edit Plan">
      <div className="card max-w-lg">
        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
            <input name="planName" value={form.planName} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
            <input name="duration" type="number" value={form.duration} onChange={handleChange} className="input-field" required min="1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
            <input name="price" type="number" value={form.price} onChange={handleChange} className="input-field" required min="0" />
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="input-field" rows="3" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Update Plan'}</button>
            <button type="button" onClick={() => navigate('/plans')} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
