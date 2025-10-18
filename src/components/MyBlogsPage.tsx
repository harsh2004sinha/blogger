"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  SignInButton,
  SignOutButton,
  useUser,
} from "@clerk/nextjs";
import { LoaderOne } from "./ui/loader";

type Blog = {
  id: string;
  title: string;
  category?: string;
  featuredImage?: string;
  status: boolean;
};

const dummyBlogs: Blog[] = Array.from({ length: 21 }).map((_, i) => ({
  id: `blog-${i + 1}`,
  title: `Sample Blog ${i + 1}`,
  category: ["Tech", "Food", "Travel", "Lifestyle"][i % 4],
  featuredImage: `https://picsum.photos/seed/blog${i + 1}/600/400`,
  status: i % 2 === 0,
}));

const MyBlogsPage: React.FC = () => {
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();
  const [visibleCount, setVisibleCount] = useState(9);

  if (!isLoaded)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-500 to-gray-700 text-white">
        <LoaderOne/>
      </div>
    );

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-500 to-gray-700 p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-2 dark:text-white">
            Your Blogs
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Sign in to see and manage your blogs.
          </p>
          <div className="flex gap-3 justify-center">
            <SignInButton mode="modal">
              <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                Sign in
              </button>
            </SignInButton>

            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 rounded-lg border"
            >
              Back
            </button>
          </div>

          <div className="mt-4 text-xs text-gray-400">
            (Clerk authentication enabled)
          </div>
        </div>
      </div>
    );
  }

  const visibleBlogs = dummyBlogs.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-gray-700 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              My Blogs
            </h1>
            <p className="text-sm text-gray-100 dark:text-gray-300">
              Signed in as{" "}
              <span className="font-medium">
                {user?.firstName || user?.primaryEmailAddress?.emailAddress}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/blogs/create")}
              className="px-4 py-2 hover:cursor-pointer rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
            >
              + New Blog
            </button>

            <SignOutButton>
              <button className="px-4 py-2 rounded-lg border-white text-gray-100 dark:text-gray-200 hover:bg-gray-100 hover:text-black hover:cursor-pointer dark:hover:bg-gray-700 transition">
                Sign out
              </button>
            </SignOutButton>
          </div>
        </div>

        {/* BLOG GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleBlogs.map((b) => (
            <div
              key={b.id}
              onClick={() => router.push(`/blogs/${b.id}`)}
              className="cursor-pointer rounded-xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 hover:scale-105 transition-transform duration-300 relative"
            >
              <div className="relative">
                <img
                  src={b.featuredImage}
                  alt={b.title}
                  className="h-56 w-full object-cover"
                />
                {/* STATUS BADGE */}
                <div className="absolute bottom-3 right-3">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                      b.status
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        b.status ? "bg-green-600" : "bg-red-600"
                      }`}
                    />
                    {b.status ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <p className="text-xs font-medium text-blue-500 mb-1">
                  {b.category || "Uncategorized"}
                </p>
                <h3 className="text-lg font-semibold mb-2 dark:text-white">
                  {b.title}
                </h3>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Edit ${b.title}`);
                      }}
                      className="px-3 py-1 border rounded-md text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Delete ${b.title}`);
                      }}
                      className="px-3 py-1 border rounded-md text-xs text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SHOW MORE BUTTON */}
        {visibleCount < dummyBlogs.length && (
          <div className="flex justify-center mt-12">
            <button
              onClick={() => setVisibleCount((prev) => prev + 9)}
              className="px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors shadow-md"
            >
              Show More
            </button>
          </div>
        )}

        {/* END MESSAGE */}
        {visibleCount >= dummyBlogs.length && (
          <p className="text-center text-gray-500 mt-10">
            You’ve reached the end!
          </p>
        )}
      </div>
    </div>
  );
};

export default MyBlogsPage;
