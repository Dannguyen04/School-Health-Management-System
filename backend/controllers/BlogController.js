import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create a new blog post
export const createBlogPost = async (req, res) => {
    try {
        console.log("Creating blog post with data:", req.body);
        console.log("User:", req.user);

        const {
            title,
            content,
            excerpt,
            coverImage,
            category,
            tags,
            isPublished,
        } = req.body;
        const authorId = req.user.id;

        // Validate required fields
        if (!title || !content || !excerpt) {
            return res.status(400).json({
                success: false,
                error: "Tiêu đề, nội dung và tóm tắt là bắt buộc",
            });
        }

        if (!authorId) {
            return res.status(400).json({
                success: false,
                error: "Không tìm thấy thông tin tác giả",
            });
        }

        const blogPost = await prisma.post.create({
            data: {
                title,
                content,
                excerpt,
                coverImage: coverImage || null,
                category: category || null,
                tags: tags || [],
                isPublished: isPublished || false,
                publishedAt: isPublished ? new Date() : null,
                authorId,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        });

        console.log("Blog post created successfully:", blogPost);

        res.status(201).json({
            success: true,
            message: "Bài viết đã được tạo thành công",
            data: blogPost,
        });
    } catch (error) {
        console.error("Error creating blog post:", error);
        console.error("Error details:", {
            message: error.message,
            code: error.code,
            meta: error.meta,
        });

        // Handle specific Prisma errors
        if (error.code === "P2002") {
            return res.status(400).json({
                success: false,
                error: "Bài viết với tiêu đề này đã tồn tại",
            });
        }

        if (error.code === "P2003") {
            return res.status(400).json({
                success: false,
                error: "Thông tin tác giả không hợp lệ",
            });
        }

        res.status(500).json({
            success: false,
            error: "Lỗi khi tạo bài viết: " + error.message,
        });
    }
};

// Get all blog posts (with pagination and filtering)
export const getAllBlogPosts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            category,
            isPublished,
            search,
        } = req.query;
        const skip = (page - 1) * limit;

        const where = {};

        if (category) {
            where.category = category;
        }

        if (isPublished !== undefined) {
            where.isPublished = isPublished === "true";
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { content: { contains: search, mode: "insensitive" } },
                { excerpt: { contains: search, mode: "insensitive" } },
            ];
        }

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where,
                skip: parseInt(skip),
                take: parseInt(limit),
                include: {
                    author: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            }),
            prisma.post.count({ where }),
        ]);

        res.json({
            success: true,
            data: {
                posts,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error("Error fetching blog posts:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi tải danh sách bài viết",
        });
    }
};

// Get a single blog post by ID
export const getBlogPostById = async (req, res) => {
    try {
        const { id } = req.params;

        const blogPost = await prisma.post.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        });

        if (!blogPost) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy bài viết",
            });
        }

        res.json({
            success: true,
            data: blogPost,
        });
    } catch (error) {
        console.error("Error fetching blog post:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi tải bài viết",
        });
    }
};

// Update a blog post
export const updateBlogPost = async (req, res) => {
    try {
        console.log("Updating blog post with data:", req.body);
        console.log("User:", req.user);

        const { id } = req.params;
        const {
            title,
            content,
            excerpt,
            coverImage,
            category,
            tags,
            isPublished,
        } = req.body;

        const existingPost = await prisma.post.findUnique({
            where: { id },
        });

        console.log("Existing post:", existingPost);

        if (!existingPost) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy bài viết",
            });
        }

        // Check if user is the author or has admin privileges
        console.log(
            "Checking permissions - authorId:",
            existingPost.authorId,
            "userId:",
            req.user.id,
            "userRole:",
            req.user.role
        );

        if (
            existingPost.authorId !== req.user.id &&
            req.user.role !== "ADMIN"
        ) {
            return res.status(403).json({
                success: false,
                error: "Không có quyền chỉnh sửa bài viết này",
            });
        }

        const updateData = {
            title,
            content,
            excerpt,
            coverImage,
            category,
            tags: tags || [],
            isPublished:
                isPublished !== undefined
                    ? isPublished
                    : existingPost.isPublished,
        };

        // Set publishedAt if publishing for the first time
        if (isPublished && !existingPost.isPublished) {
            updateData.publishedAt = new Date();
        }

        console.log("Update data:", updateData);

        const updatedPost = await prisma.post.update({
            where: { id },
            data: updateData,
            include: {
                author: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        });

        console.log("Updated post:", updatedPost);

        res.json({
            success: true,
            message: "Bài viết đã được cập nhật thành công",
            data: updatedPost,
        });
    } catch (error) {
        console.error("Error updating blog post:", error);
        console.error("Error details:", {
            message: error.message,
            code: error.code,
            meta: error.meta,
        });
        res.status(500).json({
            success: false,
            error: "Lỗi khi cập nhật bài viết: " + error.message,
        });
    }
};

// Delete a blog post
export const deleteBlogPost = async (req, res) => {
    try {
        const { id } = req.params;

        const existingPost = await prisma.post.findUnique({
            where: { id },
        });

        if (!existingPost) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy bài viết",
            });
        }

        // Check if user is the author or has admin privileges
        if (
            existingPost.authorId !== req.user.id &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                error: "Không có quyền xóa bài viết này",
            });
        }

        await prisma.post.delete({
            where: { id },
        });

        res.json({
            success: true,
            message: "Bài viết đã được xóa thành công",
        });
    } catch (error) {
        console.error("Error deleting blog post:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi xóa bài viết",
        });
    }
};

// Get published blog posts for homepage
export const getPublishedBlogPosts = async (req, res) => {
    try {
        const { limit = 6 } = req.query;

        const posts = await prisma.post.findMany({
            where: {
                isPublished: true,
            },
            take: parseInt(limit),
            include: {
                author: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
            },
            orderBy: {
                publishedAt: "desc",
            },
        });

        res.json({
            success: true,
            data: posts,
        });
    } catch (error) {
        console.error("Error fetching published blog posts:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi tải bài viết",
        });
    }
};

// Get blog categories
export const getBlogCategories = async (req, res) => {
    try {
        const categories = await prisma.post.groupBy({
            by: ["category"],
            where: {
                category: {
                    not: null,
                },
            },
            _count: {
                category: true,
            },
        });

        const formattedCategories = categories.map((cat) => ({
            name: cat.category,
            count: cat._count.category,
        }));

        res.json({
            success: true,
            data: formattedCategories,
        });
    } catch (error) {
        console.error("Error fetching blog categories:", error);
        res.status(500).json({
            success: false,
            error: "Lỗi khi tải danh mục bài viết",
        });
    }
};
