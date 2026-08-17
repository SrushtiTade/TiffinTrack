import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Layout from '../components/Layout';
import api from '../api/axios';

const formatCurrency = (amount) => `₹${amount?.toLocaleString('en-IN') || 0}`;

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout title="Dashboard">
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">{error || 'No dashboard data available'}</p>
          <p className="text-sm mt-2">Make sure your mess profile is set up in Settings.</p>
        </div>
      </Layout>
    );
  }

  const stats = [
    { label: 'Total Customers', value: data.totalCustomers, icon: '👥', color: 'bg-blue-50 text-blue-600' },
    { label: 'Active Subscriptions', value: data.activeSubscriptions, icon: '✅', color: 'bg-green-50 text-green-600' },
    { label: 'Expired Subscriptions', value: data.expiredSubscriptions, icon: '⏰', color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Revenue', value: formatCurrency(data.revenue), icon: '💰', color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Expenses', value: formatCurrency(data.expenses), icon: '📝', color: 'bg-red-50 text-red-600' },
    { label: 'Profit', value: formatCurrency(data.profit), icon: '📈', color: 'bg-purple-50 text-purple-600' },
  ];

  const chartData = [
    { name: 'Revenue', amount: data.revenue },
    { name: 'Expenses', amount: data.expenses },
    { name: 'Profit', amount: data.profit },
  ];

  return (
    <Layout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.color}`}>
                {stat.label}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-3">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Financial Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="amount" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Payments</h3>
          {data.recentPayments?.length === 0 ? (
            <p className="text-gray-500 text-sm">No payments yet</p>
          ) : (
            <div className="space-y-3">
              {data.recentPayments?.map((p) => (
                <div key={p._id} className="flex justify-between items-center py-2 border-b border-gray-50">
                  <div>
                    <p className="font-medium text-sm">{p.customerId?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{new Date(p.paymentDate).toLocaleDateString()}</p>
                  </div>
                  <span className="text-green-600 font-semibold">{formatCurrency(p.amount)}</span>
                </div>
              ))}
            </div>
          )}
          <Link to="/payments" className="text-primary-600 text-sm hover:underline mt-4 inline-block">
            View all payments →
          </Link>
        </div>

        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Recent Expenses</h3>
          {data.recentExpenses?.length === 0 ? (
            <p className="text-gray-500 text-sm">No expenses yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.recentExpenses?.map((e) => (
                <div key={e._id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{e.category}</p>
                    <p className="text-xs text-gray-500">{e.description || new Date(e.expenseDate).toLocaleDateString()}</p>
                  </div>
                  <span className="text-red-600 font-semibold">{formatCurrency(e.amount)}</span>
                </div>
              ))}
            </div>
          )}
          <Link to="/expenses" className="text-primary-600 text-sm hover:underline mt-4 inline-block">
            View all expenses →
          </Link>
        </div>
      </div>
    </Layout>
  );
}
