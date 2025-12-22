'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { slugify } from '@/lib/utils'; // Assuming this utility exists or I'll implement a simple one

// Helper if slugify doesn't exist in utils, but usually it does. 
// If not, I'll iterate or just do a simple replacement.
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '') + '-' + Math.random().toString(36).substring(2, 7);
}

export interface NewsData {
    title: string;
    titleKk?: string;
    titleEn?: string;
    content: string;
    contentKk?: string;
    contentEn?: string;
    image?: string;
    category: string;
    publishedAt?: string | Date | null;
    showInSlider?: boolean;
}

export async function createNews(data: NewsData) {
    try {
        // 1. Logic for Date: Use provided date or current server time
        const publishedAt = data.publishedAt ? new Date(data.publishedAt) : new Date();

        // 2. Generate slug
        const slug = generateSlug(data.title);

        // 3. Create record
        const newsItem = await prisma.news.create({
            data: {
                title: data.title,
                titleKk: data.titleKk,
                titleEn: data.titleEn,
                content: data.content,
                contentKk: data.contentKk,
                contentEn: data.contentEn,
                image: data.image,
                category: data.category,
                publishedAt: publishedAt, // <--- The core logic
                slug: slug,
                showInSlider: data.showInSlider || false,
            },
        });

        revalidatePath('/[locale]/news');
        revalidatePath('/[locale]/admin/news');

        return { success: true, data: newsItem };
    } catch (error) {
        console.error('Error creating news:', error);
        return { success: false, error: 'Failed to create news' };
    }
}

export async function updateNews(id: number, data: Partial<NewsData>) {
    try {
        const updateData: any = { ...data };

        // If publishedAt is explicitly passed as null/undefined, do we wipe it? 
        // Usually update preserves if not passed. 
        // If passed as string, convert to Date.
        if (data.publishedAt) {
            updateData.publishedAt = new Date(data.publishedAt);
        }

        const newsItem = await prisma.news.update({
            where: { id },
            data: updateData,
        });

        revalidatePath('/[locale]/news');
        revalidatePath('/[locale]/admin/news');

        return { success: true, data: newsItem };
    } catch (error) {
        console.error('Error updating news:', error);
        return { success: false, error: 'Failed to update news' };
    }
}

export async function deleteNews(id: number) {
    try {
        await prisma.news.delete({ where: { id } });
        revalidatePath('/[locale]/news');
        revalidatePath('/[locale]/admin/news');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete news' };
    }
}
