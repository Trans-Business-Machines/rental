import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import Link from "next/link";

function GuestNotFound() {
  return (
    <section className="py-6 px-4 flex justify-center">
      <Card className="max-w-md w-full">
        <CardContent className="text-center">
          <XCircle className="size-12 text-chart-5/80 mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Guest not found</h2>
          <p className="text-sm text-muted-foreground">
            The guest you are looking for was not found!
          </p>
          <Button asChild className="mt-4">
            <Link href="/guests">Back to Guests</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

export default GuestNotFound;
