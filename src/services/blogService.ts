import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";
import { ErrorResponse } from "./errorResponse";

export class BlogService{

    async createBlog({title, content, featuredImage,imageId, status, categoryName, userId}: any){
        const slug = slugify(title, {lower: true, strict: true});
        try {
            if(!categoryName) {
                console.error("Prisma Service ::CategoryName :: createBlog :: error");
                return ErrorResponse("Category is Required", 401);
            }
            
            const normalizedCategory = categoryName.trim().toLowerCase();

            let category = await prisma.category.findFirst({
                where: {
                    name : { equals: normalizedCategory, mode: "insensitive"},
                },
            });

            if(!category){
                category = await prisma.category.create({
                    data: {
                        name: normalizedCategory,
                        displayName: normalizedCategory.toUpperCase(),
                    },
                });
            }

            return await prisma.blog.create({
                data: {
                    title,
                    slug,
                    content,
                    imageId,
                    featuredImage,
                    status,
                    authorId: userId,
                    categoryId: category.id,
                },
            });
        } catch (error) {
            console.error("Prisma Service :: CreateBlog :: Error");
            throw error;
        }
    }

    async updateBlog(slug: string, {title, content, featuredImage, status, categoryName}: any){
        try {
            const existingBlog = await this.getBlog(slug);
            if(!existingBlog) throw new Error("Blog Not Found");
    
            const newSlug = slugify(title, {lower: true, strict: true});
            const normalizedCategory = categoryName.trim().toLowerCase();

            let category = await prisma.category.findFirst({
                where: {
                    name : { equals: normalizedCategory, mode: "insensitive"},
                },
            });

            if(!category){
                category = await prisma.category.create({
                    data: {
                        name: normalizedCategory,
                        displayName: normalizedCategory.toUpperCase(),
                    },
                });
            }
    
            const updatedBlog = await prisma.blog.update({
                where: {slug},
                data: {
                    title,
                    content,
                    featuredImage,
                    status,
                    categoryId: category.id,
                    slug: newSlug,
                },
            });
    
            if(existingBlog.featuredImage && existingBlog.imageId && existingBlog.featuredImage !== featuredImage){
                await cloudinary.uploader.destroy(existingBlog.imageId)
            }
    
            return updatedBlog;
        } catch (error) {
            console.error("Prisma Service :: updateBlog :: error");
            throw error;
        }
    }

    async deleteBlog(slug: string){
        try {
            await prisma.blog.delete({
                where: {slug}
            });
            return true;

        } catch (error) {
            console.error("Prisma Service :: deleteBlog :: error");
            throw error;
        }
    }

    async getBlog(slug: string){
        try{
            return await prisma.blog.findUnique({
                include: {
                    category: true,
                    author: true,
                },
                where: { slug },
            });
        }
        catch (error){
            console.error("Prisma Serivce :: getBlog :: error");
            throw error;
        }
    }

    async getBlogs(filters: any = {}){
        try {
            return await prisma.blog.findMany({
                include: {
                    category: true,
                    author: true,
                },
                where: filters,
                orderBy: {updatedAt: "desc"},
                take: 20,
            });
        } catch (error) {
            console.error("Prisma Service :: getBlogs :: error");
            return [];
        }
    }

    async uploadFile(filePath: string){
        try {
            const res = await cloudinary.uploader.upload(filePath, {folder: "blogs"});
            return [res.secure_url, res.public_id];
        } catch (error) {
            console.error("Prisma Service :: uploadFile :: error")
            return null;
        }
    }
}

