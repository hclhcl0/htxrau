export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-pulse">
      {/* Header skeleton */}
      <div className="h-8 w-56 bg-gray-200 rounded-lg mb-6" />
      <div className="h-1 w-20 bg-gray-200 rounded-full mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        {/* Main content skeleton */}
        <div className="space-y-5">
          {/* Featured article */}
          <div className="rounded-2xl overflow-hidden bg-gray-100 h-64 mb-4" />
          {/* Article list */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 py-4 border-b border-gray-100">
              <div className="w-28 h-20 bg-gray-200 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-4/5" />
                <div className="h-3 bg-gray-100 rounded w-1/3 mt-2" />
              </div>
            </div>
          ))}
          {/* Pagination skeleton */}
          <div className="flex gap-2 mt-6 justify-center">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-9 h-9 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="space-y-4">
          <div className="h-48 bg-gray-100 rounded-2xl" />
          <div className="h-64 bg-gray-100 rounded-2xl" />
          <div className="h-32 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
