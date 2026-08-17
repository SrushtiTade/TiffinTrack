import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';

export default function AddExpense() {
  const [form, setForm] = useState({
    category: 'Vegetables',
    amount: '',
    description: '',
    paymentMethod: 'Cash',
    expenseDate: new Date().toISOString().split('T')[0],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/expenses', { ...form, amount: Number(form.amount) });
      navigate('/expenses');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Add Expense">
      <div className="card max-w-lg">
        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select name="category" value={form.category} onChange={handleChange} className="input-field">
              <option value="Vegetables">Vegetables</option>
              <option value="Gas">Gas</option>
              <option value="Salary">Salary</option>
              <option value="Packaging">Packaging</option>
              <option value="Rent">Rent</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
            <input name="amount" type="number" value={form.amount} onChange={handleChange} className="input-field" required min="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input name="description" value={form.description} onChange={handleChange} className="input-field" placeholder="Optional details" />
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Expense Date</label>
            <input name="expenseDate" type="date" value={form.expenseDate} onChange={handleChange} className="input-field" required />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Add Expense'}</button>
            <button type="button" onClick={() => navigate('/expenses')} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
