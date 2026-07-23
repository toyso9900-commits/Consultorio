import Image from "next/image";
import { Camera } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type ProgressPhoto = {
  id: string;
  url: string;
  createdAt: Date;
};

type PatientProgressGalleryProps = {
  photos: ProgressPhoto[];
  locale: string;
  dictionary: Dictionary["professionalClients"];
};

function formatPhotoDate(date: Date, locale: string): string {
  if (locale === "en") {
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
  }

  const months = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

export function PatientProgressGallery({
  photos,
  locale,
  dictionary,
}: PatientProgressGalleryProps) {
  const slots = Array.from({ length: 6 }, (_, index) => photos[index] ?? null);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-card-foreground">
        {dictionary.progressGalleryTitle}
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {slots.map((photo, index) => (
          <div
            key={photo?.id ?? `progress-placeholder-${index}`}
            className="group relative overflow-hidden rounded-xl border border-border bg-muted"
          >
            <div className="relative aspect-[4/5]">
              {photo ? (
                <>
                  <Image
                    src={photo.url}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    {dictionary.photoTag}
                  </span>
                  <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">
                    {formatPhotoDate(photo.createdAt, locale)}
                  </span>
                </>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Camera className="h-8 w-8" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
