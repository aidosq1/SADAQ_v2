import prisma from './prisma';

export interface HeroSlide {
  id: number;
  title: string;
  titleKk: string | null;
  titleEn: string | null;
  description: string | null;
  descriptionKk: string | null;
  descriptionEn: string | null;
  image: string;
  linkUrl: string;
  sortOrder: number;
  isActive: boolean;
}

// Новости с флагом showInSlider в формате слайда главной
export async function getHeroSlides(limit = 10): Promise<HeroSlide[]> {
  const news = await prisma.news.findMany({
    where: { showInSlider: true },
    orderBy: { sliderOrder: 'asc' },
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      titleKk: true,
      titleEn: true,
      excerpt: true,
      excerptKk: true,
      excerptEn: true,
      image: true,
      sliderOrder: true,
    },
  });

  return news
    .filter((item) => item.image)
    .map((item) => ({
      id: item.id,
      title: item.title,
      titleKk: item.titleKk,
      titleEn: item.titleEn,
      description: item.excerpt,
      descriptionKk: item.excerptKk,
      descriptionEn: item.excerptEn,
      image: item.image as string,
      linkUrl: `/media/news/${item.slug}`,
      sortOrder: item.sliderOrder,
      isActive: true,
    }));
}
