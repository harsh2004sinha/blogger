"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import slugify from "slugify";

type Blog = {
  id: string,
  title: string,
  category: {
    displayName: string,
  },
  featuredImage?: string | null,
  createdAt: string,
  slug: string
};

export function CarouselCards() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]> ([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean> (true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get("api/blogs");
        console.log(res);
        setBlogs(res.data.data || []);
      } catch (error) {
        console.error("Error in Fecthing Blogs :: CarouselCards", error);
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
    const slug = slugify(title, {lower: true, strict: true});
    router.push(`/blogs/${slug}`);
  };

  return (
    <div className="relative w-full max-w-6xl">
      <div className="overflow-hidden rounded-3xl shadow-lg relative">
        <motion.div
          className="flex transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {blogs.map((blog, i) => (
            <div
              key={i}
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
                <div className="text-sm opacity-80">{blog.category?.displayName ?? "Unknown"}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

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
    </div>
  );
}
