"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import slugify from "slugify";

type Blog = {
  id: string;
  title: string;
  category: {
    displayName: string;
  };
  featuredImage?: string | null;
  updatedAt: string;
  slug: string;
  status: boolean;
};

export function CarouselCards() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get("api/blogs");
        const allBlogs: Blog[] = res.data?.data || res.data || [];

        // Filter published blogs, sort by updatedAt descending, and keep only 4 most recent
        const filteredSorted: Blog[] = (allBlogs as Blog[])
          .filter((b) => b.status === true)
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
          .slice(0, 4);

        setBlogs(filteredSorted);
      } catch (error) {
        console.error("Error in Fetching Blogs :: CarouselCards", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const prev = () =>
    setCurrentIndex((prev) => (prev === 0 ? blogs.length - 1 : prev - 1));
  const next = () =>
    setCurrentIndex((prev) => (prev === blogs.length - 1 ? 0 : prev + 1));

  const goToBlog = (title: string) => {
    const slug = slugify(title, { lower: true, strict: true });
    router.push(`/blogs/${slug}`);
  };

  const goToAllBlogs = () => {
    router.push("/blogs");
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* ====== LOADING SKELETON ====== */}
      {loading ? (
        <div className="overflow-hidden rounded-3xl shadow-lg relative">
          <div className="w-full h-[450px] bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-pulse" />
          <div className="absolute bottom-0 left-0 right-0 bg-black/40 p-6 space-y-3">
            <div className="h-6 w-1/2 bg-gray-400/60 rounded animate-pulse"></div>
            <div className="h-4 w-1/3 bg-gray-400/50 rounded animate-pulse"></div>
          </div>
        </div>
      ) : (
        <>
          {/* ====== CAROUSEL ====== */}
          <div className="overflow-hidden rounded-3xl shadow-lg relative">
            <motion.div
              className="flex transition-transform duration-700 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
              }}
            >
              {blogs.length > 0 ? (
                blogs.map((blog, i) => (
                  <div
                    key={blog.id ?? i}
                    className="min-w-full flex-shrink-0 relative cursor-pointer"
                    onClick={() => goToBlog(blog.title)}
                  >
                    <img
                      src={blog.featuredImage ?? undefined}
                      alt={blog.title}
                      className="w-full h-[450px] object-cover brightness-90 hover:brightness-100 transition-all duration-300"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white px-6 py-4">
                      <div className="text-2xl font-semibold">{blog.title}</div>
                      <div className="text-sm opacity-80">
                        {blog.category?.displayName ?? "Unknown"}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // Empty state when there are no blogs to show
                <div className="min-w-full flex-shrink-0 relative bg-gray-100 h-[450px] flex items-center justify-center">
                  <div className="text-center text-gray-600">
                    No recent blogs to display.
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* ====== NAVIGATION BUTTONS ====== */}
          {blogs.length > 0 && (
            <>
              <button
                onClick={prev}
                className="absolute top-1/2 left-4 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md hover:scale-110 transition"
              >
                <ChevronLeft className="w-6 h-6 text-black dark:text-white" />
              </button>

              <button
                onClick={next}
                className="absolute top-1/2 right-4 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md hover:scale-110 transition"
              >
                <ChevronRight className="w-6 h-6 text-black dark:text-white" />
              </button>
            </>
          )}

          {/* ====== DOT INDICATORS ====== */}
          <div className="flex justify-center gap-3 mt-6">
            {blogs.map((_, i) => (
              <div
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
                  currentIndex === i
                    ? "bg-black dark:bg-white scale-125"
                    : "bg-gray-400"
                }`}
              ></div>
            ))}
          </div>

        </>
      )}
    </div>
  );
}
