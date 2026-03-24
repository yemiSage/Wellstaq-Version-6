import { Skeleton } from "@/components/ui/skeleton";

export default function InsightsLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[12px]">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-[14px] rounded-[12px] space-y-4">
            <div className="flex justify-between items-start">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>

      {/* Row 1 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[12px]">
        <div className="lg:col-span-2 bg-white p-[12px] rounded-[12px]">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-[300px] w-full" />
        </div>
        <div className="bg-white p-[12px] rounded-[12px]">
          <Skeleton className="h-6 w-48 mb-6" />
          <Skeleton className="h-[200px] w-[200px] rounded-full mx-auto mb-8" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[12px]">
        <div className="bg-white p-[20px] rounded-[12px]">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-4 w-32 mb-6" />
          <Skeleton className="h-[250px] w-full" />
        </div>
        <div className="bg-white p-[20px] rounded-[12px]">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-8 w-48 rounded-full" />
          </div>
          <Skeleton className="h-[250px] w-full" />
        </div>
      </div>

      {/* Top Performers */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[12px]">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-[20px] rounded-[12px] flex flex-col items-center">
              <Skeleton className="h-16 w-16 rounded-md mb-4" />
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-16 mb-6" />
              <Skeleton className="h-1.5 w-full rounded-full mb-2" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
