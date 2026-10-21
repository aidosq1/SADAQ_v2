// Распознавание клика, после которого роутер Next.js откроет другую страницу сайта

export interface LinkClick {
  // Адрес ссылки: абсолютный (a.href) или относительный
  href: string;
  target: string | null;
  hasDownload: boolean;
  button: number;
  // Нажат Ctrl, Cmd, Shift или Alt: ссылка откроется в новой вкладке или окне
  modified: boolean;
}

// Файлы (/uploads/…pdf) и API браузер открывает сам, роутер в этом не участвует
const NON_PAGE_PATH = /^\/api\/|\.[a-z0-9]+$/i;

export function isPageNavigation(click: LinkClick, current: URL): boolean {
  if (click.button !== 0 || click.modified || click.hasDownload) return false;
  if (click.target && click.target !== '_self') return false;

  let next: URL;
  try {
    next = new URL(click.href, current);
  } catch {
    return false;
  }

  if (next.origin !== current.origin || NON_PAGE_PATH.test(next.pathname)) return false;
  return next.pathname !== current.pathname || next.search !== current.search;
}
