"use client";
import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import type { UnitMedia } from "@/lib/types/types";

function UnitGallery({ images }: { images: UnitMedia[] }) {
  const autoplay = useRef(
    Autoplay({
      delay: 5000,
      stopOnInteraction: false,
    }),
  );

  return (
    <div className="grid gap-3 lg:grid-cols-4 mb-6 items-stretch">
      {/* Main Carousel */}
      <div className="lg:col-span-2">
        <Carousel
          plugins={[autoplay.current]}
          opts={{ loop: true }}
          className="w-full group overflow-hidden rounded-l-xl"
        >
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="aspect-[4/3] relative">
                  <Image
                    src={image.filePath}
                    alt={`Unit Image ${index + 1}`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover rounded-l-2xl"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                  <div className="absolute bottom-4 right-4">
                    <Badge
                      variant="secondary"
                      className="bg-background/80 backdrop-blur-md text-foreground"
                    >
                      {index + 1} / {images.length}
                    </Badge>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="left-4 cursor-pointer opacity-0 group-hover:opacity-100 bg-background/80 backdrop-blur-sm" />
          <CarouselNext className="right-4 cursor-pointer opacity-0 group-hover:opacity-100 bg-background/80 backdrop-blur-sm" />
        </Carousel>
      </div>

      {/* Highlight Images */}
      <div className="hidden lg:grid lg:col-span-2 gap-3 grid-cols-2 grid-rows-2">
        {images.slice(1, 5).map((image, index) => (
          <div
            key={index}
            className={`relative aspect-[4/3] group ${
              index % 2 !== 0 ? "overflow-hidden rounded-r-xl" : ""
            }`}
          >
            <Image
              src={image.filePath}
              alt={`Unit image ${index + 1}`}
              fill
              priority
              sizes="(max-width: 1024px) 0px, 25vw"
              className="object-cover transition-transform duration-200 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default UnitGallery;
