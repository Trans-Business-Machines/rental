import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

function UnauthorizedUI() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto size-12 md:size-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="size-8  text-red-600" />
          </div>
          <CardTitle>Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-2">
          <p className="text-base text-muted-foreground">
            You don&apos;t have permission to access this page.
          </p>
          <p className="text-sm text-muted-foreground">
            Only Super Administrators can access this page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export { UnauthorizedUI };
