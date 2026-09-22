"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkCredentials, endSession, requireAdmin, startSession } from "@/lib/auth";
import { deleteLead, readLeads, setLeadStatus } from "@/lib/leads";
import { clearFailures, clientIp, lockRemaining, recordFailure } from "@/lib/loginLimit";
import { saveData, saveMode } from "@/lib/store";

// Every public page reads the saved data, so all of them are rebuilt.
function refreshSite() {
  revalidatePath("/[lang]", "layout");
  revalidatePath("/sitemap.xml");
}

const lockedMessage = (ms) =>
  `Çox sayda yanlış cəhd. ${Math.ceil(ms / 60000)} dəqiqə sonra yenidən cəhd edin.`;

export async function login(previousState, formData) {
  const ip = clientIp(await headers());
  // While locked, the password isn't even checked, so guessing gains nothing.
  const locked = lockRemaining(ip);
  if (locked) return { error: lockedMessage(locked) };

  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!checkCredentials(username, password)) {
    recordFailure(ip);
    // Slows down password guessing.
    await new Promise((resolve) => setTimeout(resolve, 800));
    const nowLocked = lockRemaining(ip);
    return { error: nowLocked ? lockedMessage(nowLocked) : "İstifadəçi adı və ya şifrə yanlışdır." };
  }

  clearFailures(ip);
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

export async function saveSiteData(data, translations, expectedRevision) {
  await requireAdmin();
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { error: "Məlumatlar düzgün deyil." };
  }
  try {
    const store = await saveData(data, translations, expectedRevision);
    refreshSite();
    return { savedAt: store.savedAt, revision: store.revision };
  } catch (error) {
    return { error: error.code ? "Yadda saxlanmadı. Saxlama qovluğunu və faylları yoxlayın." : error.message };
  }
}

export async function setSiteMode(mode, expectedRevision) {
  await requireAdmin();
  try {
    const store = await saveMode(mode, expectedRevision);
    refreshSite();
    return { mode: store.mode, revision: store.revision };
  } catch (error) {
    return { error: error.code ? "Rejim dəyişmədi. Saxlama qovluğunu və faylları yoxlayın." : error.message };
  }
}

// Leads ("Müraciətlər"): changes apply immediately, without the panel's save button.
export async function fetchLeads() {
  await requireAdmin();
  return readLeads();
}

export async function markLead(id, status) {
  await requireAdmin();
  return setLeadStatus(String(id), status);
}

export async function removeLead(id) {
  await requireAdmin();
  return deleteLead(String(id));
}
