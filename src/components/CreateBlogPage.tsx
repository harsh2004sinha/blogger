"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Editor } from "@tinymce/tinymce-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
  displayName: string;
};

export default function CreateBlogPage() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryInput, setCategoryInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/sign-in");
    }
  }, [isSignedIn, router]);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/categories");
        setCategories(res.data || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!featuredImage) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(featuredImage);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [featuredImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFeaturedImage(file);
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

    if (!title.trim()) {
      alert("Please enter a title.");
      return;
    }
    if (!content.trim()) {
      alert("Please add some content.");
      return;
    }
    if (!categoryInput.trim()) {
      alert("Please enter a category name.");
      return;
    }
    if (!user?.id) {
      alert("User not found. Please sign in again.");
      return;
    }

    setLoading(true);

    try {
      const form = new FormData();
      form.append("title", title);
      form.append("content", content);
      form.append("status", String(status));
      form.append("authorId", user.id);
      
      form.append("categoryName", categoryInput.trim());
      if (featuredImage) form.append("featuredImage", featuredImage);

      await axios.post("/api/blogs", form);

      alert("Blog created!");
      router.push("/blogs");
    } catch (err) {
      console.error(err);
      alert("Error creating blog!");
    } finally {
      setLoading(false);
    }
  };

  const filtered = categoryInput
    ? categories.filter((c) =>
        c.displayName.toLowerCase().includes(categoryInput.toLowerCase())
      )
    : categories;

  return (
    <div className="bg-gradient-to-b from-blue-500 to-gray-700 min-h-screen pb-12">
      <form onSubmit={handleSubmit} className="mx-auto pt-36 max-w-6xl px-6" aria-label="Create blog form">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT (editor) */}
          <div className="lg:col-span-2">
            <div className="bg-white border shadow-sm rounded-2xl p-6">
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter blog title"
                className="mt-2 w-full rounded-lg border px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <div className="mt-2">
                  <Editor
                    apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                    value={content}
                    init={{
                      height: 520,
                      menubar: true,
                      plugins: "link image code lists table paste",
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

          {/* RIGHT (actions) */}
          <aside className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Image card */}
              <div className="bg-white border shadow-sm rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Image</h3>
                  <span className="text-xs text-gray-400">Optional</span>
                </div>

                <div className="mt-4">
                  {previewUrl ? (
                    <div className="relative rounded-md overflow-hidden border">
                      <img src={previewUrl} alt="featured preview" className="w-full h-40 object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setFeaturedImage(null);
                          setPreviewUrl(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
                        aria-label="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center rounded-md border-2 border-dashed bg-gray-50">
                      <div className="text-center text-sm text-gray-500">
                        <div>Upload an image</div>
                        <div className="text-xs text-gray-400 mt-1">PNG, JPG — recommended 1200×600</div>
                      </div>
                    </div>
                  )}

                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />

                  <div className="mt-4 flex gap-2">
                    <button type="button" onClick={handleUploadClick} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium">
                      {featuredImage ? "Change Image" : "Upload Image"}
                    </button>
                    {featuredImage && (
                      <button type="button" onClick={() => { setFeaturedImage(null); setPreviewUrl(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm">
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Category & status */}
              <div className="bg-white border shadow-sm rounded-2xl p-4 relative">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Category</h3>
                </div>

                <div className="mt-3">
                  <input
                    value={categoryInput}
                    onChange={(e) => { setCategoryInput(e.target.value); setShowSuggestions(true); }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    placeholder="Type a category (e.g. Web Dev)"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  />

                  {showSuggestions && filtered.length > 0 && (
                    <ul className="absolute z-20 mt-14 w-full max-h-40 overflow-auto bg-white border rounded-md shadow-sm text-sm">
                      {filtered.map((c) => (
                        <li key={c.id} className="px-3 py-2 hover:bg-gray-100 cursor-pointer" onMouseDown={() => handleSuggestionClick(c.displayName)}>
                          {c.displayName}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-4">
                    <div className="flex items-center gap-3">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${status ? "bg-green-50 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {status ? "Active" : "Inactive"}
                      </div>

                      <select value={status ? "true" : "false"} onChange={(e) => setStatus(e.target.value === "true")} className="ml-auto rounded-md border px-3 py-2 text-sm">
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>

                    <div className="mt-4">
                      <button type="submit" className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
                        {loading ? "Creating..." : "Create Blog"}
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
