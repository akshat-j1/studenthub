"use client";

import { useEffect, useState } from "react";

import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentUserProfile } from "@/lib/profile";
import { supabase } from "@/lib/supabase";

function createFormDataFromProfile(profile) {
  return {
    name: profile?.name || "",
    role: profile?.role || "student",
    bio: profile?.bio || "",
    college: profile?.college || "",
    company: profile?.company || "",
    skills: profile?.skills ? profile.skills.join(", ") : "",
  };
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(createFormDataFromProfile(null));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      const { profile: currentProfile } = await getCurrentUserProfile();
      if (!active) return;
      setProfile(currentProfile);
      setFormData(createFormDataFromProfile(currentProfile));
      setLoading(false);
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setFormData(createFormDataFromProfile(profile));
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!user || !supabase) return;

    setSaving(true);
    const skillsArray = formData.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const { error } = await supabase
      .from("profiles")
      .update({
        name: formData.name,
        role: formData.role,
        bio: formData.bio,
        college: formData.college,
        company: formData.company,
        skills: skillsArray,
      })
      .eq("id", user.id);

    if (!error) {
      const updatedProfile = {
        ...profile,
        name: formData.name,
        role: formData.role,
        bio: formData.bio,
        college: formData.college,
        company: formData.company,
        skills: skillsArray,
      };
      setProfile(updatedProfile);
      setIsEditing(false);
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] transition-colors duration-300">
      <Navbar />

      <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 pt-24 pb-12">
        {loading ? (
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            Loading...
          </p>
        ) : !profile ? (
          <div className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white px-8 py-10 text-center shadow-sm dark:border-white/10 dark:bg-[#111318]">
            <p className="text-base font-semibold text-zinc-800 dark:text-zinc-100">
              Profile not found
            </p>
          </div>
        ) : (
          <div className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-[#111318]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-xl font-semibold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                  {(profile.name?.trim()?.[0] || "U").toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {profile.name || "Unnamed User"}
                  </h1>
                  <span className="mt-2 inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:border-indigo-400/30 dark:bg-indigo-500/15 dark:text-indigo-300">
                    {profile.role || "Student"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing((prev) => !prev)}
                className="rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-200 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
              >
                {isEditing ? "Close" : "Edit Profile"}
              </button>
            </div>

            {!isEditing ? (
              <div className="space-y-4">
                <section>
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Bio
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {profile.bio || "No bio provided."}
                  </p>
                </section>

                {profile.college && (
                  <section>
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      College
                    </h2>
                    <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                      {profile.college}
                    </p>
                  </section>
                )}

                {profile.company && (
                  <section>
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Company
                    </h2>
                    <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                      {profile.company}
                    </p>
                  </section>
                )}

                <section>
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Skills
                  </h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Array.isArray(profile.skills) && profile.skills.length > 0 ? (
                      profile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        No skills listed.
                      </span>
                    )}
                  </div>
                </section>
              </div>
            ) : (
              <div className="space-y-4">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Name
                  </span>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Role
                  </span>
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
                  >
                    <option value="student">student</option>
                    <option value="teacher">teacher</option>
                    <option value="employee">employee</option>
                    <option value="employer">employer</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Bio
                  </span>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    rows={4}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    College
                  </span>
                  <input
                    type="text"
                    value={formData.college}
                    onChange={(e) => handleInputChange("college", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Company
                  </span>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Skills (comma separated)
                  </span>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => handleInputChange("skills", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
                  />
                </label>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-400 disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
