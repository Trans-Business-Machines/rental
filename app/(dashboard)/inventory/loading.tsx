
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 p-6">
      {/* Header Section with Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-1/3 bg-gray-300 dark:bg-gray-700" />
              <Skeleton className="h-8 w-1/2 bg-gray-300 dark:bg-gray-700" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-3/4 bg-gray-300 dark:bg-gray-700" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-10 w-full max-w-xs bg-gray-300 dark:bg-gray-700" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 bg-gray-300 dark:bg-gray-700" />
          <Skeleton className="h-10 w-24 bg-gray-300 dark:bg-gray-700" />
        </div>
      </div>

      {/* Inventory Items Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-1/3 bg-gray-300 dark:bg-gray-700" />
                <Skeleton className="h-4 w-10 bg-gray-300 dark:bg-gray-700" />
              </div>
              <Skeleton className="h-6 w-3/4 bg-gray-300 dark:bg-gray-700" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full bg-gray-300 dark:bg-gray-700" />
                <Skeleton className="h-4 w-5/6 bg-gray-300 dark:bg-gray-700" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-700" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 bg-gray-300 dark:bg-gray-700" />
                  <Skeleton className="h-4 w-32 bg-gray-300 dark:bg-gray-700" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex w-full justify-between">
                <Skeleton className="h-8 w-20 bg-gray-300 dark:bg-gray-700" />
                <Skeleton className="h-8 w-20 bg-gray-300 dark:bg-gray-700" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
