"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Editor } from "@tinymce/tinymce-react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";

type Blog = {
  id: string;
  slug: string;
  title: string;
  content: string;
  category?: string;
  status: boolean;
  featuredImage?: string;
};

type Category = {
  id: string;
  name: string;
  displayName: string;
};

export default function EditBlogPage() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug; // handle possible array

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [featuredFile, setFeaturedFile] = useState<File | null>(null);
  const [featuredPreview, setFeaturedPreview] = useState<string | null>(null);
  const [status, setStatus] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryInput, setCategoryInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // categories
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/categories");

        const list = res.data?.data ?? res.data ?? [];
        setCategories(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    })();
  }, []);

  // Fetch blog
  useEffect(() => {
    (async () => {
      // If user must be signed in to fetch, wait for isSignedIn true
      if (!isSignedIn) {
        setLoading(false); // avoid indefinite loading if not signed in
        return;
      }
      if (!slug) {
        console.warn("No slug found in params.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`/api/blogs/${encodeURIComponent(slug)}`);
        const blog: Blog = res.data?.data ?? res.data;
        setTitle(blog.title ?? "");
        setContent(blog.content ?? "");
        setCategoryInput(blog.category ?? "");
        setStatus(Boolean(blog.status));
        setFeaturedPreview(blog.featuredImage ?? null);
      } catch (err) {
        console.error("Failed to load blog data.", err);
        alert("Failed to load blog data.");
      } finally {
        setLoading(false);
      }
    })();
  }, [isSignedIn, slug]);

  // Manage generated object URL for file preview
  useEffect(() => {
    if (!featuredFile) {
      // if removing file, we might want to clear preview — but preserve server image if you prefer
      // setFeaturedPreview(null);
      return;
    }
    const url = URL.createObjectURL(featuredFile);
    setFeaturedPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [featuredFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFeaturedFile(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSuggestionClick = (displayName: string) => {
    setCategoryInput(displayName);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !title.trim() ||
      !content.trim() ||
      !categoryInput.trim() ||
      !user?.id
    ) {
      alert("Please fill all required fields and sign in.");
      return;
    }

    if (!slug) {
      alert("Missing slug — cannot update blog.");
      return;
    }

    setSaving(true);

    try {
      const form = new FormData();
      form.append("title", title);
      form.append("content", content);
      form.append("status", String(status));
      form.append("categoryName", categoryInput);
      form.append("authorId", user.id);
      if (featuredFile) form.append("featuredImage", featuredFile);
      else if (featuredPreview) form.append("featuredImage", featuredPreview);

      await axios.put(`/api/blogs/${encodeURIComponent(slug)}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Blog updated successfully!");
      router.push("/my-blogs");
    } catch (err) {
      console.error("Failed to update blog.", err);
      alert("Failed to update blog.");
    } finally {
      setSaving(false);
    }
  };

  const filtered = Array.isArray(categories)
    ? categoryInput
      ? categories.filter((c) =>
          c.displayName.toLowerCase().includes(categoryInput.toLowerCase())
        )
      : categories
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-500 to-gray-700 pb-12 p-6">
        <div className="mx-auto pt-24 max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-md bg-white/20 animate-pulse" />
              <div>
                <div className="h-5 w-72 rounded bg-white/20 animate-pulse mb-2" />
                <div className="h-4 w-40 rounded bg-white/10 animate-pulse" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-700/70 text-white text-sm">
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                Loading...
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* title skeleton */}
              <div className="bg-white/10 rounded-2xl p-6">
                <div className="h-6 w-48 rounded bg-white/20 animate-pulse mb-4" />
                <div className="h-12 w-full rounded bg-white/10 animate-pulse mb-6" />

                {/* editor skeleton */}
                <div className="h-96 w-full rounded bg-white/10 animate-pulse" />
              </div>
            </div>

            <aside className="lg:col-span-1 space-y-6">
              {/* image skeleton */}
              <div className="bg-white/10 rounded-2xl p-4">
                <div className="h-6 w-24 rounded bg-white/20 animate-pulse mb-3" />
                <div className="h-40 rounded bg-white/10 animate-pulse mb-3" />
                <div className="flex gap-2">
                  <div className="h-10 flex-1 rounded bg-white/10 animate-pulse" />
                  <div className="h-10 w-20 rounded bg-white/10 animate-pulse" />
                </div>
              </div>

              {/* category/status skeleton */}
              <div className="bg-white/10 rounded-2xl p-4">
                <div className="h-6 w-24 rounded bg-white/20 animate-pulse mb-3" />
                <div className="h-10 w-full rounded bg-white/10 animate-pulse mb-3" />
                <div className="flex items-center justify-between">
                  <div className="h-8 w-28 rounded bg-white/10 animate-pulse" />
                  <div className="h-10 w-28 rounded bg-white/10 animate-pulse" />
                </div>
                <div className="mt-4 h-10 w-full rounded bg-white/10 animate-pulse" />
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-gradient-to-b from-blue-500 to-gray-700 min-h-screen pb-12">
      <form
        onSubmit={handleSubmit}
        className="mx-auto pt-36 max-w-6xl px-6"
        aria-label="Edit blog form"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT (Editor) */}
          <div className="lg:col-span-2">
            <div className="bg-white border shadow-sm rounded-2xl p-6">
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter blog title"
                className="mt-2 w-full rounded-lg border px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:text-black"
              />

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700">
                  Content
                </label>
                <div className="mt-2">
                  <Editor
                    apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                    value={content}
                    init={{
                      height: 520,
                      menubar: true,
                      plugins: "link image code lists table",
                      toolbar:
                        "undo redo | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | code",
                    }}
                    onEditorChange={(newValue) => setContent(newValue)}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <div>Autosave enabled</div>
                <div>
                  {typeof content === "string"
                    ? `${
                        content
                          .replace(/<[^>]*>/g, "")
                          .split(/\s+/)
                          .filter(Boolean).length
                      } words`
                    : ""}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT (Actions) */}
          <aside className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Image card */}
              <div className="bg-white border shadow-sm rounded-2xl p-4 dark:text-black">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Image</h3>
                  <span className="text-xs text-gray-400">Optional</span>
                </div>

                <div className="mt-4">
                  {featuredPreview ? (
                    <div className="relative rounded-md overflow-hidden border">
                      <img
                        src={featuredPreview}
                        alt="featured preview"
                        className="w-full h-40 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFeaturedFile(null);
                          setFeaturedPreview(null);
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
                        aria-label="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div
                      className="flex h-40 w-full items-center justify-center rounded-md border-2 border-dashed bg-gray-50 cursor-pointer"
                      onClick={handleUploadClick}
                    >
                      <div className="text-center text-sm text-gray-500">
                        <div>Upload an image</div>
                        <div className="text-xs text-gray-400 mt-1">
                          PNG, JPG — recommended 1200×600
                        </div>
                      </div>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*"
                  />

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={handleUploadClick}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium"
                    >
                      {featuredFile || featuredPreview
                        ? "Change Image"
                        : "Upload Image"}
                    </button>
                    {(featuredFile || featuredPreview) && (
                      <button
                        type="button"
                        onClick={() => {
                          setFeaturedFile(null);
                          setFeaturedPreview(null);
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                        className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Category & Status */}
              <div className="bg-white border shadow-sm rounded-2xl p-4 relative dark:text-black">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Category</h3>
                </div>

                <div className="mt-3 relative">
                  <input
                    value={categoryInput}
                    onChange={(e) => {
                      setCategoryInput(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowSuggestions(false), 150)
                    }
                    placeholder="Type a category (e.g. Web Dev)"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  />

                  {showSuggestions && filtered.length > 0 && (
                    <ul className="absolute z-20 mt-14 w-full max-h-40 overflow-auto bg-white border rounded-md shadow-sm text-sm">
                      {filtered.map((c) => (
                        <li
                          key={c.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onMouseDown={() =>
                            handleSuggestionClick(c.displayName)
                          }
                        >
                          {c.displayName}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                          status
                            ? "bg-green-50 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {status ? "Active" : "Inactive"}
                      </div>

                      <select
                        value={status ? "true" : "false"}
                        onChange={(e) => setStatus(e.target.value === "true")}
                        className="ml-auto rounded-md border px-3 py-2 text-sm"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>

                    <div className="mt-4">
                      <button
                        type="submit"
                        className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                      >
                        {saving ? "Updating..." : "Update Blog"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}
