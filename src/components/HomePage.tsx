"use client";

import { motion } from "motion/react";
import React from "react";
import { AuroraBackground } from "./ui/AuroraBackground";
import { CarouselCards } from "./CarouselCards";
import { useRouter } from "next/navigation";
import { SignedIn, SignedOut } from "@clerk/nextjs";

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
          <div className="flex gap-32 align-middle">
            <SignedIn>
              <button
                onClick={() => router.push("/blogs/create")}
                className="bg-black dark:bg-white hover:cursor-pointer rounded-full w-fit text-white dark:text-black px-4 py-2 transition hover:scale-105"
              >
                Start Writing
              </button>
            </SignedIn>
            <SignedOut>
              <button
                onClick={() => router.push("/sign-in")}
                className="bg-black dark:bg-white rounded-full w-fit hover:cursor-pointer text-white dark:text-black px-4 py-2 transition hover:scale-105"
              >
                Start Writing
              </button>
            </SignedOut>
            <button
              onClick={() => router.push("/blogs")}
              className="bg-black dark:bg-white rounded-full w-fit hover:cursor-pointer text-white dark:text-black px-4 py-2 transition hover:scale-105"
            >
              Explore Blogs
            </button>
          </div>
        </motion.div>
      </AuroraBackground>
      <div className="relative flex flex-col gap-4 items-center justify-center px-4 bg-gradient-to-b from-zinc-200 to-gray-700">
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.6,
            duration: 0.8,
            ease: "easeInOut",
          }}
        >
          <div className="text-3xl md:text-7xl font-bold dark:text-white text-left ml-6">
            Recent Blogs:
          </div>
          <CarouselCards />
        </motion.div>
      </div>
    </>
  );
}
