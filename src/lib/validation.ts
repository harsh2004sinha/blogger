import z from "zod";

export const BlogSchema = z.object({
    title: z.string().min(3, "Title must be atleast 3 characters long"),
    content: z.string()
              .min(10, "Content must be atleast 10 chracters long")
              .max(50000, "Content must be less than 50000 characters long"),
    featuredImage: z.string().url("Invalid Image URL").optional(),
    status: z.boolean(),
    imageId: z.string().optional(),
    categoryName: z.string(),
});