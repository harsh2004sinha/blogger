# 📝 BlogVerse - Modern Full-Stack Blogging Application

![BlogVerse Banner](https://images.unsplash.com/photo-1522202176988-66273c2fd55f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGJsb2d8ZW58MHx8MHx8&ixlib=rb-4.0.3&q=80&w=1080)

## Overview

**BlogVerse** is a modern full-stack blogging platform that allows users to **create, edit, publish, and explore blogs**. The application features a **responsive user interface**, **secure backend**, **category-based filtering**, and **progressive blog loading** to provide a seamless reading and writing experience.

- Users can browse blogs in a **3x3 grid layout**, with a **"Browse More"** option to load additional blogs.
- Blogs can include **rich-text content** and **images** uploaded via Cloudinary.
- Dynamic filtering by **categories** like Travel, Tech, Food, and Lifestyle enhances discoverability.

---

## 🚀 Features

- **Rich Blog Management:** Create, edit, and publish blogs with TinyMCE editor and image uploads.
- **Responsive Grid & Pagination:** 3x3 blog grid with "Browse More" functionality for seamless content exploration.
- **Dynamic Category Filtering:** Filter blogs easily by categories like Tech, Travel, Food, and Lifestyle.
- **Cloud Storage & Secure Backend:** Cloudinary for media storage and Prisma ORM with PostgreSQL for efficient data handling.

---

## 🛠 Technologies Used

- **Frontend:** Next.js, React, Tailwind CSS, TypeScript  
- **Backend:** Next.js API Routes, Prisma ORM, PostgreSQL  
- **Media Handling:** Cloudinary  
- **Deployment:** Vercel

---

## 📂 Project Structure
blogverse/
├─ components/ # Reusable React components
├─ pages/ # Next.js pages & API routes
├─ prisma/ # Prisma schema & migrations
├─ public/ # Static assets
├─ api/ # Backend implementation
├─ services/ # Backend services
├─ styles/ # Tailwind & custom CSS
├─ utils/ # Utility functions
└─ README.md


---

## ⚡ Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL database
- Cloudinary account

### Installation

```bash
git clone https://github.com/harsh2004sinha/blogger.git
cd blogger
npm install
```

### Setup Environment Variables

Create a .env file:

DATABASE_URL="postgresql://user:password@localhost:5432/blogify"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

### Run Locally

npm run dev


### Live Demo

https://blogger-ivory-eta.vercel.app/