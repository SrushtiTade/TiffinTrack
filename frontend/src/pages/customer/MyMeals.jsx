import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import CustomerLayout from '../../components/CustomerLayout';

const MealCard = ({ label, meal }) => (
  <section className="card">
    <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">{label}</h2>
    {meal ? <><p className="text-xl font-bold">{meal.title}</p><p className="text-gray-600 mt-2">{meal.items?.join(', ')}</p></> : <p className="text-gray-500">No meal has been published yet.</p>}
  </section>
);

export default function MyMeals() {
  const [data, setData] = useState(null); const [error, setError] = useState('');
  useEffect(() => { api.get('/customer-portal/meals').then((r) => setData(r.data)).catch((e) => setError(e.response?.data?.message || 'Unable to load meals.')); }, []);
  if (error) return <CustomerLayout title="Meals"><p className="text-red-600">{error}</p></CustomerLayout>;
  if (!data) return <CustomerLayout title="Meals"><p>Loading meals...</p></CustomerLayout>;
  if (!data.today && !data.tomorrow && !data.upcoming?.length) return <CustomerLayout title="Meals"><div className="card text-center"><p className="text-gray-600">No active subscription. Subscribe to a mess to view meals.</p><Link className="btn-primary inline-block mt-4" to="/customer/explore">Explore Messes</Link></div></CustomerLayout>;
  return <CustomerLayout title="Meals"><div className="grid md:grid-cols-2 gap-5"><MealCard label="Today" meal={data.today}/><MealCard label="Tomorrow" meal={data.tomorrow}/></div><section className="card mt-6"><h2 className="text-lg font-bold mb-3">Upcoming Meals</h2>{data.upcoming?.length ? <div className="space-y-3">{data.upcoming.map((m) => <div key={m._id} className="border-b pb-3"><b>{new Date(m.scheduledDate).toLocaleDateString()} — {m.title}</b><p className="text-gray-600">{m.items?.join(', ')}</p></div>)}</div> : <p className="text-gray-500">No upcoming meals published.</p>}</section></CustomerLayout>;
}
