"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

function UnitGallery({ images }: { images: string[] }) {
  return (
    <div className="grid gap-3 lg:grid-cols-4 mb-6">
      {/* Main Carousel */}
      <div className="lg:col-span-2">
        <Carousel
          opts={{ loop: true }}
          className="w-full group overflow-hidden rounded-l-xl"
        >
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="aspect-[4/3] relative">
                  <Image
                    src={image}
                    alt={`Unit Image ${index + 1}`}
                    fill
                    className="object-cover overflow-hidden rounded-l-2xl"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                  {/* Image counter */}
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

          <CarouselPrevious className="left-4  cursor-pointer opacity-0 group-hover:opacity-100 bg-background/80 backdrop-blur-sm" />
          <CarouselNext className="right-4 cursor-pointer opacity-0 group-hover:opacity-100 bg-background/80 backdrop-blur-sm" />
        </Carousel>
      </div>

      {/* Images highlight */}
      <div className="hidden lg:grid gap-3 grid-cols-2 grid-rows-2 lg:col-span-2">
        {images.slice(0, 4).map((image, index) => (
          <div
            key={index}
            className={`w-full relative group ${index % 2 !== 0 && "overflow-hidden rounded-r-xl"} `}
          >
            <Image
              src={image}
              alt={`Property image ${index + 1}`}
              fill
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
