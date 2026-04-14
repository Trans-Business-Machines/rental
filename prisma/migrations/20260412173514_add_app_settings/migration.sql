-- CreateTable
CREATE TABLE "public"."app_settings" (
    "id" TEXT NOT NULL,
    "imageType" TEXT NOT NULL,
    "imageName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_settings_imageType_key" ON "public"."app_settings"("imageType");

-- CreateIndex
CREATE UNIQUE INDEX "app_settings_imageName_key" ON "public"."app_settings"("imageName");
