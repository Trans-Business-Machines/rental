"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CreditCard, Upload } from "lucide-react";
import {
  getPaymentSettings,
  upsertPaymentSettings,
} from "@/lib/actions/payments";
import { toast } from "sonner";
import type { Role } from "@/lib/types/types";

interface PaymentsContentProps {
  userRole: Role;
}

interface PaymentSettings {
  id: string;
  paybillNumber: string;
  accountNumber: string;
  notes?: string | null;
}

export function PaymentsContent({ userRole }: PaymentsContentProps) {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [paybillNumber, setPaybillNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [notes, setNotes] = useState<string | null>("");

  const isSuperAdmin = userRole === "superAdmin";

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await getPaymentSettings();
      if (data) {
        setSettings(data);
        setPaybillNumber(data.paybillNumber);
        setAccountNumber(data.accountNumber);
        setNotes(data?.notes);
      }
    } catch (error) {
      console.error("Error fetching payment settings:", error);
      toast.error("Failed to load payment settings");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    if (!paybillNumber.trim() || !accountNumber.trim()) {
      toast.error("Both paybill number and account number are required");
      return;
    }

    if (paybillNumber.trim().length !== 6) {
      toast.error("Paybill number must be exactly 6 characters");
      return;
    }

    if (accountNumber.trim().length !== 10) {
      toast.error("Account number must be exactly 10 characters");
      return;
    }

    setIsSaving(true);
    try {
      const result = await upsertPaymentSettings({
        paybillNumber: paybillNumber.trim(),
        accountNumber: accountNumber.trim(),
        notes: notes?.trim(),
      });

      if (result.success) {
        setSettings(result.settings);
        setPaybillNumber("");
        setAccountNumber("");
        setNotes(null);
        toast.success("Payment settings saved successfully");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save settings",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] grid place-items-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-6 text-primary animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">
            Loading payment information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground">
          Payment Information
        </h1>
        <p className="text-muted-foreground">
          {isSuperAdmin
            ? "Manage the payment details displayed to agents and admins."
            : "Use these details when processing guest payments."}
        </p>
      </header>

      <div className={isSuperAdmin ? "grid gap-6 lg:grid-cols-2" : "max-w-2xl"}>
        {/* Payment Details Card - Visible to all */}
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 via-white to-green-100">
          <div className="h-2 bg-gradient-to-r from-green-500 via-emerald-400 to-green-600" />

          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-green-600 text-white shadow-md">
                <CreditCard className="size-6" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-green-800">
                  Lipa na M-Pesa
                </h2>
                <p className="text-sm font-normal text-green-600">
                  Paybill Details
                </p>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            {settings ? (
              <>
                <div className="grid gap-4">
                  <div className="group relative overflow-hidden rounded-2xl border border-green-200 bg-white/80 p-5 shadow-sm transition-all hover:shadow-md">
                    <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-green-100 blur-2xl opacity-70" />

                    <article className="relative">
                      <p className="text-xs uppercase tracking-wider text-green-500 font-semibold">
                        Paybill Number
                      </p>

                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-3xl font-extrabold tracking-widest text-green-800">
                          {settings.paybillNumber}
                        </p>

                        <div className="rounded-xl bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          Business
                        </div>
                      </div>
                    </article>
                  </div>

                  <div className="group relative overflow-hidden rounded-2xl border border-green-200 bg-white/80 p-5 shadow-sm transition-all hover:shadow-md">
                    <div className="absolute bottom-0 left-0 h-20 w-20 rounded-full bg-emerald-100 blur-2xl opacity-70" />

                    <div className="relative">
                      <p className="text-xs uppercase tracking-wider text-green-500 font-semibold">
                        Account Number
                      </p>

                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-2xl font-bold tracking-wide text-green-800 break-all">
                          {settings.accountNumber}
                        </p>

                        <div className="rounded-xl bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                          Active
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border  border-green-300 bg-green-50 px-4 py-3 text-center">
                  {settings?.notes && (
                    <p className="text-sm font-semibold leading-relaxed text-green-700">
                      {settings.notes.charAt(0).toUpperCase() +
                        settings.notes.substring(1)}
                    </p>
                  )}
                  <p className="text-xs leading-relaxed text-green-700">
                    Use these details when processing guest payments through
                    M-Pesa.
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
                  <CreditCard className="size-8 text-green-400" />
                </div>

                <p className="text-base font-semibold text-green-700">
                  No payment details configured
                </p>

                <p className="mt-2 max-w-sm text-sm text-green-600">
                  {isSuperAdmin
                    ? "Use the form to add M-Pesa payment details."
                    : "Please contact a super admin to set up payment details."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Form - SuperAdmin Only */}
        {isSuperAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {settings ? "Update Payment Details" : "Add Payment Details"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Paybill Number */}
              <div className="space-y-2">
                <Label htmlFor="paybillNumber">Paybill Number</Label>
                <Input
                  id="paybillNumber"
                  type="text"
                  placeholder="e.g. 522522"
                  maxLength={6}
                  value={paybillNumber}
                  onChange={(e) => setPaybillNumber(e.target.value)}
                />
              </div>

              {/* Account Number */}
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  type="text"
                  placeholder="e.g. 1********9"
                  maxLength={10}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>

              {/* Additonal notes  */}
              <div className="space-y-2">
                <Label htmlFor="notes">Bank Details (optional)</Label>
                <Textarea
                  id="notes"
                  rows={5}
                  placeholder="Additional notes about the bank, for example KCB bank."
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="p-1 rounded-lg">
                <h4 className="text-sm font-semibold mb-2">Note</h4>
                <p className="text-xs text-muted-foreground">
                  These payment details will be visible to all agents and admins
                  for processing guest payments.
                </p>
              </div>

              <Button
                onClick={handleSave}
                disabled={
                  isSaving || !paybillNumber.trim() || !accountNumber.trim()
                }
                className="py-3 w-full cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Upload className="size-4 mr-2" />
                    {settings ? "Update Details" : "Save Details"}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
