import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";

export class BlogService{

    async createBlog({title, content, featuredImage,imageId, status, userId}: any){
        const slug = slugify(title, {lower: true, strict: true});
        try {
            return await prisma.blog.create({
                data: {
                    title,
                    slug,
                    content,
                    imageId,
                    featuredImage,
                    status,
                    authorId: userId,
                },
            });
        } catch (error) {
            console.error("Prisma Service :: CreateBlog :: Error");
            throw error;
        }
    }

    async updateBlog(slug: string, {title, content, featuredImage, status}: any){
        try {
            const existingBlog = await this.getBlog(slug);
            if(!existingBlog) throw new Error("Blog Not Found");
    
            const newSlug = slugify(title, {lower: true, strict: true});
    
            const updatedBlog = await prisma.blog.update({
                where: {slug},
                data: {
                    title,
                    content,
                    featuredImage,
                    status,
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
            return await prisma.blog.findUnique({where: { slug }});
        }
        catch (error){
            console.error("Prisma Serivce :: getBlog :: error");
            throw error;
        }
    }

    async getBlogs(filters: any = {}){
        try {
            return await prisma.blog.findMany({
                where: filters,
                orderBy: {createdAt: "desc"}
            })
        } catch (error) {
            console.error("Prisma Service :: getBlogs :: error");
            return [];
        }
    }

    async uploadFile(filePath: string){
        try {
            const res = await cloudinary.uploader.upload(filePath, {folder: "blogs"});
            return res.secure_url;
        } catch (error) {
            console.error("Prisma Service :: uploadFile :: error")
            return null;
        }
    }
}

