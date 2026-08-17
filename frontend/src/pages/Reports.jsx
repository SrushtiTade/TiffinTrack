import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Layout from '../components/Layout';
import api from '../api/axios';

const formatCurrency = (amount) => `₹${amount?.toLocaleString('en-IN') || 0}`;
const COLORS = ['#f97316', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Reports() {
  const [activeTab, setActiveTab] = useState('revenue');
  const [revenue, setRevenue] = useState(null);
  const [expenses, setExpenses] = useState(null);
  const [profit, setProfit] = useState(null);
  const [customers, setCustomers] = useState(null);
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/reports/revenue'),
      api.get('/reports/expenses'),
      api.get('/reports/profit'),
      api.get('/reports/customers'),
      api.get('/reports/plans'),
    ]).then(([rRes, eRes, pRes, cRes, planRes]) => {
      setRevenue(rRes.data);
      setExpenses(eRes.data);
      setProfit(pRes.data);
      setCustomers(cRes.data);
      setPlans(planRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const tabs = [
    { id: 'revenue', label: 'Revenue' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'profit', label: 'Profit' },
    { id: 'customers', label: 'Customers' },
    { id: 'plans', label: 'Plans' },
  ];

  if (loading) {
    return (
      <Layout title="Reports">
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  const expenseChartData = expenses?.categoryBreakdown
    ? Object.entries(expenses.categoryBreakdown).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <Layout title="Business Reports">
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="stat-card max-w-xs">
            <p className="text-sm text-gray-500">Total Income</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(revenue.totalIncome)}</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Payment History</h3>
            {revenue.payments.length === 0 ? (
              <p className="text-gray-500 text-sm">No payments recorded</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-gray-500">Customer</th>
                    <th className="text-left py-2 font-medium text-gray-500">Amount</th>
                    <th className="text-left py-2 font-medium text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {revenue.payments.map((p) => (
                    <tr key={p._id} className="border-b border-gray-50">
                      <td className="py-2">{p.customerId?.name}</td>
                      <td className="py-2 text-green-600 font-medium">{formatCurrency(p.amount)}</td>
                      <td className="py-2">{new Date(p.paymentDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="space-y-6">
          <div className="stat-card max-w-xs">
            <p className="text-sm text-gray-500">Total Spending</p>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(expenses.totalSpending)}</p>
          </div>
          {expenseChartData.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Expense by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={expenseChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {expenseChartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {activeTab === 'profit' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat-card">
              <p className="text-sm text-gray-500">Revenue</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(profit.revenue)}</p>
            </div>
            <div className="stat-card">
              <p className="text-sm text-gray-500">Expenses</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(profit.totalExpenses)}</p>
            </div>
            <div className="stat-card">
              <p className="text-sm text-gray-500">Profit</p>
              <p className={`text-2xl font-bold ${profit.profit >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                {formatCurrency(profit.profit)}
              </p>
            </div>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Profit Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[
                { name: 'Revenue', amount: profit.revenue },
                { name: 'Expenses', amount: profit.totalExpenses },
                { name: 'Profit', amount: profit.profit },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat-card">
              <p className="text-sm text-gray-500">Total Customers</p>
              <p className="text-2xl font-bold">{customers.totalCustomers}</p>
            </div>
            <div className="stat-card">
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-green-600">{customers.activeCustomers}</p>
            </div>
            <div className="stat-card">
              <p className="text-sm text-gray-500">Inactive</p>
              <p className="text-2xl font-bold text-gray-500">{customers.inactiveCustomers}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'plans' && (
        <div className="card overflow-x-auto"><h3 className="text-lg font-semibold mb-4">Plan Usage</h3>{plans?.plans?.length ? <table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left py-2">Plan</th><th className="text-left py-2">Subscribers</th><th className="text-left py-2">Revenue</th></tr></thead><tbody>{plans.plans.map((plan) => <tr className="border-b" key={plan.planId}><td className="py-2">{plan.planName || 'Deleted plan'}</td><td>{plan.subscribers}</td><td>{formatCurrency(plan.revenue)}</td></tr>)}</tbody></table> : <p className="text-gray-500">No plan subscriptions recorded.</p>}</div>
      )}
    </Layout>
  );
}
