import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';

const formatCurrency = (amount) => `₹${amount?.toLocaleString('en-IN') || 0}`;

export default function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/expenses').then((res) => setExpenses(res.data)).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    await api.delete(`/expenses/${id}`);
    setExpenses(expenses.filter((e) => e._id !== id));
  };

  return (
    <Layout title="Expenses">
      <div className="flex justify-end mb-6">
        <Link to="/expenses/add" className="btn-primary">+ Add Expense</Link>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No expenses recorded yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Category</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Description</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Method</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{e.category}</td>
                  <td className="py-3 px-4 text-gray-500">{e.description || '-'}</td>
                  <td className="py-3 px-4 text-red-600 font-semibold">{formatCurrency(e.amount)}</td>
                  <td className="py-3 px-4">{e.paymentMethod}</td>
                  <td className="py-3 px-4">{new Date(e.expenseDate).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <button onClick={() => handleDelete(e._id)} className="text-red-600 hover:underline text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
