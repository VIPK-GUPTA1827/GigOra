import React from 'react';

export function GigCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-20 bg-slate-200 rounded-full" />
        <div className="h-3 w-16 bg-slate-100 rounded" />
      </div>
      <div className="mt-3 h-5 w-3/4 bg-slate-200 rounded" />
      <div className="mt-2 h-4 w-full bg-slate-100 rounded" />
      <div className="mt-1 h-4 w-2/3 bg-slate-100 rounded" />
      
      <div className="mt-4 flex gap-1.5">
        <div className="h-4 w-12 bg-slate-100 rounded-full" />
        <div className="h-4 w-14 bg-slate-100 rounded-full" />
        <div className="h-4 w-10 bg-slate-100 rounded-full" />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="h-4 w-14 bg-slate-200 rounded" />
        <div className="h-3 w-16 bg-slate-100 rounded" />
        <div className="h-3 w-12 bg-slate-100 rounded" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <GigCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default GigCardSkeleton;
