import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import axios from 'axios';
import { createBrowserClient } from '@supabase/ssr';
import { loadStripe } from '@stripe/stripe-js';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
export const api = axios.create({ baseURL });

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function getStripe() {
  return await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string);
}

export const getAbsoluteUrl = (path: string) => {
  return `${process.env.NEXT_PUBLIC_BASE_URL}${path}`;
};

export const isNewDay = (lastUpdate: Date) => {
  return lastUpdate.getDate() < new Date().getDate();
};
