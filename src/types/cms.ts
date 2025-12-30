// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

// News
export interface NewsItem {
  id: number;
  slug: string;
  title: string;
  titleKk?: string | null;
  titleEn?: string | null;
  content: string;
  contentKk?: string | null;
  contentEn?: string | null;
  excerpt?: string | null;
  excerptKk?: string | null;
  excerptEn?: string | null;
  category: string;
  image?: string | null;
  showInSlider: boolean;
  sliderOrder: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNewsBody {
  title: string;
  titleKk?: string;
  titleEn?: string;
  content: string;
  contentKk?: string;
  contentEn?: string;
  excerpt?: string;
  excerptKk?: string;
  excerptEn?: string;
  category: string;
  image?: string;
  showInSlider?: boolean;
  sliderOrder?: number;
}

// Slide
export interface Slide {
  id: number;
  title: string;
  titleKk?: string | null;
  titleEn?: string | null;
  description?: string | null;
  descriptionKk?: string | null;
  descriptionEn?: string | null;
  image: string;
  imageClass?: string | null;
  linkUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSlideBody {
  title: string;
  titleKk?: string;
  titleEn?: string;
  description?: string;
  descriptionKk?: string;
  descriptionEn?: string;
  image: string;
  imageClass?: string;
  linkUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

// National Team Membership
export interface NationalTeamMembership {
  id: number;
  athleteId: number;
  category: 'Adults' | 'Youth' | 'Juniors' | 'Cadets' | 'Cubs';
  gender: 'M' | 'F';
  type: 'Recurve' | 'Compound';
  joinedAt: string;
  isActive: boolean;
}

// Coach
export interface Coach {
  id: number;
  name: string;
  nameKk?: string | null;
  nameEn?: string | null;
  regionId?: number | null;
  region?: Region;
  phone?: string | null;
  email?: string | null;
  image?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Region {
  id: number;
  name: string;
  nameKk?: string | null;
  nameEn?: string | null;
}

// Athlete (объединяет спортсменов сборной и участников турниров)
export interface Athlete {
  id: number;
  slug: string;
  name: string;
  nameKk?: string | null;
  nameEn?: string | null;
  iin?: string | null;
  dob?: string | null;
  type: 'Recurve' | 'Compound';
  gender: 'M' | 'F';
  category: 'Adults' | 'Youth' | 'Juniors' | 'Cadets' | 'Cubs';
  regionId?: number | null;
  regionRef?: Region | null;
  image?: string | null;
  nationalTeamMemberships?: NationalTeamMembership[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  rankings?: RankingEntry[];
}

// Backwards compatibility alias
export type TeamMember = Athlete;

export interface CreateAthleteBody {
  name: string;
  nameKk?: string;
  nameEn?: string;
  iin?: string;
  dob?: string;
  type: string;
  gender: string;
  category: string;
  regionId?: number;
  image?: string;
  nationalTeamMemberships?: { category: string; gender: string; type: string }[];
  isActive?: boolean;
  sortOrder?: number;
}

export interface CreateCoachBody {
  name: string;
  nameKk?: string;
  nameEn?: string;
  regionId?: number;
  phone?: string;
  email?: string;
  image?: string;
  isActive?: boolean;
  sortOrder?: number;
}

// Backwards compatibility alias
export type CreateTeamMemberBody = CreateAthleteBody;

// Judge
export interface Judge {
  id: number;
  name: string;
  nameKk?: string | null;
  nameEn?: string | null;
  category: string;
  categoryKk?: string | null;
  categoryEn?: string | null;
  regionId?: number | null;
  region?: Region;
  phone?: string | null;
  email?: string | null;
  image?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJudgeBody {
  name: string;
  nameKk?: string;
  nameEn?: string;
  category: string;
  categoryKk?: string;
  categoryEn?: string;
  regionId?: number;
  phone?: string;
  email?: string;
  image?: string;
  isActive?: boolean;
  sortOrder?: number;
}

// Staff
export interface Staff {
  id: number;
  name: string;
  nameKk?: string | null;
  nameEn?: string | null;
  role: string;
  roleTitle: string;
  roleTitleKk?: string | null;
  roleTitleEn?: string | null;
  description?: string | null;
  descriptionKk?: string | null;
  descriptionEn?: string | null;
  department: 'leadership' | 'coaching' | 'committee';
  image?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffBody {
  name: string;
  nameKk?: string;
  nameEn?: string;
  role: string;
  roleTitle: string;
  roleTitleKk?: string;
  roleTitleEn?: string;
  description?: string;
  descriptionKk?: string;
  descriptionEn?: string;
  department: string;
  image?: string;
  sortOrder?: number;
  isActive?: boolean;
}

// Partner
export interface Partner {
  id: number;
  name: string;
  logo?: string | null;
  websiteUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  description?: string | null;
  descriptionKk?: string | null;
  descriptionEn?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePartnerBody {
  name: string;
  logo?: string;
  websiteUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  description?: string;
  descriptionKk?: string;
  descriptionEn?: string;
  sortOrder?: number;
  isActive?: boolean;
}

// Document
export interface Document {
  id: number;
  title: string;
  titleKk?: string | null;
  titleEn?: string | null;
  section: 'statute' | 'rules' | 'antidoping' | 'calendar' | 'ratings';
  fileUrl: string;
  fileType?: string | null;
  fileSize?: number | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentBody {
  title: string;
  titleKk?: string;
  titleEn?: string;
  section: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  sortOrder?: number;
  isPublished?: boolean;
}

// Ranking Entry
export interface RankingEntry {
  id: number;
  athleteId: number;
  athlete?: Athlete;
  category: 'Adults' | 'Youth' | 'Juniors' | 'Cadets' | 'Cubs';
  gender: 'M' | 'F';
  type: 'Recurve' | 'Compound';
  points: number;
  rank: number;
  classification?: string | null;
  updatedAt: string;
}

export interface CreateRankingBody {
  athleteId: number;
  category: string;
  gender: string;
  type: string;
  points: number;
  rank: number;
  classification?: string;
}

// Gallery Item
export interface GalleryItem {
  id: number;
  title: string;
  titleKk?: string | null;
  titleEn?: string | null;
  description?: string | null;
  descriptionKk?: string | null;
  descriptionEn?: string | null;
  type: 'photo' | 'video';
  url: string;
  thumbnailUrl?: string | null;
  albumName?: string | null;
  eventDate?: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGalleryItemBody {
  title: string;
  titleKk?: string;
  titleEn?: string;
  description?: string;
  descriptionKk?: string;
  descriptionEn?: string;
  type: string;
  url: string;
  thumbnailUrl?: string;
  albumName?: string;
  eventDate?: string;
  sortOrder?: number;
  isPublished?: boolean;
}
