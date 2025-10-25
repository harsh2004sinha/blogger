"use client";

import React, { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import { cn } from "@/lib/utils";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
  useAuth
} from "@clerk/nextjs";
import axios from "axios";

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: React.ReactElement;
  }[];
  className?: string;
}) => {
  const { scrollYProgress } = useScroll();
  const { isLoaded: userLoaded, isSignedIn, user } = useUser();
  const { getToken, isLoaded: authLoaded } = useAuth();

  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (typeof current === "number") {
      let direction = current! - scrollYProgress.getPrevious()!;

      if (scrollYProgress.get() < 0.05) {
        setVisible(true);
      } else {
        if (direction < 0) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      }
    }
  });

  useEffect(() => {
    // Wait until Clerk client hooks are loaded and user is signed in
    if (!userLoaded || !authLoaded) {
      console.log("Clerk not loaded yet", { userLoaded, authLoaded });
      return;
    }
    if (!isSignedIn) {
      console.log("User not signed in yet");
      return;
    }

    let mounted = true;
    (async () => {
      try {
        console.log("Effect triggered: userLoaded/authLoaded/isSignedIn", { userLoaded, authLoaded, isSignedIn, userId: user?.id });

        // Avoid repeated calls from same browser for same user
        const storageKey = `userSynced:${user?.id}`;
        if (user?.id && localStorage.getItem(storageKey)) {
          console.log("Skipping create-user, already synced in this browser for", user.id);
          return;
        }

        // get a session JWT
        const token = await getToken();
        console.log("Got token length", token?.length);

        if (!mounted || !token) return;

        const res = await axios.post(
          "/api/create-user",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("User sync success:", res.data);
        if (user?.id) localStorage.setItem(storageKey, "1");
      } catch (err: any) {
        if (axios.isAxiosError(err)) {
          console.error("create-user failed:", err.response?.status, err.response?.data);
        } else {
          console.error("Unexpected error calling create-user:", err);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [userLoaded, authLoaded, isSignedIn, getToken, user?.id]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{
          opacity: 1,
          y: -100,
        }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
        }}
        className={cn(
          "flex max-w-fit  fixed top-10 inset-x-0 mx-auto border border-transparent dark:border-white/[0.2] rounded-full dark:bg-black bg-white shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-[5000] pr-2 pl-8 py-2  items-center justify-center space-x-4",
          className
        )}
      >
        <div>
          <a href="/" className="flex items-center">
            <img
              src="https://flowbite.com/docs/images/logo.svg"
              className="h-8 m-3"
              alt="BlogVerse Logo"
            />
            <span className="self-center text-sm font-semibold whitespace-nowrap dark:text-black">
              BlogVerse
            </span>
          </a>
        </div>
        {navItems.map((navItem: any, idx: number) => (
          <a
            key={`link=${idx}`}
            href={navItem.link}
            className={cn(
              "relative hover:text-blue-700 dark:text-neutral-50 items-center flex space-x-1 text-neutral-600 dark:hover:text-neutral-300"
            )}
          >
            <span className="block sm:hidden">{navItem.icon}</span>
            <span className="hidden sm:block text-sm">{navItem.name}</span>
          </a>
        ))}
        <SignedOut>
          <SignInButton>
            <button className="border hover:bg-blue-700 hover:text-white hover:cursor-pointer text-sm font-medium relative border-neutral-200 dark:border-white/[0.2] text-black dark:text-white px-4 py-2 rounded-full">
              <span>Login</span>
              <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-blue-500 to-transparent  h-px" />
            </button>
          </SignInButton>
          <SignUpButton>
            <button className="border hover:bg-blue-700 hover:text-white text-sm bg-white hover:cursor-pointer text-black font-medium relative border-neutral-200 dark:border-white/[0.2] px-4 py-2 rounded-full">
              <span>SignUp</span>
              <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-blue-500 to-transparent  h-px" />
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <a
            href="/my-blogs"
            className="text-sm font-medium text-neutral-600 dark:text-neutral-100 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
          >
            My Blogs
          </a>
          <UserButton />
        </SignedIn>
      </motion.div>
    </AnimatePresence>
  );
};
