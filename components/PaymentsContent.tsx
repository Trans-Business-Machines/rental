"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Upload,
  Loader2,
  X,
  Image as ImageIcon,
  CreditCard,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  uploadPaymentImage,
  deletePaymentImageFromStorage,
} from "@/lib/services/clientMediaService";
import {
  getPaymentImageSettings,
  upsertPaymentImageSettings,
  deletePaymentImageSettings,
} from "@/lib/actions/app-settings";
import { toast } from "sonner";
import type { Role } from "@/lib/types/types";

interface PaymentsContentProps {
  userRole: Role;
}

interface PaymentSettings {
  id: string;
  imageType: string;
  imageName: string;
  originalName: string;
  imageUrl: string;
  imageSize: number;
  mimeType: string;
}

export function PaymentsContent({ userRole }: PaymentsContentProps) {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const isSuperAdmin = userRole === "superAdmin";

  // Fetch current payment image settings on mount
  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getPaymentImageSettings();
      setSettings(data);
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

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/avif",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Invalid file type. Only JPEG, PNG, WebP, and AVIF are allowed.",
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Maximum is 10MB.");
      return;
    }

    setPreviewFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle upload
  const handleUpload = async () => {
    if (!previewFile) return;

    setIsUploading(true);
    try {
      // Step 1: Upload to Supabase
      const uploadResult = await uploadPaymentImage(
        previewFile,
        settings?.imageName,
      );

      if (!uploadResult.success) {
        toast.error(uploadResult.error || "Failed to upload image");
        return;
      }

      // Step 2: Save to database
      await upsertPaymentImageSettings({
        imageName: uploadResult.imageName!,
        originalName: uploadResult.originalName!,
        imageUrl: uploadResult.imageUrl!,
        imageSize: uploadResult.imageSize!,
        mimeType: uploadResult.mimeType!,
      });

      // Step 3: Update local state
      setSettings({
        id: settings?.id || "",
        imageType: "payment_info",
        imageName: uploadResult.imageName!,
        originalName: uploadResult.originalName!,
        imageUrl: `${uploadResult.imageUrl}?v=${Date.now()}`,
        imageSize: uploadResult.imageSize!,
        mimeType: uploadResult.mimeType!,
      });

      setPreviewFile(null);
      setPreviewUrl(null);
      toast.success("Payment image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!settings) return;

    setIsDeleting(true);
    try {
      // Step 1: Delete from database and get filename
      const result = await deletePaymentImageSettings();

      if (!result.success) {
        toast.error("Failed to delete image settings");
        return;
      }

      // Step 2: Delete from Supabase storage
      if (result.imageName) {
        await deletePaymentImageFromStorage(result.imageName);
      }

      // Step 3: Update local state
      setSettings(null);
      toast.success("Payment image deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete image");
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancel preview
  const handleCancelPreview = () => {
    setPreviewFile(null);
    setPreviewUrl(null);
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
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-foreground">
          Payment Information
        </h1>
        <p className="text-muted-foreground">
          {isSuperAdmin
            ? "Manage the payment details image displayed to agents and admins."
            : "View payment details for processing guest payments."}
        </p>
      </header>

      <div
        className={cn(
          "grid gap-6",
          isSuperAdmin ? "lg:grid-cols-2" : "max-w-2xl",
        )}
      >
        {/* Current Payment Image */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-5 text-primary" />
              {isSuperAdmin ? "Current Payment Details" : "Payment Details"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {settings?.imageUrl ? (
              <div className="space-y-4">
                <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                  <img
                    src={`${settings.imageUrl}?v=${Date.now()}`}
                    alt="Payment Information"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium">File:</span>{" "}
                    {settings.originalName}
                  </p>
                  <p>
                    <span className="font-medium">Size:</span>{" "}
                    {(settings.imageSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                {isSuperAdmin && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchSettings}
                      disabled={isLoading}
                    >
                      <RefreshCw className="size-4 mr-2" />
                      Refresh
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="size-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="size-4 mr-2" />
                      )}
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video rounded-lg border border-dashed bg-muted/50 flex flex-col items-center justify-center gap-2">
                <ImageIcon className="size-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No payment image uploaded
                </p>
                {!isSuperAdmin && (
                  <p className="text-xs text-muted-foreground">
                    Please contact a super admin to upload payment details.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Section - SuperAdmin Only */}
        {isSuperAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="size-5 text-primary" />
                Upload New Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Preview Section */}
              {previewUrl ? (
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Preview</Label>
                  <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                      onClick={handleCancelPreview}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium truncate max-w-[200px]">
                        {previewFile?.name}
                      </p>
                      <p>
                        {previewFile &&
                          `${(previewFile.size / 1024 / 1024).toFixed(2)} MB`}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleCancelPreview}
                        disabled={isUploading}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleUpload} disabled={isUploading}>
                        {isUploading ? (
                          <>
                            <Loader2 className="size-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="size-4 mr-2" />
                            Upload
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-primary/50",
                    "border-muted-foreground/25",
                  )}
                  onClick={() =>
                    document.getElementById("payment-image-input")?.click()
                  }
                >
                  <Upload className="size-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    Click to upload payment details image
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPEG, PNG, WebP, or AVIF (max 10MB)
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    This image will be visible to all agents and admins.
                  </p>
                  <input
                    id="payment-image-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>
              )}

              {/* Instructions */}
              <div className="p-4 rounded-lg bg-muted/50 border">
                <h4 className="text-sm font-medium mb-2">
                  Recommended Content
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li> Mpesa Paybill or Till Number</li>
                  <li> Bank Account Details</li>
                  <li> QR Code for mobile payments</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
