"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface Blog {
  id: string;
  title: string;
  category?: {
    displayName: string;
  };
  featuredImage?: string;
  status: boolean;
  slug: string;
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [visibleCount, setVisibleCount] = useState(9);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const fetchBlogs = async () => {
      try {
        const res = await axios.get("/api/blogs");
        console.log(res);
        const allBlogs: Blog[] = res.data?.data || [];

        const filtered = allBlogs.filter((b) => b.status === true);

        if (mounted) setBlogs(filtered);
      } catch (err) {
        console.error("Error fetching blogs:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchBlogs();

    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    blogs.forEach((b) => {
      if (b.category?.displayName) set.add(b.category.displayName);
    });
    return ["ALL", ...Array.from(set)];
  }, [blogs]);

  const filteredBlogs =
    selectedCategory === "ALL"
      ? blogs
      : blogs.filter(
          (blog) =>
            blog.category?.displayName.toLowerCase() ===
            selectedCategory.toLowerCase()
        );

  const visibleBlogs = filteredBlogs.slice(0, visibleCount);

  const handleBrowseMore = () => setVisibleCount((p) => p + 9);

  const handleCardClick = (slug: string) => router.push(`/blogs/${slug}`);

  const FALLBACK_IMG =
    "https://thumbs.dreamstime.com/z/default-avatar-profile-flat-icon-social-media-user-vector-portrait-unknown-human-image-default-avatar-profile-flat-icon-184330869.jpg?ct=jpeg";

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-500 to-gray-700 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Latest Blogs</h1>
            <p className="mt-1 text-sm text-slate-200">Handpicked posts across categories.</p>
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor="category" className="sr-only">Select category</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="hidden sm:inline-block w-56 px-3 py-2 border rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* category pills for small screens */}
            <div className="sm:hidden flex gap-2 overflow-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium border ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white border-transparent"
                      : "bg-white text-slate-700 border-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </header>

        {loading ? (
          <section aria-busy="true" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl shadow p-4">
                <div className="h-40 bg-slate-200 rounded-md mb-3" />
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </section>
        ) : blogs.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <h2 className="text-xl font-semibold">No blogs available</h2>
            <p className="mt-2 text-slate-200">There are no published posts right now. Check back later.</p>
          </div>
        ) : (
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleBlogs.map((blog) => (
                <article
                  key={blog.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleCardClick(blog.slug)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleCardClick(blog.slug);
                  }}
                  className="cursor-pointer rounded-xl overflow-hidden shadow hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 bg-white"
                >
                  <div className="relative h-56 w-full bg-slate-100">
                    <img
                      src={blog.featuredImage || FALLBACK_IMG}
                      alt={blog.title}
                      loading="lazy"
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_IMG;
                      }}
                    />
                  </div>

                  <div className="p-4">
                    <p className="text-xs font-semibold text-blue-600 mb-1">{blog.category?.displayName || 'Uncategorized'}</p>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{blog.title}</h3>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-slate-500">Read more →</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              {visibleCount < filteredBlogs.length ? (
                <button
                  onClick={handleBrowseMore}
                  className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Load more
                </button>
              ) : (
                <span className="text-sm text-slate-200">You've reached the end — check back later for more posts.</span>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
