// components/SingleBlogDisplay.tsx
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
  excerpt?: string;
  featuredImage?: string;
  category?: string;
  tags?: string[];
  author?: { id: string; name?: string; avatar?: string; email?: string };
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
    router.push(`/dashboard/edit/${blog?.id || blog?.slug}`);
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
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-2xl text-center">
          <h2 className="text-2xl font-semibold mb-2">Post not found</h2>
          <p className="text-gray-600 mb-6">
            {error ?? "The requested blog could not be loaded."}
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => router.push("/blogs")}
              className="px-4 py-2 rounded bg-blue-600 text-white"
            >
              Back to blogs
            </button>
            {!isSignedIn ? (
              <SignInButton mode="modal">
                <button className="px-4 py-2 rounded border">Sign in</button>
              </SignInButton>
            ) : (
              <SignOutButton>
                <button className="px-4 py-2 rounded border">Sign out</button>
              </SignOutButton>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-gradient-to-b from-white to-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4">
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
                    <img
                      src={blog.author?.avatar || `/avatar-placeholder.png`}
                      alt={blog.author?.name || "Author"}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white">
                        {blog.author?.name ?? "Unknown author"}
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

                {/* tags */}
                {blog.tags?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {blog.tags.map((t) => (
                      <span
                        key={t}
                        className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* Owner controls */}
              <div className="ml-auto flex items-start gap-2">
                {isSignedIn && isOwner ? (
                  <>
                    <button
                      onClick={handleEdit}
                      className="px-3 py-1 rounded border text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="px-3 py-1 rounded border text-sm text-red-600"
                    >
                      {deleting ? "Deleting..." : "Delete"}
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    {!isSignedIn ? (
                      <SignInButton mode="modal">
                        <button className="px-3 py-1 rounded bg-indigo-600 text-white text-sm">
                          Sign in to edit
                        </button>
                      </SignInButton>
                    ) : null}
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
          <div className="lg:col-span-2">
            {/* Comments placeholder */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Comments</h3>
              <p className="text-sm text-gray-500">
                Comments integration placeholder (Disqus, Remark42, or your own
                comments API).
              </p>

              {/* small comment form for signed-in users */}
              {isSignedIn ? (
                <form
                  className="mt-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert("Comment posted (dummy)");
                  }}
                >
                  <textarea
                    placeholder="Write a comment..."
                    className="w-full rounded border px-3 py-2 mb-2"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button className="px-4 py-2 rounded bg-blue-600 text-white">
                      Post comment
                    </button>
                    <button
                      type="button"
                      onClick={() => alert("Reply flow (dummy)")}
                      className="px-4 py-2 rounded border"
                    >
                      Reply
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    Sign in to post a comment.
                  </p>
                  <div className="mt-2">
                    <SignInButton mode="modal">
                      <button className="px-4 py-2 rounded bg-indigo-600 text-white">
                        Sign in
                      </button>
                    </SignInButton>
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm">
              <h4 className="text-sm font-semibold">Related posts</h4>
              <ul className="mt-3 space-y-3 text-sm text-gray-700 dark:text-gray-200">
                {/* Replace with actual related posts */}
                <li className="flex items-center gap-3">
                  <img
                    src="/placeholder.jpg"
                    alt="thumb"
                    className="h-12 w-12 object-cover rounded"
                  />
                  <div>
                    <div className="font-medium">Related post title</div>
                    <div className="text-xs text-gray-500">
                      Category • 2 min
                    </div>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <img
                    src="/placeholder.jpg"
                    alt="thumb"
                    className="h-12 w-12 object-cover rounded"
                  />
                  <div>
                    <div className="font-medium">Another post</div>
                    <div className="text-xs text-gray-500">
                      Category • 4 min
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm text-sm text-gray-600">
              <h4 className="font-semibold text-gray-700 dark:text-gray-200">
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
                  className="px-3 py-2 rounded border text-sm"
                >
                  Copy link
                </button>
                <button
                  onClick={() => alert("Bookmark (dummy)")}
                  className="px-3 py-2 rounded border text-sm"
                >
                  Bookmark
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
