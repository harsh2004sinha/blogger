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
  category: { displayName: string };
  featuredImage?: string | null;
  updatedAt: string;
  slug: string;
  status: boolean;
};

export function CarouselCards() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get("/api/blogs");
        const allBlogs: Blog[] = res.data?.data || res.data || [];

        const filteredSorted = allBlogs
          .filter((b) => b.status === true)
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() -
              new Date(a.updatedAt).getTime()
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

  const slideCount = Math.max(blogs.length, 1);
  const prev = () =>
    setCurrentIndex((prev) => (prev === 0 ? slideCount - 1 : prev - 1));
  const next = () =>
    setCurrentIndex((prev) => (prev === slideCount - 1 ? 0 : prev + 1));

  const goToBlog = (title: string) => {
    const slug = slugify(title, { lower: true, strict: true });
    router.push(`/blogs/${slug}`);
  };

  const trackWidth = `${slideCount * 100}%`;
  const slidePercent = 100 / slideCount;
  const translatePercent = -(currentIndex * slidePercent);

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* ====== LOADING SKELETON ====== */}
      {loading ? (
        <div className="overflow-hidden rounded-3xl shadow-lg relative">
          <div className="w-full h-[300px] md:h-[450px] bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-pulse" />
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
              className="flex"
              style={{
                width: trackWidth,
                transform: `translateX(${translatePercent}%)`,
              }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              {blogs.length > 0 ? (
                blogs.map((blog, i) => (
                  <div
                    key={blog.id ?? i}
                    style={{
                      width: `${slidePercent}%`,
                      flex: `0 0 ${slidePercent}%`,
                    }}
                    className="relative cursor-pointer"
                    onClick={() => goToBlog(blog.title)}
                  >
                    <img
                      src={blog.featuredImage ?? undefined}
                      alt={blog.title}
                      className="w-full h-[220px] sm:h-[300px] md:h-[450px] object-cover brightness-90 hover:brightness-100 transition-all duration-300 rounded-3xl"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white px-6 py-4 rounded-b-3xl">
                      <div className="text-lg sm:text-2xl font-semibold">
                        {blog.title}
                      </div>
                      <div className="text-xs sm:text-sm opacity-80">
                        {blog.category?.displayName ?? "Unknown"}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{ width: "100%" }}
                  className="relative bg-gray-100 h-[300px] md:h-[450px] flex items-center justify-center rounded-3xl"
                >
                  <div className="text-center text-gray-600">
                    No recent blogs to display.
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* ====== NAVIGATION + DOTS BELOW ====== */}
          {blogs.length > 0 && (
            <div className="flex flex-col items-center justify-center mt-6 space-y-4">
              {/* Dots */}
              <div className="flex justify-center gap-3">
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

              {/* Navigation Buttons */}
              <div className="flex items-center justify-center gap-6 mt-2">
                <button
                  onClick={prev}
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full p-3 shadow-md hover:scale-110 transition"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-6 h-6 text-black dark:text-white" />
                </button>
                <button
                  onClick={next}
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full p-3 shadow-md hover:scale-110 transition"
                  aria-label="Next"
                >
                  <ChevronRight className="w-6 h-6 text-black dark:text-white" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
