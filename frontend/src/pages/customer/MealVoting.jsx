import { useEffect, useState } from 'react';
import api from '../../api/axios';
import CustomerLayout from '../../components/CustomerLayout';

export default function MealVoting() {
  const [polls, setPolls] = useState(null); const [message, setMessage] = useState('');
  const load = () => api.get('/customer-portal/polls').then((r) => setPolls(r.data)).catch(() => setMessage('Unable to load polls.'));
  useEffect(() => { load(); }, []);
  const vote = async (pollId, optionId) => { try { await api.post('/customer-portal/polls/vote', { pollId, optionId }); setMessage('Your vote was saved.'); load(); } catch (e) { setMessage(e.response?.data?.message || 'Unable to save vote.'); } };
  if (!polls) return <CustomerLayout title="Meal Voting"><p>Loading polls...</p></CustomerLayout>;
  return <CustomerLayout title="Meal Voting"><p className={message.includes('saved') ? 'text-green-600 mb-4' : 'text-red-600 mb-4'}>{message}</p>{polls.length ? <div className="space-y-5">{polls.map((poll) => <section className="card" key={poll._id}><h2 className="text-lg font-bold">{poll.question}</h2><p className="text-sm text-gray-500 mb-3">Closes {new Date(poll.deadline).toLocaleString()}</p><div className="space-y-2">{poll.options.map((option) => <button key={option._id} onClick={() => vote(poll._id, option._id)} className={`w-full text-left border rounded-lg px-4 py-3 ${poll.myVoteOptionId === option._id ? 'border-primary-600 bg-primary-50' : 'hover:bg-gray-50'}`}>{option.text}{poll.myVoteOptionId === option._id && ' ✓'}</button>)}</div></section>)}</div> : <div className="card text-gray-500">No open polls for your subscribed mess.</div>}</CustomerLayout>;
}
