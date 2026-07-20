"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { updatePatientProfile } from "./actions";
import { uploadPatientAvatar } from "./upload-actions";
import { toast } from "sonner";
import { Camera, Loader2, User, Ruler, Scale, Mars, Clock } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";

interface PatientProfileFormProps {
  userId: string;
  image?: string | null;
  defaultValues: {
    name: string;
    height: string;
    weight: string;
    gender: string;
    /** IANA zone; empty string = auto-detect (DPT-004). */
    timezone: string;
  };
}

export function PatientProfileForm({ userId, image, defaultValues }: PatientProfileFormProps) {
  const { dictionary } = useI18n();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(image || "");
  const [form, setForm] = useState(defaultValues);
  const fileRef = useRef<HTMLInputElement>(null);

  // Full IANA zone list from the runtime — zero dependencies.
  const timezones = useMemo(() => Intl.supportedValuesOf("timeZone"), []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const data = new FormData();
    data.append("avatar", file);

    const result = await uploadPatientAvatar(data);
    setIsUploading(false);

    if (result.success && result.imageUrl) {
      setPreview(result.imageUrl);
      toast.success(dictionary.patientProfile.photoUpdated);
    } else {
      toast.error(result.error || dictionary.patientProfile.photoError);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updatePatientProfile({
        userId,
        name: form.name,
        height: Number(form.height),
        weight: Number(form.weight),
        gender: form.gender,
        timezone: form.timezone || null,
      });

      if (result.success) {
        toast.success(dictionary.patientProfile.updated);
      } else {
        toast.error(result.error || dictionary.patientProfile.updateError);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-[#3a3a3a] bg-[#2c2c2c]">
            {preview ? (
              <Image
                src={preview}
                alt={dictionary.patientProfile.photoTitle}
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            ) : (
              <Camera className="h-8 w-8 text-[#55eb55]" />
            )}
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={isUploading}
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#55eb55] text-[#0a0a0a] shadow-md transition-colors hover:bg-[#45db45] disabled:opacity-60"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            name="avatar"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        <div>
          <p className="text-sm font-medium text-white">
            {dictionary.patientProfile.photoTitle}
          </p>
          <p className="text-xs text-white/60">
            {dictionary.patientProfile.photoHint}
          </p>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-white/90">
          {dictionary.patientProfile.fullName}
        </label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#55eb55]" />
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="block w-full rounded-xl border border-[#3a3a3a] bg-[#2c2c2c] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:border-[#55eb55] focus:outline-none focus:ring-1 focus:ring-[#55eb55]"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-white/90">
            {dictionary.patientProfile.height}
          </label>
          <div className="relative">
            <Ruler className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#55eb55]" />
            <input
              type="number"
              name="height"
              value={form.height}
              onChange={handleChange}
              required
              min={50}
              max={300}
              className="block w-full rounded-xl border border-[#3a3a3a] bg-[#2c2c2c] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:border-[#55eb55] focus:outline-none focus:ring-1 focus:ring-[#55eb55]"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-white/90">
            {dictionary.patientProfile.weight}
          </label>
          <div className="relative">
            <Scale className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#55eb55]" />
            <input
              type="number"
              name="weight"
              value={form.weight}
              onChange={handleChange}
              required
              min={20}
              max={500}
              step="0.1"
              className="block w-full rounded-xl border border-[#3a3a3a] bg-[#2c2c2c] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:border-[#55eb55] focus:outline-none focus:ring-1 focus:ring-[#55eb55]"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-white/90">
          {dictionary.patientProfile.gender}
        </label>
        <div className="relative">
          <Mars className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#55eb55]" />
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            required
            className="block w-full appearance-none rounded-xl border border-[#3a3a3a] bg-[#2c2c2c] py-2.5 pl-10 pr-4 text-sm text-white focus:border-[#55eb55] focus:outline-none focus:ring-1 focus:ring-[#55eb55]"
          >
            <option value="male">{dictionary.gender.male}</option>
            <option value="female">{dictionary.gender.female}</option>
            <option value="non-binary">{dictionary.gender.nonBinary}</option>
            <option value="prefer-not-to-say">{dictionary.gender.preferNotToSay}</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-white/90">
          {dictionary.patientProfile.timezoneLabel}
        </label>
        <div className="relative">
          <Clock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#55eb55]" />
          <select
            name="timezone"
            value={form.timezone}
            onChange={handleChange}
            className="block w-full appearance-none rounded-xl border border-[#3a3a3a] bg-[#2c2c2c] py-2.5 pl-10 pr-4 text-sm text-white focus:border-[#55eb55] focus:outline-none focus:ring-1 focus:ring-[#55eb55]"
          >
            <option value="">{dictionary.patientProfile.timezoneAuto}</option>
            {timezones.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-1.5 text-xs text-white/50">
          {dictionary.patientProfile.timezoneHint}
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="relative w-full overflow-hidden rounded-full bg-gradient-to-r from-[#22d3ee] to-[#55eb55] px-6 py-3 text-sm font-bold text-[#0a0a0a] shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all hover:shadow-[0_0_30px_rgba(85,235,85,0.5)] hover:brightness-110 disabled:opacity-60"
      >
        {isPending ? dictionary.patientProfile.saving : dictionary.patientProfile.saveAndViewProgress}
      </button>
    </form>
  );
}
