import { useMemo, useRef, useState, type FormEvent } from 'react';
import { canEmbed, extractInstagramLinks } from '../instagram';
import { colorVars } from '../colors';
import { useStore } from '../store/StoreProvider';
import type { InspirationPost } from '../types';
import { ConfirmDialog } from './ConfirmDialog';
import { CameraIcon, ExternalIcon, TrashIcon } from './Icons';
import { useAutosize } from './useAutosize';

/** Instagram's own data exports can be large, but a list of links never needs more than this. */
const MAX_IMPORT_BYTES = 25 * 1024 * 1024;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

interface Status {
  tone: 'ok' | 'warn';
  message: string;
}

/** A place to dump Instagram posts you want to remember, as links, with a note on why. */
export function InspirationView() {
  const { inspiration, addInspiration, deleteInspiration } = useStore();
  const [text, setText] = useState('');
  const [status, setStatus] = useState<Status | null>(null);
  const [removing, setRemoving] = useState<InspirationPost | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const posts = useMemo(() => [...inspiration].sort((a, b) => b.addedAt - a.addedAt), [inspiration]);

  /** Saves every post link found in `source`. Returns true if there was anything to save. */
  function saveLinksFrom(source: string): boolean {
    const links = extractInstagramLinks(source);
    if (links.length === 0) {
      setStatus({
        tone: 'warn',
        message: 'I couldn’t find any Instagram post links in that. They look like instagram.com/p/… or instagram.com/reel/…',
      });
      return false;
    }
    const { added, duplicates } = addInspiration(links);
    if (added === 0) {
      setStatus({ tone: 'warn', message: links.length === 1 ? 'That post is already saved.' : 'Those posts are already saved.' });
    } else {
      const extra = duplicates > 0 ? `, ${duplicates} already saved` : '';
      setStatus({ tone: 'ok', message: `Added ${plural(added, 'post')}${extra}.` });
    }
    return true;
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (saveLinksFrom(text)) setText('');
  }

  async function onFile(input: HTMLInputElement) {
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      setStatus({ tone: 'warn', message: 'That file is too big. Pick the single file that lists your saved posts, not the whole export.' });
      return;
    }
    saveLinksFrom(await file.text());
  }

  return (
    <section className="panel panel--wide" style={colorVars('pink')}>
      <header className="folder-head">
        <span className="swatch-btn swatch-btn--static" aria-hidden="true">
          <CameraIcon />
        </span>
        <h1 className="folder-title folder-title--static">Instagram inspiration</h1>
      </header>
      <p className="folder-meta">{plural(posts.length, 'saved post')}</p>

      <form className="insp-dump" onSubmit={onSubmit}>
        <textarea
          className="insp-dump-text"
          aria-label="Instagram links"
          placeholder="Paste Instagram links here: one, or a whole pile at once"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="insp-dump-actions">
          <button type="submit" className="btn btn--primary" disabled={!text.trim()}>
            Add to inspiration
          </button>
          <button type="button" className="btn btn--ghost btn--small" onClick={() => fileRef.current?.click()}>
            Import Instagram data file
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,.html,.htm,.txt,application/json,text/html,text/plain"
            hidden
            onChange={(e) => void onFile(e.currentTarget)}
          />
        </div>
        {status && (
          <p className={`insp-status insp-status--${status.tone}`} role="status">
            {status.message}
          </p>
        )}
      </form>

      <details className="insp-help">
        <summary>Why can’t I connect my Instagram account?</summary>
        <p>
          Instagram doesn’t let other apps read your Saved posts, so Artful can’t sync them automatically. Two ways to
          bring them over:
        </p>
        <ol>
          <li>
            <strong>Paste links.</strong> On any post, tap Share, then Copy link, and paste it above. You can paste as
            many as you like at once.
          </li>
          <li>
            <strong>Import your Instagram data.</strong> In Instagram, open Accounts Center, then Your information and
            permissions, then Download your information, and ask for your data as JSON (or HTML). Unzip what Instagram
            sends you, then choose the file that lists your saved posts. Artful pulls every post link out of it.
          </li>
        </ol>
        <p>Posts are saved as links only. “Show post” loads the post from Instagram when you click it.</p>
      </details>

      {posts.length > 0 ? (
        <ul className="insp-grid">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} onRemove={() => setRemoving(p)} />
          ))}
        </ul>
      ) : (
        <p className="empty">Nothing saved yet. Paste a few links above to start your mood board.</p>
      )}

      {removing && (
        <ConfirmDialog
          title="Remove this post?"
          message="It only disappears from Artful. It stays saved on Instagram."
          confirmLabel="Remove"
          onCancel={() => setRemoving(null)}
          onConfirm={() => {
            deleteInspiration(removing.id);
            setRemoving(null);
          }}
        />
      )}
    </section>
  );
}

const KIND_LABEL = { p: 'Post', reel: 'Reel', tv: 'Video' } as const;

function PostCard({ post, onRemove }: { post: InspirationPost; onRemove: () => void }) {
  const { editInspirationNote } = useStore();
  const [showing, setShowing] = useState(false);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  useAutosize(noteRef, post.note);

  const label = KIND_LABEL[post.kind];
  const shortLink = post.url.replace(/^https:\/\/www\./, '').replace(/\/$/, '');

  return (
    <li className="insp-card">
      {showing ? (
        // Nothing is requested from Instagram until the person asks to see the post.
        <iframe
          className="insp-embed"
          src={`${post.url}embed/`}
          title={`Instagram ${label.toLowerCase()}`}
          loading="lazy"
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        />
      ) : (
        <div className="insp-placeholder" aria-hidden="true">
          <CameraIcon />
          <span>{label}</span>
        </div>
      )}

      <a className="insp-link" href={post.url} target="_blank" rel="noopener noreferrer">
        {shortLink}
        <ExternalIcon />
        <span className="sr-only"> (opens Instagram in a new tab)</span>
      </a>

      <textarea
        ref={noteRef}
        className="insp-note"
        rows={2}
        aria-label={`Note for ${label.toLowerCase()} ${shortLink}`}
        placeholder="Why does this inspire you?"
        value={post.note}
        onChange={(e) => editInspirationNote(post.id, e.target.value)}
      />

      <div className="insp-actions">
        {canEmbed(post.url) && (
          <button type="button" className="btn btn--small" aria-pressed={showing} onClick={() => setShowing((v) => !v)}>
            {showing ? 'Hide post' : 'Show post'}
          </button>
        )}
        <button type="button" className="icon-btn icon-btn--danger" aria-label="Remove post" title="Remove post" onClick={onRemove}>
          <TrashIcon />
        </button>
      </div>
    </li>
  );
}
