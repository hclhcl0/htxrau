export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        {/* Article content skeleton */}
        <div>
          {/* Breadcrumb */}
          <div className="flex gap-2 mb-4">
            <div className="h-4 w-16 bg-gray-200 rounded" />
            <div className="h-4 w-4 bg-gray-100 rounded" />
            <div className="h-4 w-32 bg-gray-200 rounded" />
          </div>
          {/* Title */}
          <div className="h-8 bg-gray-200 rounded-lg mb-2 w-full" />
          <div className="h-8 bg-gray-200 rounded-lg mb-6 w-3/4" />
          {/* Meta */}
          <div className="flex gap-4 mb-6">
            <div className="h-4 w-24 bg-gray-100 rounded" />
            <div className="h-4 w-20 bg-gray-100 rounded" />
          </div>
          {/* Image */}
          <div className="w-full h-72 bg-gray-100 rounded-2xl mb-6" />
          {/* Body paragraphs */}
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-4/5" />
            </div>
          ))}
        </div>
        {/* Sidebar skeleton */}
        <div className="space-y-4">
          <div className="h-48 bg-gray-100 rounded-2xl" />
          <div className="h-64 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
