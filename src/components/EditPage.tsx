"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Editor } from "@tinymce/tinymce-react";
import { useUser } from "@clerk/nextjs";

type Blog = {
  id: string;
  slug: string;
  title: string;
  content: string;
  category?: string;
  status: boolean;
  featuredImage?: string;
};

const categories = ["Tech", "Travel", "Food", "Lifestyle"];

interface Props {
  params: { slug: string };
}

export default function EditBlogPage({ params }: Props) {
  const router = useRouter();
  const { slug } = params;
  const { user } = useUser(); // optional, remove if not using Clerk

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState(true);
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch blog
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await axios.get(`/api/blogs/${slug}`);
        const blog: Blog = res.data?.data;
        if (!blog || !isMounted) return;

        setTitle(blog.title);
        setContent(blog.content);
        setCategory(blog.category || "");
        setStatus(blog.status);
        setFeaturedImage(blog.featuredImage || null);
      } catch (err) {
        console.error(err);
        alert("Failed to load blog data.");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFeaturedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.put(`/api/blogs/${slug}`, {
        title,
        content,
        category,
        status,
        featuredImage,
      });
      alert("Blog updated successfully!");
      router.push(`/blogs/${slug}`);
    } catch (err) {
      console.error(err);
      alert("Failed to update blog.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-12 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Edit Blog</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left column */}
          <div className="flex-1 flex flex-col gap-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Blog title"
              className="border rounded p-2 w-full dark:bg-gray-700 dark:text-white"
            />

            <Editor
              apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
              value={content}
              init={{
                height: 400,
                menubar: true,
                plugins: "link image code lists",
                toolbar:
                  "undo redo | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | code",
              }}
              onEditorChange={(newValue) => setContent(newValue)}
            />
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4 w-80">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border rounded p-2 w-full dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={status ? "true" : "false"}
              onChange={(e) => setStatus(e.target.value === "true")}
              className="border rounded p-2 w-full dark:bg-gray-700 dark:text-white"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            {/* Image Upload */}
            <div className="flex flex-col gap-2">
              {featuredImage ? (
                <div className="relative rounded-md overflow-hidden border dark:border-gray-700">
                  <img
                    src={featuredImage}
                    alt="featured preview"
                    className="w-full h-40 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFeaturedImage(null)}
                    className="absolute top-2 right-2 bg-white/80 dark:bg-black/60 rounded-full p-1 shadow-sm"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="flex h-40 w-full items-center justify-center rounded-md border-2 border-dashed dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-500 text-center">
                  Upload an image
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
              />
              <button
                type="button"
                onClick={handleUploadClick}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded w-full"
              >
                {featuredImage ? "Change Image" : "Upload Image"}
              </button>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {saving ? "Saving..." : "Update Blog"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
