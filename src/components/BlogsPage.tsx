"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { LoaderOne } from "./ui/loader";

interface Blog {
  id: string;
  title: string;
  category?: string;
  featuredImage?: string;
  status: boolean;
}

const BlogsPage = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [visibleCount, setVisibleCount] = useState(9);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const categories = ["All", "Tech", "Travel", "Food", "Lifestyle"];

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get("/api/blogs");
        const allBlogs = res.data?.data || [];

        const filtered = allBlogs.filter(
          (blog: Blog) =>
            blog.status === true
        );

        setBlogs(filtered);
      } catch (err) {
        console.error("Error fetching blogs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const filteredBlogs =
    selectedCategory === "All"
      ? blogs
      : blogs.filter(
          (blog) =>
            blog.category?.toLowerCase() === selectedCategory.toLowerCase()
        );

  const visibleBlogs = filteredBlogs.slice(0, visibleCount);

  const handleBrowseMore = () => {
    setVisibleCount((prev) => prev + 9);
  };

  const handleCardClick = (slug: string) => {
    router.push(`/blogs/${slug}`);
  };

  if (loading)
    return (
      <div className="bg-gradient-to-b from-blue-500 to-gray-700 flex justify-center items-center h-screen text-gray-500">
        <LoaderOne/>
      </div>
    );

  if (blogs.length === 0)
    return (
      <div className="bg-gradient-to-b from-blue-500 to-gray-700 flex justify-center items-center h-screen">
        No blogs available.
      </div>
    );

  return (
    <div className="bg-gradient-to-b from-blue-500 to-gray-700">
      {/* CATEGORY FILTER */}
      <div className="flex justify-center mb-10 mt-24 mr-[69%]">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-64 px-4 py-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* BLOG GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl">
        {visibleBlogs.map((blog) => (
          <div
            key={blog.id}
            onClick={() => handleCardClick(blog.id)}
            className="cursor-pointer rounded-xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 hover:scale-105 transition-transform duration-300"
          >
            <img
              src={blog.featuredImage || "/placeholder.jpg"}
              alt={blog.title}
              className="h-52 w-full object-cover"
            />
            <div className="p-4">
              <p className="text-xs font-medium text-blue-500 mb-1">
                {blog.category || "Uncategorized"}
              </p>
              <h2 className="text-lg font-bold mb-2 dark:text-white">
                {blog.title}
              </h2>
            </div>
          </div>
        ))}
      </div>

      {/* BROWSE MORE BUTTON */}
      {visibleCount < filteredBlogs.length && (
        <button
          onClick={handleBrowseMore}
          className="mt-10 px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors"
        >
          Browse More
        </button>
      )}
    </div>
  );
};

export default BlogsPage;
