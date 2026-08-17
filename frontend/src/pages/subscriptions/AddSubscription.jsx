import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';

export default function AddSubscription() {
  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({ customerId: '', planId: '', startDate: new Date().toISOString().split('T')[0] });
  const [expiryDate, setExpiryDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.get('/customers'), api.get('/plans')]).then(([cRes, pRes]) => {
      setCustomers(cRes.data);
      setPlans(pRes.data);
    });
  }, []);

  useEffect(() => {
    const plan = plans.find((p) => p._id === form.planId);
    if (plan && form.startDate) {
      const start = new Date(form.startDate);
      const end = new Date(start);
      end.setDate(end.getDate() + plan.duration);
      setExpiryDate(end.toLocaleDateString());
    } else {
      setExpiryDate('');
    }
  }, [form.planId, form.startDate, plans]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/subscriptions', form);
      navigate('/subscriptions');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Create Subscription">
      <div className="card max-w-lg">
        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
            <select name="customerId" value={form.customerId} onChange={handleChange} className="input-field" required>
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>{c.name} - {c.phone}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
            <select name="planId" value={form.planId} onChange={handleChange} className="input-field" required>
              <option value="">Select plan</option>
              {plans.map((p) => (
                <option key={p._id} value={p._id}>{p.planName} - ₹{p.price} ({p.duration} days)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input name="startDate" type="date" value={form.startDate} onChange={handleChange} className="input-field" required />
          </div>
          {expiryDate && (
            <div className="bg-primary-50 text-primary-700 px-4 py-3 rounded-lg text-sm">
              Expiry Date: <strong>{expiryDate}</strong>
            </div>
          )}
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Creating...' : 'Create Subscription'}</button>
            <button type="button" onClick={() => navigate('/subscriptions')} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
