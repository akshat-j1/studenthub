"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PostHackathon() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    college: "",
    date: "",
    location: "",
    mode: "online",
    registration_link: "",
    team_link: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const opportunity = {
        id: crypto.randomUUID(),
        title: formData.title,
        description: formData.description,
        type: "hackathon",
        deadline: formData.date,
        tags: ["user-posted"],
        isRemote: formData.mode === "online",
        isPaid: false,
        isBeginnerFriendly: true,
        company: formData.college,
        location: formData.location,
        applyUrl: formData.registration_link,
        team_link: formData.team_link || null,
      };

      if (!supabase) {
        throw new Error(
          "Supabase is not configured. Please check your environment variables.",
        );
      }

      const { error: supabaseError } = await supabase
        .from("opportunities")
        .insert([opportunity]);

      if (supabaseError) {
        throw supabaseError;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/#hackathons");
      }, 2000);
    } catch (err) {
      console.log("Supabase Insert Error Details:", err);
      const errorObj = err;
      if (errorObj?.message) {
        setError(errorObj.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to post hackathon: " + JSON.stringify(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/#hackathons"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Hackathons
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800/80 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/60 p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Post a Hackathon
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Share a new hackathon opportunity with the community.
            </p>
          </div>

          {success ? (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-8 text-center text-green-700 dark:border-green-800/60 dark:bg-green-950/20 dark:text-green-300">
              <h3 className="text-lg font-semibold mb-2">
                Successfully Posted!
              </h3>
              <p className="text-sm opacity-90">
                Redirecting you back to the hackathons...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/60 dark:bg-red-950/20 dark:text-red-300">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Hackathon Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. HackMIT 2026"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Describe what the hackathon is about..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="college"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    College / Organization
                  </label>
                  <input
                    type="text"
                    id="college"
                    name="college"
                    required
                    value={formData.college}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. MIT"
                  />
                </div>

                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Date (Deadline)
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="mode"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Mode
                  </label>
                  <select
                    id="mode"
                    name="mode"
                    value={formData.mode}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline / In-person</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    required={formData.mode === "offline"}
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder={
                      formData.mode === "online"
                        ? "e.g. Global"
                        : "e.g. Cambridge, MA"
                    }
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="registration_link"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Registration Link
                </label>
                <input
                  type="url"
                  id="registration_link"
                  name="registration_link"
                  required
                  value={formData.registration_link}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="https://"
                />
              </div>

              <div>
                <label
                  htmlFor="team_link"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Team Chat Link (Telegram/WhatsApp/Discord)
                </label>
                <input
                  type="url"
                  id="team_link"
                  name="team_link"
                  value={formData.team_link}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="https://t.me/your-group"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                  {loading ? "Posting..." : "Post Hackathon"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
