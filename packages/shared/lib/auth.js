// lib/auth.js
// Wobl — authentication helpers. `logout` is imported by name in
// Navbar.js — do not rename this export.

import { supabase } from "./supabase";

export async function login(email, password) {
  if (!supabase) return { success: false, error: "Database not ready." };
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return { success: false, error: error.message };
  return { success: true, user: data.user };
}

export async function register(email, password) {
  if (!supabase) return { success: false, error: "Database not ready." };
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { success: false, error: error.message };
  return { success: true, user: data.user };
}

export async function logout() {
  if (!supabase) return { success: false };
  const { error } = await supabase.auth.signOut();
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getCurrentUser() {
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
