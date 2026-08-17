import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';

const statusColors = {
  Active: 'bg-green-100 text-green-700',
  Expired: 'bg-red-100 text-red-700',
  Paused: 'bg-yellow-100 text-yellow-700',
};

export default function SubscriptionList() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = () => {
    api.get('/subscriptions').then((res) => setSubscriptions(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleAction = async (id, action) => {
    await api.put(`/subscriptions/${id}/${action}`);
    fetchSubscriptions();
  };

  return (
    <Layout title="Subscriptions">
      <div className="flex justify-end mb-6">
        <Link to="/subscriptions/add" className="btn-primary">+ New Subscription</Link>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No subscriptions yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Plan</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Start Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">End Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((s) => (
                <tr key={s._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{s.customerId?.name}</td>
                  <td className="py-3 px-4">{s.planId?.planName}</td>
                  <td className="py-3 px-4">₹{s.price?.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4">{new Date(s.startDate).toLocaleDateString()}</td>
                  <td className="py-3 px-4">{new Date(s.endDate).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[s.status]}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 space-x-2">
                    {s.status === 'Active' && (
                      <button onClick={() => handleAction(s._id, 'pause')} className="text-yellow-600 hover:underline text-xs">Pause</button>
                    )}
                    {s.status === 'Paused' && (
                      <button onClick={() => handleAction(s._id, 'resume')} className="text-green-600 hover:underline text-xs">Resume</button>
                    )}
                    {(s.status === 'Expired' || new Date(s.endDate) < new Date()) && (
                      <button onClick={() => handleAction(s._id, 'renew')} className="text-primary-600 hover:underline text-xs">Renew</button>
                    )}
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
