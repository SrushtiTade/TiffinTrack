import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';

const formatCurrency = (amount) => `₹${amount?.toLocaleString('en-IN') || 0}`;

export default function PaymentList() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/payments').then((res) => setPayments(res.data)).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payment record?')) return;
    await api.delete(`/payments/${id}`);
    setPayments(payments.filter((p) => p._id !== id));
  };

  return (
    <Layout title="Payments">
      <div className="flex justify-end mb-6">
        <Link to="/payments/add" className="btn-primary">+ Add Payment</Link>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No payments recorded yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Plan / Transaction</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Method</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{p.customerId?.name}</td>
                  <td className="py-3 px-4 text-xs"><p>{p.subscriptionId?.planId?.planName || '-'}</p><p className="mt-1 font-mono text-gray-500">{p.razorpayPaymentId || p.transactionId || '-'}</p></td>
                  <td className="py-3 px-4 text-green-600 font-semibold">{formatCurrency(p.amount)}</td>
                  <td className="py-3 px-4">{p.paymentMethod}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      p.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {p.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4">{new Date(p.paymentDate).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <button onClick={() => handleDelete(p._id)} className="text-red-600 hover:underline text-xs">Delete</button>
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
