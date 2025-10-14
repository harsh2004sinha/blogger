import z from "zod";

export const BlogSchema = z.object({
    title: z.string().min(3, "Title must be atleast 3 characters long"),
    content: z.string()
              .min(10, "Content must be atleast 10 chracters long")
              .max(500, "Content must be less than 500 characters long"),
    featuredImage: z.string().url("Invalid Image URL").optional(),
    status: z.boolean(),
    authorId: z.string(),
    imageId: z.string().optional(),
});