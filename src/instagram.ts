/**
 * Finding Instagram post links in pasted text or an exported file.
 *
 * Instagram gives apps no way to read a person's Saved list, so Artful keeps the links
 * people bring over themselves: pasted in, or pulled out of Instagram's "Download your
 * information" export. That export's layout changes over time, so instead of parsing a
 * particular file format we simply scan any text for post links.
 */

export type PostKind = 'p' | 'reel' | 'tv';

export interface InstagramLink {
  kind: PostKind;
  /** Clean link: the username prefix and tracking parameters (?igsh=…) are dropped. */
  url: string;
}

// instagram.com/p/CODE, /reel/CODE, /tv/CODE, optionally behind a username (instagram.com/name/p/CODE)
// or the app's share form (instagram.com/share/reel/ID). The scheme is optional, and the lookbehind
// keeps look-alike hosts (notinstagram.com, l.instagram.com) from matching.
const LINK =
  /(?<![\w.-])(?:https?:\/\/)?(?:www\.|m\.)?(?:instagram\.com|instagr\.am)\/(?:(share)\/|[\w.]+\/)?(p|reels?|tv)\/([\w-]+)/gi;

export function extractInstagramLinks(text: string): InstagramLink[] {
  const seen = new Set<string>();
  const links: InstagramLink[] = [];

  // JSON files escape slashes (https:\/\/…), so undo that before scanning.
  for (const match of text.replaceAll('\\/', '/').matchAll(LINK)) {
    const [, share, rawKind, code] = match;
    const kind: PostKind = rawKind.toLowerCase().startsWith('reel') ? 'reel' : rawKind.toLowerCase() === 'tv' ? 'tv' : 'p';
    const url = `https://www.instagram.com/${share ? 'share/' : ''}${kind}/${code}/`;
    if (seen.has(url)) continue;
    seen.add(url);
    links.push({ kind, url });
  }
  return links;
}

/** Share links (instagram.com/share/…) only redirect on Instagram's side, so they can't be embedded. */
export function canEmbed(url: string): boolean {
  return !url.includes('/share/');
}
