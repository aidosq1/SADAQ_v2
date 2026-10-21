// Названия альбомов без повторов и пустых, в порядке появления
export function uniqueAlbums(items: { albumName?: string | null }[]): string[] {
  return [...new Set(items.map((item) => item.albumName).filter((name): name is string => !!name))];
}
