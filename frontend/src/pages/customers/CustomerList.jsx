import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCustomers = () => {
    setLoading(true);
    api
      .get('/customers', { params: { search } })
      .then((res) => setCustomers(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCustomers();
  };

  return (
    <Layout title="Customers">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field w-64"
          />
          <button type="submit" className="btn-secondary">Search</button>
        </form>
        <Link to="/customers/add" className="btn-primary">+ Add Customer</Link>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : customers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No customers found</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Phone</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Email / Address</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Current Plan</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Subscription</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Meal Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{c.name}</td>
                  <td className="py-3 px-4">{c.phone}</td>
                  <td className="py-3 px-4 text-xs text-gray-600"><p>{c.email || '-'}</p><p className="mt-1 max-w-[180px] truncate">{c.address || '-'}</p></td>
                  <td className="py-3 px-4">{c.currentSubscription?.planId?.planName || '-'}</td>
                  <td className="py-3 px-4 text-xs text-gray-600">{c.currentSubscription ? <><p>{new Date(c.currentSubscription.startDate).toLocaleDateString()} – {new Date(c.currentSubscription.endDate).toLocaleDateString()}</p><p className="mt-1 font-medium">{c.currentSubscription.status}</p></> : '-'}</td>
                  <td className="py-3 px-4">{c.mealType}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Link to={`/customers/${c._id}/edit`} className="text-primary-600 hover:underline">
                      Edit
                    </Link>
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
