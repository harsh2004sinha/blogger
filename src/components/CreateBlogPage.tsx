"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Editor } from "@tinymce/tinymce-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { div } from "motion/react-client";

export default function CreateBlogPage() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [status, setStatus] = useState(true);

  // Ref for hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if user is not logged in
  useEffect(() => {
    if (!isSignedIn) {
      router.push("/sign-in");
    }
  }, [isSignedIn, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFeaturedImage(e.target.files?.[0] ?? null);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!featuredImage) {
      alert("Please select an image!");
      return;
    }

    try {
      await axios.post("/api/blogs", {
        title,
        content,
        featuredImage,
        status,
        userId: user?.id,
      });

      alert("Blog created!");
      router.push("/blogs");
    } catch (err) {
      console.error(err);
      alert("Error creating blog!");
    }
  };

  return (
    <div className="bg-gradient-to-b from-blue-500 to-gray-700">
      <form
        onSubmit={handleSubmit}
        className="mx-auto pt-36 max-w-6xl px-6"
        aria-label="Create blog form"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: main editor (takes 2 columns on large screens) */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-2xl p-6">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter blog title"
                className="mt-2 w-full rounded-lg border px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-900 dark:border-gray-700"
              />

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Content
                </label>
                <div className="mt-2">
                  <Editor
                    apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                    value={content}
                    init={{
                      height: 520,
                      menubar: true,
                      plugins: "link image code lists",
                      toolbar:
                        "undo redo | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | code",
                    }}
                    onEditorChange={(newValue) => setContent(newValue)}
                  />
                </div>
              </div>

              {/* small helper area */}
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div>Autosave enabled</div>
                <div>
                  {/* basic word count (approx) */}
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

          {/* RIGHT: action panel */}
          <aside className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Card: Featured Image + upload */}
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Image
                  </h3>
                  <span className="text-xs text-gray-400">Optional</span>
                </div>

                <div className="mt-4">
                  {/* preview */}
                  {featuredImage ? (
                    <div className="relative rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                      <img
                        src={featuredImage}
                        alt="featured preview"
                        className="w-full h-40 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          // keep your existing state setter if you have a setter e.g. setFeaturedImage
                          // if not, replace with appropriate action
                          if (typeof setFeaturedImage === "function")
                            setFeaturedImage(null);
                        }}
                        className="absolute top-2 right-2 bg-white/80 dark:bg-black/60 rounded-full p-1 shadow-sm"
                        aria-label="Remove image"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-red-600"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6.293 6.293a1 1 0 011.414 0L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10l2.293 2.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center rounded-md border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                      <div className="text-center text-sm text-gray-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="mx-auto mb-2 h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16V8m0 0l5-5m-5 5h12"
                          />
                        </svg>
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
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-transparent bg-gray-100 dark:bg-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-100 hover:brightness-95"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V7.414A2 2 0 0016.414 6L13 2.586A2 2 0 0011.586 2H4z" />
                      </svg>
                      {featuredImage ? "Change Image" : "Upload Image"}
                    </button>

                    {featuredImage && (
                      <button
                        type="button"
                        onClick={() =>
                          typeof setFeaturedImage === "function"
                            ? setFeaturedImage(null)
                            : null
                        }
                        className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 bg-white dark:bg-gray-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Card: Status + Actions */}
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Status
                  </h3>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  {/* Toggle-like select */}
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                      status
                        ? "bg-green-50 text-green-700"
                        : "bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-200"
                    }`}
                    role="status"
                    aria-checked={status}
                  >
                    {status ? (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414L8.414 15 5 11.586a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l9-9a1 1 0 00-1.414-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Active
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 3a1 1 0 00-.894.553l-6 12A1 1 0 004 17h12a1 1 0 00.894-1.447l-6-12A1 1 0 0010 3z" />
                        </svg>
                        Inactive
                      </>
                    )}
                  </div>

                  <select
                    value={status ? "true" : "false"}
                    onChange={(e) => setStatus(e.target.value === "true")}
                    className="ml-auto rounded-md border px-3 py-2 text-sm focus:outline-none"
                    aria-label="Change status"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>

                <div className="mt-5">
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    Create Blog
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}
