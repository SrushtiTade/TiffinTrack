import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';

export default function AddPayment() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    customerId: '',
    amount: '',
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    paymentDate: new Date().toISOString().split('T')[0],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/customers').then((res) => setCustomers(res.data));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/payments', { ...form, amount: Number(form.amount) });
      navigate('/payments');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Add Payment">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
            <input name="amount" type="number" value={form.amount} onChange={handleChange} className="input-field" required min="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="input-field">
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Card">Card</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select name="paymentStatus" value={form.paymentStatus} onChange={handleChange} className="input-field">
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
            <input name="paymentDate" type="date" value={form.paymentDate} onChange={handleChange} className="input-field" required />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Record Payment'}</button>
            <button type="button" onClick={() => navigate('/payments')} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
