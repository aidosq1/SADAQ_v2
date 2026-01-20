'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface BulkGalleryItemData {
    url: string;
    title: string;
    type: 'photo';
    sortOrder: number;
}

export interface BulkGalleryMetadata {
    title?: string;
    description?: string;
    eventDate?: Date | null;
    albumName?: string;
    isPublished?: boolean;
    cloudUrl?: string;
}

export async function createBulkGalleryItems(
    items: BulkGalleryItemData[],
    metadata: BulkGalleryMetadata
) {
    try {
        if (!items || items.length === 0) {
            return { success: false, error: 'No items provided' };
        }

        // Default metadata
        const commonData = {
            title: metadata.title || 'Untitled',
            description: metadata.description,
            eventDate: metadata.eventDate,
            albumName: metadata.albumName,
            isPublished: metadata.isPublished ?? true,
            type: 'photo',
            cloudUrl: metadata.cloudUrl || null,
        };

        // Prepare data for createMany
        const dataToCreate = items.map((item) => ({
            ...commonData,
            // If item has specific title use it, otherwise use common title + index or just common title
            title: item.title || commonData.title,
            url: item.url,
            sortOrder: item.sortOrder,
        }));

        const result = await prisma.galleryItem.createMany({
            data: dataToCreate,
        });

        revalidatePath('/[locale]/admin/gallery');
        revalidatePath('/[locale]/media'); // Assuming public gallery is here

        return {
            success: true,
            count: result.count,
            message: `Successfully created ${result.count} items`
        };
    } catch (error) {
        console.error('Error in createBulkGalleryItems:', error);
        return { success: false, error: 'Failed to create gallery items' };
    }
}

export async function deleteGalleryGroup(albumName: string) {
    try {
        if (!albumName) {
            return { success: false, error: 'Album name is required' };
        }

        const result = await prisma.galleryItem.deleteMany({
            where: { albumName },
        });

        revalidatePath('/[locale]/admin/gallery');
        revalidatePath('/[locale]/media');

        return { success: true, message: `Deleted ${result.count} items` };
    } catch (error) {
        console.error('Error deleting gallery group:', error);
        return { success: false, error: 'Failed to delete group' };
    }
}

export async function updateGalleryGroup(
    oldAlbumName: string,
    data: {
        albumName: string;
        title: string;
        eventDate: Date | null;
        isPublished: boolean;
        cloudUrl?: string | null;
    }
) {
    try {
        if (!oldAlbumName) {
            return { success: false, error: 'Old album name is required' };
        }

        const result = await prisma.galleryItem.updateMany({
            where: { albumName: oldAlbumName },
            data: {
                albumName: data.albumName,
                title: data.title,
                eventDate: data.eventDate,
                isPublished: data.isPublished,
                cloudUrl: data.cloudUrl,
            },
        });

        revalidatePath('/[locale]/admin/gallery');
        revalidatePath('/[locale]/media');

        return { success: true, message: `Updated ${result.count} items` };
    } catch (error) {
        console.error('Error updating gallery group:', error);
        return { success: false, error: 'Failed to update group' };
    }
}

export async function deleteGalleryItem(id: number) {
    try {
        await prisma.galleryItem.delete({
            where: { id },
        });
        revalidatePath('/[locale]/admin/gallery');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete item' };
    }
}
