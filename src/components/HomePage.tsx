"use client";

import { motion } from "motion/react";
import React from "react";
import { AuroraBackground } from "./ui/AuroraBackground";
import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { CarouselCards } from "./ui/CarouselCards";

export function HeroSection() {
  const router = useRouter();

  return (
    <>
      <AuroraBackground>
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="relative flex flex-col gap-4 items-center justify-center px-4"
        >
          <div className="text-3xl md:text-7xl font-bold dark:text-white text-center">
            Share Your Ideas with the World.
          </div>
          <div className="font-extralight w-8/12 text-base md:text-4xl dark:text-neutral-200 py-4">
            Write, Publish and Inspire. Join our community of creators and
            readers passionate about tech, design and innovation.
          </div>
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 md:gap-16 lg:gap-32 mt-4 md:mt-0">
            <SignedIn>
              <button
                onClick={() => router.push("/blogs/create")}
                className="bg-black dark:bg-white text-white dark:text-black font-medium rounded-full px-6 py-2 md:px-8 md:py-3 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Start Writing
              </button>
            </SignedIn>

            <SignedOut>
              <SignInButton>
                <button className="bg-black dark:bg-white text-white dark:text-black font-medium rounded-full px-6 py-2 md:px-8 md:py-3 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  Start Writing
                </button>
              </SignInButton>
            </SignedOut>

            <button
              onClick={() => router.push("/blogs")}
              className="bg-gradient-to-r from-black to-gray-800 dark:from-white dark:to-gray-300 text-white dark:text-black font-medium rounded-full px-6 py-2 md:px-8 md:py-3 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Explore Blogs
            </button>
          </div>
        </motion.div>
      </AuroraBackground>
      <div
        className="relative flex flex-col gap-4 items-center justify-center px-4
                bg-gradient-to-b from-zinc-200 to-gray-700
                dark:from-zinc-900 dark:to-gray-700"
      >
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.6,
            duration: 0.8,
            ease: "easeInOut",
          }}
        >
          <div className="text-3xl md:text-4xl font-bold dark:text-white text-left ml-6 mt-12">
            <div className="mb-10"> Recent Blogs: </div>
            <CarouselCards />

            <div className="flex justify-center mt-8">
              <button
                onClick={() => router.push("/blogs")}
                className="group flex items-center gap-2 px-4 py-1.5 rounded-full 
               bg-gradient-to-r from-blue-500 to-gray-700 text-white 
               text-sm font-medium shadow-sm hover:shadow-md 
               transition-all duration-300 hover:scale-105 hover:cursor-pointer"
              >
                <span>View All Blogs</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.25 8.25L21 12l-3.75 3.75M3 12h18"
                  />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
