"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import {
  updateProfessionalProfile,
  UpdateProfessionalProfileData,
} from "./actions";
import { uploadProfessionalAvatar } from "./upload-actions";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";

interface ProfessionalProfileFormProps {
  userId: string;
  image?: string | null;
  defaultValues: {
    name: string;
    title: string;
    bio: string;
    location: string;
    modality: "ONLINE" | "IN_PERSON" | "BOTH";
    specialty: "NUTRITION" | "TRAINING" | "BOTH";
    price: string;
    licenseNumber: string;
  };
}

export function ProfessionalProfileForm({
  userId,
  image,
  defaultValues,
}: ProfessionalProfileFormProps) {
  const { dictionary } = useI18n();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(image || "");
  const [form, setForm] = useState(defaultValues);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const data = new FormData();
    data.append("userId", userId);
    data.append("avatar", file);

    const result = await uploadProfessionalAvatar(data);
    setIsUploading(false);

    if (result.success && result.imageUrl) {
      setPreview(result.imageUrl);
      toast.success(dictionary.professionalProfile.photoUpdated);
    } else {
      toast.error(result.error || dictionary.professionalProfile.photoError);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const payload: UpdateProfessionalProfileData = {
        userId,
        name: form.name,
        title: form.title || undefined,
        bio: form.bio || undefined,
        location: form.location || undefined,
        modality: form.modality,
        specialty: form.specialty,
        price: form.price ? Number(form.price) : undefined,
        licenseNumber: form.licenseNumber || undefined,
      };

      const result = await updateProfessionalProfile(payload);

      if (result.success) {
        toast.success(dictionary.professionalProfile.updated);
      } else {
        toast.error(result.error || dictionary.professionalProfile.updateError);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-indigo-100 dark:bg-indigo-950">
            {preview ? (
              <Image
                src={preview}
                alt={dictionary.professionalProfile.photoTitle}
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            ) : (
              <Camera className="h-8 w-8 text-indigo-600" />
            )}
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={isUploading}
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
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
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {dictionary.professionalProfile.photoTitle}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {dictionary.professionalProfile.photoHint}
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {dictionary.professionalProfile.fullName}
        </label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {dictionary.professionalProfile.professionalTitle}
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder={dictionary.professionalProfile.titlePlaceholder}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {dictionary.professionalProfile.licenseNumber}
          </label>
          <input
            type="text"
            name="licenseNumber"
            value={form.licenseNumber}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {dictionary.professionalProfile.specialty}
          </label>
          <select
            name="specialty"
            value={form.specialty}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="NUTRITION">{dictionary.specialties.nutrition}</option>
            <option value="TRAINING">{dictionary.specialties.training}</option>
            <option value="BOTH">{dictionary.specialties.both}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {dictionary.professionalProfile.modality}
          </label>
          <select
            name="modality"
            value={form.modality}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="ONLINE">{dictionary.modalities.online}</option>
            <option value="IN_PERSON">{dictionary.modalities.inPerson}</option>
            <option value="BOTH">{dictionary.modalities.both}</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {dictionary.professionalProfile.location}
          </label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder={dictionary.professionalProfile.locationPlaceholder}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {dictionary.professionalProfile.price}
          </label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            min={0}
            step="0.01"
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {dictionary.professionalProfile.bio}
        </label>
        <textarea
          name="bio"
          value={form.bio}
          onChange={handleChange}
          rows={4}
          placeholder={dictionary.professionalProfile.bioPlaceholder}
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
      >
        {isPending ? dictionary.professionalProfile.saving : dictionary.professionalProfile.save}
      </button>
    </form>
  );
}
