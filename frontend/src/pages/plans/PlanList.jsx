import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';

const formatCurrency = (amount) => `₹${amount?.toLocaleString('en-IN') || 0}`;

export default function PlanList() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/plans').then((res) => setPlans(res.data)).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    await api.delete(`/plans/${id}`);
    setPlans(plans.filter((p) => p._id !== id));
  };

  return (
    <Layout title="Meal Plans">
      <div className="flex justify-end mb-6">
        <Link to="/plans/add" className="btn-primary">+ Create Plan</Link>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : plans.length === 0 ? (
        <div className="card text-center py-8 text-gray-500">No plans created yet</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div key={plan._id} className="card">
              <h3 className="text-lg font-semibold text-gray-900">{plan.planName}</h3>
              <p className="text-2xl font-bold text-primary-600 mt-2">{formatCurrency(plan.price)}</p>
              <div className="mt-3 space-y-1 text-sm text-gray-600">
                <p>Duration: {plan.duration} days</p>
                <p>Meal Type: {plan.mealType}</p>
                {plan.description && <p className="text-gray-500">{plan.description}</p>}
              </div>
              <div className="flex gap-2 mt-4">
                <Link to={`/plans/${plan._id}/edit`} className="btn-secondary text-sm flex-1 text-center">Edit</Link>
                <button onClick={() => handleDelete(plan._id)} className="btn-danger text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
