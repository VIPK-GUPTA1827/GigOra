import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ArrowLeft, MapPin, Clock, Briefcase, RefreshCw, X } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { SkeletonGrid } from '../components/Skeleton';

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
  const { user } = useAuth();
  const backUrl = user
    ? user.role === 'client'
      ? '/client/dashboard'
      : '/freelancer/dashboard'
    : '/';
  const backLabel = user ? 'Back to Dashboard' : 'Back to GigOra';
  const [searchParams, setSearchParams] = useSearchParams();
  const [gigs, setGigs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'All';
  const minBudget = searchParams.get('minBudget') || '';
  const maxBudget = searchParams.get('maxBudget') || '';
  const page = parseInt(searchParams.get('page'), 10) || 1;
  const sort = searchParams.get('sort') || 'newest';

  const [searchInput, setSearchInput] = useState(search);
  const [minInput, setMinInput] = useState(minBudget);
  const [maxInput, setMaxInput] = useState(maxBudget);

  const updateParams = useCallback((updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (!('page' in updates)) next.delete('page');
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  const clearAllFilters = () => {
    setSearchInput('');
    setMinInput('');
    setMaxInput('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Boolean(search || category !== 'All' || minBudget || maxBudget || page > 1 || sort !== 'newest');

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
        if (sort && sort !== 'newest') params.set('sort', sort);

        const res = await api.get(`/api/gigs?${params.toString()}`);
        if (!cancelled) {
          setGigs(res.data || []);
          setTotalPages(res.totalPages || 1);
          setTotalCount(res.totalCount || (res.data ? res.data.length : 0));
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load projects');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [search, category, minBudget, maxBudget, page, sort, reloadKey]);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateParams({ search: searchInput.trim(), minBudget: minInput, maxBudget: maxInput });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-stone-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-50 py-4 px-6 sm:px-12 flex items-center justify-between">
        <Link to={backUrl} className="flex items-center gap-2 text-sm font-semibold text-[#030B3D] hover:text-[#0F766E] transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>{backLabel}</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-[#030B3D] text-white flex items-center justify-center font-bold text-xs">G</div>
          <span className="font-display font-black text-lg text-[#030B3D]">GigOra</span>
        </div>
      </header>

      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Find your next project</h1>
              <p className="text-sm text-slate-500 mt-1">
                Browse open gigs posted by verified clients. {!loading && totalCount > 0 && <span className="font-semibold text-[#0F766E]">({totalCount} available)</span>}
              </p>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-3.5 h-3.5" />
                Clear all filters
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-5 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search projects by title, skill, or keyword..."
                aria-label="Search projects"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15 outline-none"
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
                className="w-24 px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#0D9488]"
              />
              <input
                type="number"
                min="0"
                value={maxInput}
                onChange={(e) => setMaxInput(e.target.value)}
                placeholder="Max ₹"
                aria-label="Maximum budget"
                className="w-24 px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#0D9488]"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#0F766E] text-white font-medium text-sm hover:bg-[#115E59] transition"
              >
                Filter
              </button>
              <select
                value={sort}
                onChange={(e) => updateParams({ sort: e.target.value === 'newest' ? '' : e.target.value })}
                aria-label="Sort projects"
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#0D9488] bg-white text-slate-700 cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="budget_desc">Highest Budget</option>
                <option value="budget_asc">Lowest Budget</option>
              </select>
            </div>
          </form>

          {/* Category Tabs */}
          <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((c) => {
              const active = (c === 'All' && !searchParams.get('category')) || searchParams.get('category') === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => updateParams({ category: c === 'All' ? '' : c })}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? 'bg-[#0F766E] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Error State with Retry Button */}
        {error && (
          <div role="alert" className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-800">
            <div>
              <p className="font-semibold text-sm">Failed to load projects</p>
              <p className="text-xs text-rose-600 mt-0.5">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try again
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading ? (
          <SkeletonGrid count={6} />
        ) : gigs.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 px-4 rounded-3xl border border-dashed border-slate-200 bg-white">
            <div className="w-16 h-16 rounded-2xl bg-[#F0FDFA] text-[#0F766E] flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-[#0D9488]" />
            </div>
            <h3 className="text-slate-800 font-bold text-lg">No open projects found</h3>
            <p className="text-sm text-slate-500 mt-1.5 max-w-md mx-auto">
              {hasActiveFilters
                ? 'We could not find any projects matching your current filters. Try relaxing your search criteria or clearing filters.'
                : 'There are currently no open projects available. Check back soon or post a new gig.'}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F766E] text-white text-xs font-semibold hover:bg-[#115E59] transition"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          /* Gigs Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gigs.map((gig) => (
              <Link
                key={gig._id}
                to={`/gigs/${gig._id}`}
                className="group block rounded-2xl border border-slate-200 bg-white p-5 hover:border-[#0D9488] hover:shadow-md transition duration-200"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-[#0F766E] bg-[#F0FDFA] px-2.5 py-0.5 rounded-full">
                    {gig.category}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(gig.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <h2 className="mt-3 text-base font-semibold text-slate-900 group-hover:text-[#0F766E] transition-colors line-clamp-2">
                  {gig.title}
                </h2>
                <p className="mt-1.5 text-sm text-slate-500 line-clamp-2 leading-relaxed">
                  {gig.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {(gig.skillsRequired || []).slice(0, 3).map((skill) => (
                    <span key={skill} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {skill}
                    </span>
                  ))}
                  {(gig.skillsRequired || []).length > 3 && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-50 text-slate-400">
                      +{gig.skillsRequired.length - 3}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                  <span className="font-bold text-slate-900 text-sm">{formatINR(gig.budget)}</span>
                  <span className="flex items-center gap-1 capitalize">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {gig.locationType || 'remote'}
                  </span>
                  <span>{gig.duration}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Enhanced Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => updateParams({ page: String(page - 1) })}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              // Show current page, first, last, and immediate neighbours
              if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => updateParams({ page: String(p) })}
                    className={`min-w-[36px] h-9 rounded-xl text-xs font-semibold transition ${
                      page === p
                        ? 'bg-[#0F766E] text-white shadow-sm'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                );
              }
              if (p === page - 2 || p === page + 2) {
                return <span key={p} className="text-slate-400 text-xs px-1">...</span>;
              }
              return null;
            })}

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => updateParams({ page: String(page + 1) })}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
