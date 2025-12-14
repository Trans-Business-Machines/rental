import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-12 pb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-2">Checkout Complete!</h1>
          <p className="text-muted-foreground mb-8">
            The checkout report has been created successfully. The guest&apos;s
            booking has been marked as checked out.
          </p>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/bookings">View All Bookings</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
