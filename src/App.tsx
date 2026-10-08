import { useEffect, useRef, useState } from "react";
import { BrandMark, Icon } from "./icons";
import {
  filterPosts,
  posts,
  readSaved,
  snapshotDate,
  topics,
  xSearch,
  type Post,
  type Sort,
  type Topic,
} from "./data";

const storageKey = "identitymd-signal:saved:v1";
const topicIcons = {
  "AI agents": "chip",
  Builders: "code",
  Community: "people",
  Ecosystem: "globe",
} as const;
const formatViews = (value: number) =>
  new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

function Avatar({ post, small = false }: { post: Post; small?: boolean }) {
  return (
    <span
      className={`avatar ${post.tone} ${small ? "small" : ""}`}
      aria-hidden="true"
    >
      {post.initials}
    </span>
  );
}

function PostCard({
  post,
  rank,
  saved,
  onSave,
  onDetails,
}: {
  post: Post;
  rank: number;
  saved: boolean;
  onSave: () => void;
  onDetails: () => void;
}) {
  return (
    <article className="post-card" aria-labelledby={`title-${post.id}`}>
      <div className="post-top">
        <Avatar post={post} />
        <div className="post-author">
          <a
            href={`https://x.com/${post.handle}`}
            target="_blank"
            rel="noreferrer"
          >
            {post.author}
            <span className="external-arrow" aria-hidden="true">
              ↗
            </span>
          </a>
          <span>@{post.handle}</span>
        </div>
        <span className="rank">
          <span className="sr-only">Collection position </span>#
          {String(rank).padStart(2, "0")}
        </span>
        <button
          className={`icon-button save-button ${saved ? "is-saved" : ""}`}
          aria-label={`${saved ? "Unsave" : "Save"} ${post.title}`}
          aria-pressed={saved}
          onClick={onSave}
          title={saved ? "Remove from saved tweets" : "Save tweet"}
        >
          <Icon name="bookmark" />
        </button>
      </div>
      <div className="post-copy">
        <span className="summary-label">Post summary</span>
        <h3 id={`title-${post.id}`}>{post.title}</h3>
        <p>{post.summary}</p>
      </div>
      <div className="post-footer">
        <span className="topic-tag">
          <Icon name={topicIcons[post.topic]} size={14} />
          {post.topic}
        </span>
        <button
          className="source-note"
          onClick={onDetails}
          aria-label={`${post.views ? `${formatViews(post.views)} views — ` : ""}Source notes for ${post.title}`}
        >
          <Icon name="eye" size={16} />
          {post.views ? `${formatViews(post.views)} views` : "Source notes"}
        </button>
        <a
          className="source-link"
          href={post.xUrl ?? post.source}
          target="_blank"
          rel="noreferrer"
        >
          {post.xUrl ? "View on X" : "Read source"}
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<Topic>("All tweets");
  const [sort, setSort] = useState<Sort>("curated");
  const [savedOnly, setSavedOnly] = useState(window.location.hash === "#saved");
  const [saved, setSaved] = useState<string[]>(() => {
    try {
      return readSaved(localStorage.getItem(storageKey));
    } catch {
      return [];
    }
  });
  const [status, setStatus] = useState("");
  const [storageError, setStorageError] = useState(false);
  const [detail, setDetail] = useState<Post | "about" | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const filtered = filterPosts({ query, topic, sort, savedOnly, saved });
  const voices = new Set(posts.map((post) => post.handle)).size;

  useEffect(() => {
    const onHash = () => setSavedOnly(window.location.hash === "#saved");
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        event.key === "/" &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !target.closest(
          'input, textarea, select, [contenteditable="true"], dialog',
        )
      ) {
        event.preventDefault();
        search.current?.focus();
      }
    };
    window.addEventListener("hashchange", onHash);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (detail) dialog.current?.showModal();
  }, [detail]);

  function navigate(toSaved: boolean) {
    setSavedOnly(toSaved);
    setQuery("");
    setTopic("All tweets");
    setSort("curated");
  }
  function toggleSave(post: Post) {
    const removing = saved.includes(post.id);
    const next = removing
      ? saved.filter((id) => id !== post.id)
      : [...saved, post.id];
    setSaved(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setStorageError(false);
      setStatus(
        removing ? "Tweet removed from saved." : "Tweet saved on this device.",
      );
    } catch {
      setStorageError(true);
      setStatus(
        "Saved for this visit. Browser storage is unavailable; enable site storage to keep your saved tweets.",
      );
    }
  }
  function resetFilters() {
    setQuery("");
    setTopic("All tweets");
    setSort("curated");
    search.current?.focus();
  }
  function selectTopic(value: Topic) {
    setTopic(value);
    document.getElementById("feed")?.scrollIntoView({ block: "start" });
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="sidebar" aria-label="Site navigation">
        <a
          className="brand"
          href="#feed"
          onClick={() => navigate(false)}
          aria-label="IdentityMD Signal home"
        >
          <span className="brand-icon">
            <BrandMark />
          </span>
          <span>
            identity<span className="brand-md">md</span>
            <small>Signal station</small>
          </span>
        </a>
        <div className="sidebar-divider" />
        <span className="nav-label">Your outpost</span>
        <nav className="main-nav" aria-label="Main">
          <a
            href="#feed"
            onClick={() => navigate(false)}
            aria-current={!savedOnly ? "page" : undefined}
          >
            <Icon name="feed" />
            <span>The feed</span>
            <span className="nav-dot" />
          </a>
          <a
            href="#saved"
            onClick={() => navigate(true)}
            aria-current={savedOnly ? "page" : undefined}
          >
            <Icon name="bookmark" />
            <span>Saved tweets</span>
            <span className="nav-count">{saved.length}</span>
          </a>
          <button onClick={() => setDetail("about")}>
            <Icon name="info" />
            <span>About the signal</span>
          </button>
        </nav>
        <div className="sidebar-topics">
          <span className="nav-label">Explore the network</span>
          {topics.slice(1).map((value) => (
            <a
              href="#feed"
              key={value}
              onClick={() => {
                navigate(false);
                setTopic(value);
              }}
            >
              <Icon name={topicIcons[value as keyof typeof topicIcons]} />
              {value}
            </a>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="outpost-art" aria-hidden="true">
            <img src="./assets/pepe-scout.webp" alt="" />
          </div>
          <p>
            Armed with AI.
            <br />
            <strong>Powered by frens.</strong>
          </p>
          <span className="edition">
            <span />
            Independent community project
          </span>
          <div className="sidebar-foot">
            Less scrolling. More knowing.<span>v1.0</span>
          </div>
        </div>
      </aside>

      <div className="app-shell">
        <header className="topbar">
          <div className="breadcrumb">
            The network <span>/</span> <strong>Signal</strong>
          </div>
          <div className="topbar-end">
            <label className="search-box">
              <Icon name="search" size={18} />
              <span className="sr-only">Search tweets</span>
              <input
                ref={search}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the signal…"
                name="search"
                autoComplete="off"
              />
              <kbd aria-hidden="true">/</kbd>
            </label>
            <span className="community-badge">
              <span />
              Community edition
            </span>
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          <div className="page-intro">
            <div className="eyebrow">
              <Icon name="radar" size={15} />
              The IdentityMD conversation
            </div>
            <span className="snapshot">
              Snapshot <span>·</span> Oct 9, 2026
            </span>
          </div>
          <section className="hero" aria-labelledby="hero-title">
            <img
              className="hero-art"
              src="./assets/pepe-scout.webp"
              alt="Two Pepe scouts equipped with AI visors, a data scanner, and a command-center computer."
              fetchPriority="high"
            />
            <div className="hero-shade" />
            <div className="hero-copy">
              <div className="hero-kicker">
                <span />
                Signal over noise
              </div>
              <h1 id="hero-title">
                Big ideas.
                <br />
                Green energy.
              </h1>
              <p>
                The best of IdentityMD, all in one feed.
                <br />
                AI agents, big builds, and a very online army of Pepes.
              </p>
              <a
                className="primary-button"
                href={xSearch()}
                target="_blank"
                rel="noreferrer"
              >
                Explore on X<Icon name="arrow" size={17} />
              </a>
            </div>
            <span className="hero-coordinate" aria-hidden="true">
              PEPE INTELLIGENCE DIVISION / 001
            </span>
          </section>

          <div
            className="collection-stats"
            role="group"
            aria-label="Collection overview"
          >
            <div>
              <span className="stat-icon">
                <Icon name="feed" />
              </span>
              <div>
                <strong>{String(posts.length).padStart(2, "0")}</strong>
                <span>Curated tweets</span>
              </div>
              <span className="stat-detail">Worth your attention</span>
            </div>
            <div>
              <span className="stat-icon">
                <Icon name="people" />
              </span>
              <div>
                <strong>{String(voices).padStart(2, "0")}</strong>
                <span>Community voices</span>
              </div>
              <span className="stat-detail">One shared rabbit hole</span>
            </div>
            <div>
              <span className="stat-icon">
                <Icon name="globe" />
              </span>
              <div>
                <strong>04</strong>
                <span>Topics to explore</span>
              </div>
              <span className="stat-detail">Follow your curiosity</span>
            </div>
          </div>

          <div className="content-grid">
            <section
              id="feed"
              className="feed-section"
              aria-labelledby="feed-title"
            >
              <div className="feed-heading">
                <div>
                  <h2 id="feed-title">
                    {savedOnly ? "Saved tweets" : "On the radar"}
                    <span className="heading-dot" />
                  </h2>
                  <p>
                    {savedOnly
                      ? "The ideas you’re keeping close. Saved on this device."
                      : "Good posts. Interesting people. A little less doomscrolling."}
                  </p>
                </div>
              </div>
              <div className="feed-toolbar">
                <div className="feed-tabs" role="group" aria-label="Feed view">
                  <a
                    href="#feed"
                    aria-current={!savedOnly ? "page" : undefined}
                    onClick={() => navigate(false)}
                  >
                    <Icon name="spark" size={16} />
                    Top picks
                  </a>
                  <a
                    href="#saved"
                    aria-current={savedOnly ? "page" : undefined}
                    onClick={() => navigate(true)}
                  >
                    <Icon name="bookmark" size={16} />
                    Saved<span>{saved.length}</span>
                  </a>
                </div>
                <label className="sort-control">
                  <Icon name="sliders" size={15} />
                  <span className="sr-only">Sort tweets</span>
                  <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value as Sort)}
                  >
                    <option value="curated">Editor’s order</option>
                    <option value="views">Most viewed</option>
                    <option value="author">Author A–Z</option>
                  </select>
                </label>
              </div>
              <div
                className="topic-filters"
                role="group"
                aria-label="Filter by topic"
              >
                {topics.map((value) => (
                  <button
                    key={value}
                    className={topic === value ? "selected" : ""}
                    onClick={() => setTopic(value)}
                    aria-pressed={topic === value}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <div className="result-meta">
                <span role="status" aria-live="polite">
                  {filtered.length} {filtered.length === 1 ? "tweet" : "tweets"}
                  {query
                    ? ` matching “${query}”`
                    : topic !== "All tweets"
                      ? ` in ${topic}`
                      : " in this collection"}
                </span>
                <button onClick={() => setDetail("about")}>
                  How we curate
                  <Icon name="info" size={13} />
                </button>
              </div>
              <div className="post-list">
                {filtered.map((post, index) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    rank={index + 1}
                    saved={saved.includes(post.id)}
                    onSave={() => toggleSave(post)}
                    onDetails={() => setDetail(post)}
                  />
                ))}
              </div>
              {filtered.length === 0 && (
                <div className="empty-state">
                  <span className="empty-icon">
                    <Icon
                      name={savedOnly && !saved.length ? "bookmark" : "search"}
                      size={30}
                    />
                  </span>
                  <h3>
                    {savedOnly && !saved.length
                      ? "Keep a little signal for later."
                      : "No signal on this frequency."}
                  </h3>
                  <p>
                    {savedOnly && !saved.length
                      ? "Use the bookmark on any tweet to add it here. Your collection stays on this device."
                      : `No tweets match ${query ? `“${query}”` : "these filters"}. Try another topic or clear your search.`}
                  </p>
                  {savedOnly && !saved.length ? (
                    <a
                      className="secondary-button"
                      href="#feed"
                      onClick={() => navigate(false)}
                    >
                      Explore the feed
                      <Icon name="arrow" size={16} />
                    </a>
                  ) : (
                    <button className="secondary-button" onClick={resetFilters}>
                      Clear filters
                      <Icon name="close" size={16} />
                    </button>
                  )}
                </div>
              )}
              <div className="feed-end">
                <Icon name="check" size={15} />
                {filtered.length
                  ? "You’re all caught up with this collection."
                  : "A quieter feed is only a filter away."}
                <span>Stay curious, fren.</span>
              </div>
            </section>

            <aside
              className="right-rail"
              aria-label="Explore and collection information"
            >
              <section className="rail-card topics-card">
                <div className="rail-heading">
                  <h2>Follow the threads</h2>
                  <Icon name="spark" size={17} />
                </div>
                <p>Find your corner of the conversation.</p>
                {topics.slice(1).map((value, index) => (
                  <button
                    className="topic-row"
                    key={value}
                    onClick={() => selectTopic(value)}
                  >
                    <span className="topic-number">0{index + 1}</span>
                    <div>
                      <strong>{value}</strong>
                      <span>
                        {posts.filter((post) => post.topic === value).length}{" "}
                        curated posts
                      </span>
                    </div>
                    <Icon name="chevron" size={16} />
                  </button>
                ))}
              </section>
              <section className="field-note">
                <div className="eyebrow">
                  <Icon name="chip" size={16} />A note from the outpost
                </div>
                <h2>
                  Small frogs.
                  <br />
                  Big intelligence.
                </h2>
                <p>
                  The future is being built by people with ideas and agents with
                  tools. We’re here for the conversation.
                </p>
                <span className="note-signature">
                  Curiosity is the superpower. <span>↗</span>
                </span>
                <div className="note-decoration" aria-hidden="true">
                  ⌘
                </div>
              </section>
              <section className="rail-card voices-card">
                <div className="rail-heading">
                  <h2>Voices in the feed</h2>
                  <Icon name="people" size={17} />
                </div>
                {[posts[1], posts[0], posts[2]].map((post) => (
                  <a
                    href={`https://x.com/${post.handle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="voice-row"
                    key={post.id}
                  >
                    <Avatar post={post} small />
                    <span>
                      <strong>{post.author}</strong>
                      <small>@{post.handle}</small>
                    </span>
                    <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </section>
              <div className="curation-note">
                <Icon name="info" size={16} />
                <p>
                  A curated snapshot, not a live feed. Summaries and view counts
                  come from indexed public sources.{" "}
                  <button onClick={() => setDetail("about")}>
                    Read our approach ↗
                  </button>
                </p>
              </div>
            </aside>
          </div>
          <footer className="page-footer">
            <span>
              <BrandMark />
              Built for the curious. Made for the community.
            </span>
            <button onClick={() => setDetail("about")}>
              About & sources ↗
            </button>
          </footer>
        </main>
      </div>

      <div
        className={`toast ${storageError ? "storage-error" : ""}`}
        role="status"
        aria-live="polite"
      >
        {status && (
          <>
            <Icon name={storageError ? "info" : "check"} size={18} />
            <span>{status}</span>
            <button
              className="icon-button"
              aria-label="Dismiss notification"
              onClick={() => setStatus("")}
            >
              <Icon name="close" size={16} />
            </button>
          </>
        )}
      </div>
      <dialog
        ref={dialog}
        className="info-dialog"
        aria-labelledby="dialog-title"
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = event.currentTarget.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input, select, textarea, [tabindex="0"]',
          );
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
        onClose={() => setDetail(null)}
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current.close();
        }}
      >
        <div className="dialog-inner">
          <div className="dialog-top">
            <span className="eyebrow">
              <Icon name="radar" size={16} />
              Behind the signal
            </span>
            <button
              className="icon-button"
              autoFocus
              aria-label="Close information"
              onClick={() => dialog.current?.close()}
            >
              <Icon name="close" />
            </button>
          </div>
          {detail === "about" ? (
            <>
              <h2 id="dialog-title">Good context. Clear sources.</h2>
              <p>
                IdentityMD Signal is an independent community reading list about
                IdentityMD. “Top picks” means editorial selection for relevance
                and variety, not a complete or algorithmic ranking of X.
              </p>
              <h3>A snapshot, not a live feed</h3>
              <p>
                This collection was assembled on {snapshotDate}. Each card is an
                editorial summary, not a verbatim tweet. X blocked direct
                reading, so the collection uses indexed public mirrors and
                reporting linked from each card.
              </p>
              <h3>What the numbers mean</h3>
              <p>
                Views are approximate counts shown by the source when retrieved.
                They may be stale or inconsistent. Missing counts stay unknown
                and sort last. “Editor’s order” follows the reading list; “Most
                viewed” sorts available snapshot counts.
              </p>
              <h3>Your saved collection</h3>
              <p>
                Bookmarks stay in this browser’s local storage. No login,
                analytics, wallet connection, or account sync. Clear your
                browser’s site data to remove them. Nothing you save changes a
                post on X.
              </p>
              <h3>Read the originals</h3>
              <p>
                “View on X” opens an identified post. “Read source” opens the
                indexed timeline where an exact post link was unavailable.
                External sources may require login or become unavailable. The
                opinions belong to their authors.
              </p>
              <a
                className="secondary-button"
                href={xSearch()}
                target="_blank"
                rel="noreferrer"
              >
                Search IdentityMD on X<Icon name="arrow" size={16} />
              </a>
            </>
          ) : (
            detail && (
              <>
                <h2 id="dialog-title">{detail.title}</h2>
                <p className="dialog-author">
                  @{detail.handle} · Collected {snapshotDate}
                </p>
                <p>{detail.sourceContext}</p>
                <p>
                  Cards contain editorial summaries. Source claims and
                  approximate view counts are not independently verified.
                </p>
                <div className="dialog-actions">
                  <a
                    className="secondary-button"
                    href={detail.source}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Read {detail.sourceName} source ↗
                  </a>
                  <a
                    className="text-link"
                    href={detail.xUrl ?? xSearch(detail)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {detail.xUrl
                      ? "View original on X"
                      : "Search this author on X"}{" "}
                    ↗
                  </a>
                </div>
              </>
            )
          )}
        </div>
      </dialog>
    </>
  );
}
