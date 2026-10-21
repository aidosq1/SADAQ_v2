// Протоколы соревнований и рейтинговые документы для страницы «Результаты», по годам

export interface Protocol {
  id: number;
  title: string;
  titleKk?: string;
  titleEn?: string;
  eventDate: string;
  location: string;
  locationKk?: string;
  locationEn?: string;
  fileUrl?: string;
  year: number;
  source: 'protocol' | 'document';
}

export type GroupedProtocols = Record<string, Protocol[]>;

export interface RawProtocol {
  id: number;
  title: string;
  titleKk?: string;
  titleEn?: string;
  eventDate: string;
  location: string;
  locationKk?: string;
  locationEn?: string;
  fileUrl?: string;
  year: number;
}

export interface RawRatingDocument {
  id: number;
  title: string;
  titleKk?: string;
  titleEn?: string;
  fileUrl?: string;
  year?: number | null;
}

function fromProtocol(p: RawProtocol): Protocol {
  return {
    id: p.id,
    title: p.title,
    titleKk: p.titleKk,
    titleEn: p.titleEn,
    eventDate: p.eventDate,
    location: p.location,
    locationKk: p.locationKk,
    locationEn: p.locationEn,
    fileUrl: p.fileUrl,
    year: p.year,
    source: 'protocol',
  };
}

// У документов нет даты и места: они идут в конце года
function fromDocument(d: RawRatingDocument, currentYear: number): Protocol {
  return {
    id: d.id,
    title: d.title,
    titleKk: d.titleKk,
    titleEn: d.titleEn,
    eventDate: '',
    location: '',
    locationKk: '',
    locationEn: '',
    fileUrl: d.fileUrl,
    year: d.year || currentYear,
    source: 'document',
  };
}

// Протоколы с датой — сначала новые, документы без даты — в конце
function byDateDesc(a: Protocol, b: Protocol): number {
  const undated = Number(!a.eventDate) - Number(!b.eventDate);
  if (undated !== 0 || !a.eventDate) return undated;
  return new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime();
}

export function groupProtocols(
  protocols: RawProtocol[],
  documents: RawRatingDocument[],
  currentYear = new Date().getFullYear()
): GroupedProtocols {
  const all = [...protocols.map(fromProtocol), ...documents.map((d) => fromDocument(d, currentYear))];
  const years = [...new Set(all.map((p) => String(p.year)))];
  return Object.fromEntries(
    years.map((year) => [year, all.filter((p) => String(p.year) === year).sort(byDateDesc)])
  );
}
