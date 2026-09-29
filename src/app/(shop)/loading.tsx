export default function Loading() {
  return (
    <div className="container-x py-6" aria-busy="true" aria-label="جاري التحميل">
      <div className="skeleton h-40 w-full rounded-[2rem] sm:h-64" />
      <div className="mt-6 flex gap-3 overflow-hidden">{Array.from({ length: 7 }).map((_, i) => <div key={i} className="flex shrink-0 flex-col items-center gap-2"><div className="skeleton h-16 w-16 rounded-full" /><div className="skeleton h-3 w-14" /></div>)}</div>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card space-y-2 p-2.5"><div className="skeleton aspect-square w-full" /><div className="skeleton h-3 w-2/3" /><div className="skeleton h-3 w-1/3" /><div className="skeleton h-10 w-full" /></div>
        ))}
      </div>
    </div>
  );
}
