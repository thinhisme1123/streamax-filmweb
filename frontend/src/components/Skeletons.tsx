export const HeroBannerSkeleton = () => (
  <div className="relative h-[80vh] w-full bg-dark">
    <div className="absolute inset-0 bg-dark-light animate-pulse" />
    <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent" />
    
    <div className="relative h-full max-w-6xl mx-auto px-4 md:px-12 flex flex-col justify-center">
      <div className="max-w-2xl space-y-6">
        <div className="h-16 md:h-24 w-3/4 bg-gray-700/50 rounded animate-pulse" />
        <div className="flex gap-4">
          <div className="h-6 w-16 bg-gray-700/50 rounded animate-pulse" />
          <div className="h-6 w-12 bg-gray-700/50 rounded animate-pulse" />
          <div className="h-6 w-20 bg-gray-700/50 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          <div className="h-4 w-full bg-gray-700/50 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-gray-700/50 rounded animate-pulse" />
          <div className="h-4 w-4/6 bg-gray-700/50 rounded animate-pulse" />
        </div>
        <div className="flex gap-4 pt-4">
          <div className="h-12 w-32 bg-gray-700/50 rounded animate-pulse" />
          <div className="h-12 w-32 bg-gray-700/50 rounded animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

export const MovieCardSkeleton = () => (
  <div className="w-64 h-36 md:w-72 md:h-40 rounded-md bg-dark-light animate-pulse shrink-0" />
);

export const MovieCarouselSkeleton = () => (
  <div className="py-6 px-4 md:px-12">
    <div className="h-8 w-48 bg-gray-700/50 rounded mb-4 animate-pulse" />
    <div className="flex gap-4 overflow-hidden">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  </div>
);
