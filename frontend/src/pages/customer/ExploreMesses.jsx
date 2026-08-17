import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { CustomerLayout } from '../../components/CustomerLayout';

const ExploreMesses = () => {
  const [messes, setMesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMesses = async () => {
      try {
        setLoading(true);
        const url = search ? `/messes?search=${encodeURIComponent(search)}` : '/messes';
        const response = await axios.get(url);
        setMesses(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch messes. Please try again later.');
        console.error('Error fetching messes:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchMesses();
    }, 500); // Debounce search

    return () => clearTimeout(debounceTimer);
  }, [search]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const getPriceRange = (plans) => {
    if (!plans || plans.length === 0) return 'N/A';
    if (plans.length === 1) return `₹${plans[0].price}`;
    
    const prices = plans.map(p => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    
    if (min === max) return `₹${min}`;
    return `₹${min} - ₹${max}`;
  };

  return (
    <CustomerLayout title="Explore Messes">
      <div className="space-y-6 pb-8">
        <section className="rounded-2xl bg-gradient-to-r from-primary-700 via-orange-600 to-amber-500 p-6 sm:p-8 text-white shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-100">Tiffin made simple</p>
          <h2 className="mt-2 text-3xl font-bold">Find a mess that feels like home.</h2>
          <p className="mt-2 max-w-xl text-orange-50">Compare real local tiffin plans, prices, ratings, and meal options before you subscribe.</p>
        </section>

        <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex items-center focus-within:ring-2 focus-within:ring-primary-300">
          <span className="px-3 text-xl">🔍</span>
          <input
            type="text"
            placeholder="Search by mess name, location, or cuisine..."
            className="flex-1 bg-transparent outline-none px-2 py-3 text-gray-700"
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg shadow-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : messes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <div className="text-5xl mb-4 text-gray-300">🍽️</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No messes found</h3>
            <p className="text-gray-500">Try adjusting your search criteria to find what you're looking for.</p>
          </div>
        ) : (
          <>
          <div className="flex items-center justify-between"><p className="font-semibold text-gray-900">{messes.length} mess{messes.length === 1 ? '' : 'es'} available</p><p className="text-sm text-gray-500">Choose a plan that suits you</p></div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {messes.map((mess) => (
              <div 
                key={mess._id} 
                onClick={() => navigate(`/customer/mess/${mess._id}`)}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-200 group flex flex-col"
              >
                <div className="h-44 bg-gradient-to-br from-orange-100 to-amber-50 relative overflow-hidden">
                  {mess.image ? <img src={mess.image} alt={mess.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="absolute inset-0 flex items-center justify-center text-6xl">🥘</div>}
                  <div className="absolute top-3 right-3 bg-white/95 px-3 py-1.5 rounded-full text-sm font-bold shadow">⭐ {Number(mess.rating || 0).toFixed(1)}</div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">{mess.name}</h3>
                  <p className="text-sm text-gray-500 mb-3 flex items-start">
                    <span className="mr-1 mt-0.5">📍</span> {mess.location}
                  </p>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {mess.description || 'No description provided.'}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Plans</p>
                      <p className="text-sm font-medium text-gray-900">{mess.plans?.length || 0} Available</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Price</p>
                      <p className="text-sm font-bold text-primary-600">{getPriceRange(mess.plans)}</p>
                    </div>
                  </div>
                  <button className="mt-5 w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white group-hover:bg-primary-700">View plans →</button>
                </div>
              </div>
            ))}
          </div>
          </>
        )}
      </div>
    </CustomerLayout>
  );
};

export default ExploreMesses;
