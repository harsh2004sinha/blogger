"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SignInButton, SignOutButton, useUser, useAuth } from "@clerk/nextjs";
import axios from "axios";

type Blog = {
  id: string;
  authorId: string;
  title: string;
  category?: { displayName: string };
  featuredImage?: string;
  status: boolean;
  slug: string;
};

const MyBlogsPage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  const [visibleCount, setVisibleCount] = useState(9);

  const { getToken } = useAuth();

  const handleDelete = async (e: React.MouseEvent, slug: string, title: string) => {
    e.stopPropagation();

    const confirmed = window.confirm(`Are you sure you want to delete ${title}? This action cannot be undone.`);
    if(!confirmed) return;

    try {
      await axios.delete(`/api/blogs/${slug}`);
      
      setBlogs((prev) => prev.filter((x) => x.slug !== slug));

      alert(`"${title}" has been deleted successfully.`)
    } catch (error) {
      console.error("Error while Deleting the Blog :: MyBlogs", error);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (!user) {
      setLoading(false);
      return;
    }

    if(!isLoaded){
      setLoading(true);
      return;
    }

    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/blogs");
        const allBlogs: Blog[] = res.data?.data || res.data || [];
        const filtered = allBlogs.filter((blog) => blog.authorId === user.id);
        if (mounted) setBlogs(filtered);
      } catch (error) {
        console.error("Error fetching My Blogs:", error);
        if (mounted) setBlogs([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchBlogs();

    return () => {
      mounted = false;
    };
  }, [user, getToken, isLoaded]);

  // Render
  const visibleBlogs = blogs.slice(0, visibleCount);
  const FALLBACK_IMG =
    "https://thumbs.dreamstime.com/z/default-avatar-profile-flat-icon-social-media-user-vector-portrait-unknown-human-image-default-avatar-profile-flat-icon-184330869.jpg?ct=jpeg";


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#141E30] to-[#243B55] py-16 px-6">
      <div className="max-w-7xl mx-auto mt-24">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white font-sans">
              My Blogs
            </h1>
            <p className="text-sm text-gray-100 dark:text-gray-300 font-sans">
              Signed in as{" "}
              <span className="font-medium">
                {user?.firstName || user?.primaryEmailAddress?.emailAddress}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/blogs/create")}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition hover:cursor-pointer"
            >
              + New Blog
            </button>
          </div>
        </div>

        {/* MAIN: loading skeleton -> empty state -> blog grid */}
        {loading || !isLoaded ? (
          <section
            aria-busy="true"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl shadow p-4">
                <div className="h-40 bg-slate-200 rounded-md mb-3" />
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </section>
        ) : !isSignedIn ? (
          // not signed in view
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
              <h2 className="text-xl font-semibold mb-2 dark:text-white">Your Blogs</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Sign in to see and manage your blogs.
              </p>
              <div className="flex gap-3 justify-center">
                <SignInButton mode="modal">
                  <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                    Sign in
                  </button>
                </SignInButton>

                <button onClick={() => router.push("/")} className="px-4 py-2 rounded-lg border">
                  Back
                </button>
              </div>
            </div>
          </div>
        ) : blogs.length === 0 ? (
          // empty state
          <div className="rounded-xl shadow p-8 text-center">
            <h2 className="text-xl font-semibold">No blogs available</h2>
            <p className="mt-2 text-slate-900">There are no published posts right now. Check back later.</p>
          </div>
        ) : (
          // blog grid
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleBlogs.map((b) => (
                <div
                  key={b.id}
                  onClick={() => router.push(`/blogs/${b.slug}`)}
                  className="rounded-xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 hover:scale-105 transition-transform duration-300 relative"
                >
                  <div className="relative">
                    <img src={b.featuredImage || FALLBACK_IMG} alt={b.title} className="h-56 w-full object-cover" />
                    <div className="absolute bottom-3 right-3">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                          b.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${b.status ? "bg-green-600" : "bg-red-600"}`} />
                        {b.status ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-xs font-medium text-blue-500 mb-1">
                      {b.category?.displayName || "Uncategorized"}
                    </p>
                    <h3 className="text-lg font-semibold mb-2 dark:text-white">{b.title}</h3>

                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/blogs/${b.slug}/edit`)
                          }}
                          className="px-3 py-1 border rounded-md text-xs hover:cursor-pointer text-blue-600 hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, b.slug, b.title)}
                          className="px-3 py-1 border rounded-md text-xs hover:cursor-pointer text-red-700 hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* SHOW MORE */}
            {visibleCount < blogs.length && (
              <div className="flex justify-center mt-12">
                <button onClick={() => setVisibleCount((prev) => prev + 9)} className="px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors shadow-md">
                  Show More
                </button>
              </div>
            )}

            {/* END MESSAGE */}
            {visibleCount >= blogs.length && (
              <p className="text-center text-gray-200 mt-10">You’ve reached the end!</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyBlogsPage;
