"use client";

import React, { useEffect, useState } from "react";
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
  useAuth,
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
  const [drawerOpen, setDrawerOpen] = useState(false);

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
    if (!userLoaded || !authLoaded) {
      // not ready yet
      return;
    }
    if (!isSignedIn) {
      // not signed in
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const storageKey = `userSynced:${user?.id}`;
        if (user?.id && localStorage.getItem(storageKey)) return;

        const token = await getToken();
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

        if (user?.id) localStorage.setItem(storageKey, "1");
        console.log("User sync success:", res.data);
      } catch (err: any) {
        console.error("create-user error", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [userLoaded, authLoaded, isSignedIn, getToken, user?.id]);

  // shared classes
  const pillBtn =
    "font-medium rounded-full px-4 py-2 md:px-6 md:py-2 transition-all duration-200 hover:scale-105 hover:shadow-lg";

  return (
    <>
      <AnimatePresence mode="wait">
        {/* TOP floating pill for md+ screens */}
        <motion.div
          initial={{ opacity: 1, y: -100 }}
          animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "hidden md:flex max-w-fit fixed top-6 inset-x-0 mx-auto border border-transparent dark:border-white/[0.08] rounded-full dark:bg-black bg-white shadow-[0px_6px_18px_rgba(2,6,23,0.08)] z-[5000] pr-3 pl-6 py-2 items-center justify-center space-x-4",
            className
          )}
        >
          <div>
            <a href="/" className="flex items-center">
              <img
                src="https://flowbite.com/docs/images/logo.svg"
                className="h-8 m-2"
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
                "relative flex items-center gap-2 text-neutral-600 dark:text-neutral-50 hover:text-blue-700 dark:hover:text-neutral-300 text-sm"
              )}
            >
              {navItem.icon && <span className="hidden sm:block">{navItem.icon}</span>}
              <span className="hidden sm:block text-sm">{navItem.name}</span>
            </a>
          ))}

          <SignedOut>
            <SignInButton>
              <button
                className={`${pillBtn} border border-neutral-200 dark:border-white/[0.08] text-black dark:text-white bg-white hover:bg-blue-700 hover:text-white`}
              >
                <span>Login</span>
                <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-blue-500 to-transparent h-px" />
              </button>
            </SignInButton>

            <SignUpButton>
              <button
                className={`${pillBtn} border border-neutral-200 dark:border-white/[0.08] text-black dark:text-white bg-white hover:bg-blue-700 hover:text-white`}
              >
                <span>SignUp</span>
                <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-blue-500 to-transparent h-px" />
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

      {/* MOBILE TOP BAR with hamburger - visible on md:hidden */}
      <AnimatePresence>
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="md:hidden fixed top-4 inset-x-4 z-[5000] bg-white/95 dark:bg-black/95 backdrop-blur-sm rounded-2xl shadow-lg border border-transparent dark:border-white/[0.06] p-2 flex items-center justify-between gap-2"
        >
          {/* Left: hamburger button */}
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/[0.04] transition"
          >
            {/* simple hamburger icon */}
            <svg
              className="w-6 h-6 text-neutral-700 dark:text-neutral-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* center: logo */}
          <a href="/" className="flex items-center justify-center flex-1">
            <img
              src="https://flowbite.com/docs/images/logo.svg"
              className="h-7"
              alt="BlogVerse"
            />
          </a>

          {/* right: auth/user */}
          <div className="flex items-center gap-2">
            <SignedOut>
              <SignInButton>
                <button className="px-3 py-2 rounded-lg text-sm border border-neutral-200 dark:border-white/[0.06] bg-white dark:bg-black hover:bg-blue-700 hover:text-white transition">
                  Login
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </motion.header>
      </AnimatePresence>

      {/* DRAWER: slide-over sidebar for mobile */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="fixed inset-0 z-[5010] bg-black/40 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />

            {/* side drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 z-[5020] w-[84%] max-w-xs bg-white dark:bg-neutral-900 shadow-xl p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <a href="/" className="flex items-center gap-2">
                  <img src="https://flowbite.com/docs/images/logo.svg" className="h-8" alt="logo" />
                  <span className="font-semibold">BlogVerse</span>
                </a>

                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close menu"
                  className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-white/[0.04] transition"
                >
                  <svg
                    className="w-5 h-5 text-neutral-700 dark:text-neutral-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="flex flex-col gap-2">
                {navItems.map((navItem: any, idx: number) => (
                  <a
                    key={`drawer-item-${idx}`}
                    href={navItem.link}
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-neutral-50 dark:hover:bg-white/[0.03] transition"
                  >
                    <span className="text-lg">{navItem.icon ?? navItem.name.charAt(0)}</span>
                    <span className="font-medium">{navItem.name}</span>
                  </a>
                ))}

                {/* My Blogs shown when signed in */}
                <SignedIn>
                  <a
                    href="/my-blogs"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-neutral-50 dark:hover:bg-white/[0.03] transition"
                  >
                    <span className="text-lg">📝</span>
                    <span className="font-medium">My Blogs</span>
                  </a>
                </SignedIn>

                <div className="border-t border-neutral-100 dark:border-white/[0.04] mt-3 pt-3 flex flex-col gap-2">
                  <SignedOut>
                    <SignInButton>
                      <button
                        onClick={() => setDrawerOpen(false)}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-neutral-50 dark:hover:bg-white/[0.03] transition"
                      >
                        Login
                      </button>
                    </SignInButton>

                    <SignUpButton>
                      <button
                        onClick={() => setDrawerOpen(false)}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-neutral-50 dark:hover:bg-white/[0.03] transition"
                      >
                        Sign Up
                      </button>
                    </SignUpButton>
                  </SignedOut>

                  <SignedIn>
                    <a
                      href="/my-blogs"
                      onClick={() => setDrawerOpen(false)}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-neutral-50 dark:hover:bg-white/[0.03] transition"
                    >
                      My Blogs
                    </a>
                    <div className="px-3 py-2">
                      <UserButton />
                    </div>
                  </SignedIn>
                </div>
              </nav>

              {/* optional footer */}
              <div className="mt-auto pt-4 text-xs text-neutral-500 dark:text-neutral-400">
                <div>© {new Date().getFullYear()} BlogVerse</div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
