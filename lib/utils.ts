import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fmtT = (s: number) => {
  if (isNaN(s) || !isFinite(s)) return "00:00";
  return `${Math.floor(s / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(s % 60)
    .toString()
    .padStart(2, "0")}`;
};

export const toArabicNumeral = (en: string | number) =>
  ("" + en).replace(/[0-9]/g, (t) =>
    String.fromCharCode(t.charCodeAt(0) + 1584)
  );

export const extractVideoId = (url: string) => {
  if (!url) return null;
  const m = url.match(
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  );
  return m && m[2].length === 11 ? m[2] : null;
};

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
};

export const getPredikat = (g: string) => {
  if (g === "A") return "Mumtaz";
  if (g === "B+") return "Jayyid Jiddan";
  if (g === "B") return "Jayyid";
  if (g === "B-") return "Maqbul";
  return "Lulus";
};
