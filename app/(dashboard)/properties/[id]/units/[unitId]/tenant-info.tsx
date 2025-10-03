import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";
import type { Unit } from "@/lib/data/properties";

interface TenantInfoProps {
  tenant: NonNullable<Unit["tenant"]>;
}

export default function TenantInfo({ tenant }: TenantInfoProps) {
  return (
    <Card className="mb-6 border-border shadow-sm bg-card rounded-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground">
          Tenant information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-chart-1/10">
            <User className="h-5 w-5 text-chart-1" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Tenant Name</span>
            <span className="text-foreground font-medium">{tenant.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-chart-2/10">
            <Phone className="h-5 w-5 text-chart-2" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Phone Number</span>
            <span className="text-foreground font-medium">{tenant.phone}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-chart-3/10">
            <Mail className="h-5 w-5 text-chart-3" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Email Address</span>
            <span className="text-foreground font-medium">{tenant.email}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-chart-4/10">
            <Calendar className="h-5 w-5 text-chart-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Lease Start</span>
            <span className="text-foreground font-medium">
              {format(new Date(tenant.leaseStart), "PPP")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
