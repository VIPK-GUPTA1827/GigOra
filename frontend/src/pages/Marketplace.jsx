import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Clock, Briefcase, Loader2 } from 'lucide-react';
import api from '../utils/api';

const CATEGORIES = [
  'All',
  'Web Development',
  'Mobile App Development',
  'UI/UX Design',
  'Data Science & AI',
  'Backend & APIs',
  'DevOps & Cloud',
  'Content & Writing',
  'Graphic Design'
];

const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [gigs, setGigs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'All';
  const minBudget = searchParams.get('minBudget') || '';
  const maxBudget = searchParams.get('maxBudget') || '';
  const page = parseInt(searchParams.get('page'), 10) || 1;

  const [searchInput, setSearchInput] = useState(search);
  const [minInput, setMinInput] = useState(minBudget);
  const [maxInput, setMaxInput] = useState(maxBudget);

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (!('page' in updates)) next.delete('page');
    setSearchParams(next);
  };

  useEffect(() => {
    setSearchInput(search);
    setMinInput(minBudget);
    setMaxInput(maxBudget);
  }, [search, minBudget, maxBudget]);

  useEffect(() => {
    document.title = 'Marketplace — GigOra';
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({ status: 'open', limit: '12', page: String(page) });
        if (search) params.set('search', search);
        if (category !== 'All') params.set('category', category);
        if (minBudget) params.set('minBudget', minBudget);
        if (maxBudget) params.set('maxBudget', maxBudget);

        const res = await api.get(`/api/gigs?${params.toString()}`);
        if (!cancelled) {
          setGigs(res.data || []);
          setTotalPages(res.totalPages || 1);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load projects');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [search, category, minBudget, maxBudget, page]);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateParams({ search: searchInput.trim(), minBudget: minInput, maxBudget: maxInput });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <h1 className="text-2xl font-bold text-slate-900">Find your next project</h1>
          <p className="text-sm text-slate-500 mt-1">Browse open projects posted by clients on GigOra.</p>

          <form onSubmit={handleSubmit} className="mt-5 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search projects, skills..."
                aria-label="Search projects"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                value={minInput}
                onChange={(e) => setMinInput(e.target.value)}
                placeholder="Min ₹"
                aria-label="Minimum budget"
                className="w-24 px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
              />
              <input
                type="number"
                min="0"
                value={maxInput}
                onChange={(e) => setMaxInput(e.target.value)}
                placeholder="Max ₹"
                aria-label="Maximum budget"
                className="w-24 px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
              >
                Search
              </button>
            </div>
          </form>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Categories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                aria-pressed={category === cat}
                onClick={() => updateParams({ category: cat === 'All' ? '' : cat })}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  category === cat
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {error && (
          <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500 text-sm gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading projects...
          </div>
        ) : gigs.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-700 font-semibold">No projects found</p>
            <p className="text-sm text-slate-500 mt-1">Try a different search or clear the filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gigs.map((gig) => (
              <Link
                key={gig._id}
                to={`/gigs/${gig._id}`}
                className="block rounded-2xl border border-slate-200 bg-white p-5 hover:border-indigo-300 hover:shadow-sm transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {gig.category}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(gig.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <h2 className="mt-3 text-base font-semibold text-slate-900 line-clamp-2">{gig.title}</h2>
                <p className="mt-1.5 text-sm text-slate-500 line-clamp-2">{gig.description}</p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {(gig.skillsRequired || []).slice(0, 3).map((skill) => (
                    <span key={skill} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                  <span className="font-semibold text-slate-900">{formatINR(gig.budget)}</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {gig.locationType || 'remote'}
                  </span>
                  <span>{gig.duration}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => updateParams({ page: String(page - 1) })}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => updateParams({ page: String(page + 1) })}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
