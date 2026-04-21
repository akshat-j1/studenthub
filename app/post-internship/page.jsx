"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentUserProfile } from "@/lib/profile";
import { supabase } from "@/lib/supabase";

export default function PostInternshipPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [roleLoading, setRoleLoading] = useState(true);
  const [canPost, setCanPost] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    company: "",
    deadline: "",
    location: "",
    mode: "remote",
    apply_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let active = true;

    const checkAccess = async () => {
      if (!user) {
        if (!active) return;
        setCanPost(false);
        setRoleLoading(false);
        return;
      }

      const { profile } = await getCurrentUserProfile();
      if (!active) return;
      const role = profile?.role?.toLowerCase();
      setCanPost(role === "employer" || role === "teacher");
      setRoleLoading(false);
    };

    setRoleLoading(true);
    checkAccess();

    return () => {
      active = false;
    };
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!supabase) {
        throw new Error(
          "Supabase is not configured. Please check your environment variables.",
        );
      }

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        setError("You must be logged in");
        return;
      }

      const { error: insertError } = await supabase.from("opportunities").insert([
        {
          id: crypto.randomUUID(),
          title: formData.title,
          description: formData.description,
          type: "internship",
          deadline: formData.deadline,
          tags: ["user-posted"],
          isRemote: formData.mode === "remote",
          isPaid: true,
          isBeginnerFriendly: true,
          company: formData.company,
          location: formData.location,
          applyUrl: formData.apply_url,
          user_id: currentUser.id,
        },
      ]);

      if (insertError) {
        throw insertError;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/internships");
      }, 1500);
    } catch (err) {
      const errorObj = err;
      if (errorObj?.message) {
        setError(errorObj.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to post internship.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 transition-colors duration-300 dark:bg-[#09090b]">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/internships"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Internships
          </Link>
        </div>

        {roleLoading ? (
          <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-8 text-center text-sm font-medium text-zinc-600 dark:border-white/10 dark:bg-[#111318] dark:text-zinc-300">
            Loading...
          </div>
        ) : !canPost ? (
          <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-8 text-center text-sm font-medium text-zinc-700 dark:border-white/10 dark:bg-[#111318] dark:text-zinc-200">
            Only employers and teachers can post internships
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111318]">
            <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-white">
              Post Internship
            </h1>
            <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
              Share an internship opportunity with students.
            </p>

            {success ? (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-6 text-center text-sm text-green-700 dark:border-green-800/60 dark:bg-green-950/20 dark:text-green-300">
                Internship posted successfully.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/60 dark:bg-red-950/20 dark:text-red-300">
                    {error}
                  </div>
                )}

                <input
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Internship title"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-[#0f1115] dark:text-white"
                />
                <textarea
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Description"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-[#0f1115] dark:text-white"
                />
                <input
                  name="company"
                  required
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Company"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-[#0f1115] dark:text-white"
                />
                <input
                  name="deadline"
                  type="date"
                  required
                  value={formData.deadline}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-[#0f1115] dark:text-white"
                />
                <select
                  name="mode"
                  value={formData.mode}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-[#0f1115] dark:text-white"
                >
                  <option value="remote">Remote</option>
                  <option value="onsite">Onsite</option>
                </select>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Location"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-[#0f1115] dark:text-white"
                />
                <input
                  name="apply_url"
                  type="url"
                  required
                  value={formData.apply_url}
                  onChange={handleChange}
                  placeholder="Application URL"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-[#0f1115] dark:text-white"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-indigo-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-400 disabled:opacity-60"
                >
                  {loading ? "Posting..." : "Post Internship"}
                </button>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
