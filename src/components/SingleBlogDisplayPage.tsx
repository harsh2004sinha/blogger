"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs";
import dayjs from "dayjs";

type Blog = {
  id: string;
  slug: string;
  title: string;
  content: string;
  featuredImage?: string;
  category?: string;
  author?: { id: string; username?: string; email?: string };
  publishedAt?: string;
  status?: boolean;
};

type Props = {
  slug: string;
};

export default function SingleBlogDisplay({ slug }: Props) {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await axios.get(`/api/blogs/${encodeURIComponent(slug)}`);
        console.log(res);
        if (!isMounted) return;
        setBlog(res.data?.data ?? null);
      } catch (err: any) {
        console.error("Failed to load blog", err);
        if (!isMounted) return;
        setError(err?.response?.data?.message || "Failed to fetch blog.");
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const readingTime = useMemo(() => {
    if (!blog?.content) return null;
    
    const text = blog.content.replace(/<[^>]*>/g, " ");
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(words / 200));
    return `${minutes} min read`;
  }, [blog]);

  const isOwner = useMemo(() => {
    if (!isLoaded || !isSignedIn || !user || !blog?.author) return false;
    
    return (
      user.id === blog.author.id ||
      user.primaryEmailAddress?.emailAddress === blog.author.email
    );
  }, [isLoaded, isSignedIn, user, blog]);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/blogs/${blog?.slug}/edit`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this post? This action cannot be undone.")) return;
    if (!blog) return;
    setDeleting(true);
    try {
      await axios.delete(
        `/api/blogs/${encodeURIComponent(blog.slug ?? blog.id)}`
      );
      // on success navigate away
      router.push("/my-blogs");
    } catch (err) {
      console.error(err);
      alert("Failed to delete post.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-blue-500 to-gray-700">
        <div className="max-w-2xl text-center">
          <h2 className="text-2xl font-semibold mb-2">Post not found</h2>
          <p className="text-gray-200 mb-6">
            {error ?? "The requested blog could not be loaded."}
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => router.push("/blogs")}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:cursor-pointer hover:bg-blue-400"
            >
              Back to blogs
            </button>
            {!isSignedIn ? (
              <SignInButton mode="modal">
                <button className="px-4 py-2 rounded border text-white hover:cursor-pointer hover:bg-blue-400">Sign in</button>
              </SignInButton>
            ) : (
              <SignOutButton>
                <button className="px-4 py-2 rounded border text-white hover:cursor-pointer hover:bg-blue-400">Sign out</button>
              </SignOutButton>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-gradient-to-b from-blue-500 to-gray-700 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-900 mb-4">
          <button onClick={() => router.push("/blogs")} className="underline">
            Blogs
          </button>
          <span className="mx-2">/</span>
          <span>{blog.title}</span>
        </div>

        {/* Hero */}
        <header className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm">
          {blog.featuredImage ? (
            <div className="relative">
              <img
                src={blog.featuredImage}
                alt={blog.title}
                className="w-full h-72 object-cover"
              />
              {/* Status pill, bottom-right */}
              <div className="absolute bottom-4 right-4">
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                    blog.status === true
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      blog.status === true
                        ? "bg-green-600"
                        : "bg-yellow-600"
                    }`}
                  />
                  {blog.status ?? true}
                </span>
              </div>
            </div>
          ) : null}

          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-blue-600 font-medium">
                  {blog.category ?? "Uncategorized"}
                </p>
                <h1 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
                  {blog.title}
                </h1>

                <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white">
                        {blog.author?.username ?? "Unknown author"}
                      </div>
                      <div className="text-xs">{blog.author?.email ?? ""}</div>
                    </div>
                  </div>

                  <div>
                    {blog.publishedAt
                      ? dayjs(blog.publishedAt).format("MMM D, YYYY")
                      : "—"}
                  </div>
                  {readingTime && <div>• {readingTime}</div>}
                </div>
              </div>

              {/* Owner controls */}
              <div className="ml-auto flex items-start gap-2">
                {isSignedIn && isOwner ? (
                  <>
                    <button
                      onClick={handleEdit}
                      className="px-3 py-1 rounded border text-sm hover:cursor-pointer hover:bg-blue-500 hover:text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="px-3 py-1 rounded border text-sm text-red-600 hover:cursor-pointer hover:bg-red-500 hover:text-white"
                    >
                      {deleting ? "Deleting..." : "Delete"}
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() =>
                        navigator.share
                          ? navigator.share({
                              title: blog.title,
                              url: window.location.href,
                            })
                          : alert("Use native share or copy URL")
                      }
                      className="px-3 py-1 rounded border text-sm"
                    >
                      Share
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mt-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
          {/* Danger: ensure server-side sanitization of HTML before sending */}
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        </div>

        {/* Related posts + comments */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

          <aside className="space-y-6">

            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm text-sm text-gray-600">
              <h4 className="font-semibold text-gray-700 dark:text-gray-200 ">
                Quick actions
              </h4>
              <div className="mt-3 flex flex-col gap-2">
                <button
                  onClick={async () => {
                    if (!navigator.clipboard) {
                      alert("Clipboard API not supported");
                      return;
                    }

                    try {
                      await navigator.clipboard.writeText(window.location.href);
                      alert("Link copied!");
                    } catch (err) {
                      console.error(err);
                      alert("Failed to copy link");
                    }
                  }}
                  className="px-3 py-2 rounded border text-sm hover:cursor-pointer hover:bg-blue-500 hover:text-white"
                >
                  Copy link
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
