export const topics = [
  "All tweets",
  "AI agents",
  "Builders",
  "Community",
  "Ecosystem",
] as const;
export type Topic = (typeof topics)[number];
export type Sort = "curated" | "views" | "author";
export type Post = {
  id: string;
  author: string;
  handle: string;
  initials: string;
  tone: string;
  title: string;
  summary: string;
  topic: Exclude<Topic, "All tweets">;
  source: string;
  sourceName: string;
  xUrl?: string;
  views?: number;
  sourceContext: string;
};
export const snapshotDate = "October 9, 2026";
export const posts: Post[] = [
  {
    id: "participation-passes",
    author: "LastToSign",
    handle: "LastToSign",
    initials: "LS",
    tone: "moss",
    title: "An identity. A seat. A whole new way to build.",
    summary:
      "LastToSign explores the shift from developer credentials to participation in an agent network, connecting Identity.md NFTs, verified work, and a community-owned company.",
    topic: "AI agents",
    source: "https://zamantika.com/ru/LastToSign/status/2089613122390708261",
    sourceName: "Zamantika",
    xUrl: "https://x.com/LastToSign/status/2089613122390708261",
    views: 36500,
    sourceContext:
      "Historical thread from August 18, 2026. The indexed mirror showed approximately 36.5K views. This is a summary of the author’s analysis, not a verification of its claims.",
  },
  {
    id: "swarm-hackathon",
    author: "Adam",
    handle: "surfcoderepeat",
    initials: "A",
    tone: "lime",
    title: "The swarm is building its own hackathon.",
    summary:
      "Adam reports a community-funded hackathon built and judged by distributed agents. The swarm also created the contract for the event.",
    topic: "Builders",
    source: "https://www.sotwe.com/imdradar",
    sourceName: "Sotwe",
    views: 11000,
    sourceContext:
      "Post by @surfcoderepeat, reposted in the indexed @imdradar timeline. Approximately 11K views in the retrieved snapshot. An exact post permalink was unavailable.",
  },
  {
    id: "swarm-chooses",
    author: "Identity Units",
    handle: "IdentityUnits",
    initials: "IU",
    tone: "sand",
    title: "Art made by agents. Collectors chosen by agents.",
    summary:
      "Identity Units describes a selection process using anonymous wallet histories, an agent review, and a separate raffle to choose collectors.",
    topic: "Community",
    source: "https://www.sotwe.com/imdradar",
    sourceName: "Sotwe",
    views: 13000,
    sourceContext:
      "Post by @IdentityUnits, reposted in the indexed @imdradar timeline. Approximately 13K views in the retrieved snapshot. An exact post permalink was unavailable.",
  },
  {
    id: "community-coins",
    author: "remp ♔",
    handle: "remp0x",
    initials: "r",
    tone: "blue",
    title: "A closer look at Community Coins.",
    summary:
      "A shared thread examines how the proposed Community Coins launcher connects new projects to IMD through a common trading pool. The reported mechanics were not independently verified.",
    topic: "Ecosystem",
    source:
      "https://theagenttimes.com/agents/article/identity-md-s-community-coins-launcher-routes-meme-token-fee-4d6cd5e2",
    sourceName: "The Agent Times",
    xUrl: "https://x.com/remp0x/status/2090051005245214869",
    sourceContext:
      "August 19, 2026 post linked by The Agent Times in its coverage of the thread. Engagement counts were unavailable. This historical summary does not describe verified current protocol behavior.",
  },
  {
    id: "radar-launch",
    author: "IMD Radar",
    handle: "imdradar",
    initials: "IR",
    tone: "moss",
    title: "A field guide to the IdentityMD ecosystem.",
    summary:
      "IMD Radar introduces a community directory for projects, tokens, swarm jobs, and copycat alerts, with an explicit statement that it has no token.",
    topic: "Ecosystem",
    source: "https://www.sotwe.com/imdradar",
    sourceName: "Sotwe",
    views: 9000,
    sourceContext:
      "Pinned introduction in the indexed @imdradar timeline. Approximately 9K views in the retrieved snapshot. This site is not affiliated with IMD Radar.",
  },
  {
    id: "worker-factory",
    author: "LastToSign",
    handle: "LastToSign",
    initials: "LS",
    tone: "moss",
    title: "From an idea to a reviewed piece of work.",
    summary:
      "An earlier thread walks through the proposed worker factory: receive a bounded task, implement it, submit the result, and pass review before a maintainer accepts the work.",
    topic: "Builders",
    source:
      "https://zamantika.com/ru/JesseTRutkowski/status/2089723838099587472",
    sourceName: "Zamantika",
    xUrl: "https://x.com/LastToSign/status/2086860795741184283",
    sourceContext:
      "Earlier @LastToSign thread quoted in the indexed August 18 discussion. No engagement counts for this quoted post were used. This is historical commentary.",
  },
  {
    id: "agent-review",
    author: "IMD Radar",
    handle: "imdradar",
    initials: "IR",
    tone: "moss",
    title: "One agent creates. Another checks the work.",
    summary:
      "A community explainer outlines the swarm’s division of labor: agents take jobs, other agents review results, and NFT seats represent participation in the network.",
    topic: "AI agents",
    source: "https://www.sotwe.com/imdradar",
    sourceName: "Sotwe",
    views: 831,
    sourceContext:
      "Post beginning “THE SWARM” in the indexed @imdradar timeline. 831 views in the retrieved snapshot. Operational claims belong to the author and were not independently audited.",
  },
  {
    id: "community-research",
    author: "Fran.Cisca",
    handle: "frans6cur",
    initials: "FC",
    tone: "rose",
    title: "Good research starts with a good map.",
    summary:
      "Fran.Cisca recommends IMD Radar as a starting point for following IdentityMD projects and researching the wider community.",
    topic: "Community",
    source: "https://www.sotwe.com/imdradar",
    sourceName: "Sotwe",
    views: 2000,
    sourceContext:
      "Post by @frans6cur, reposted in the indexed @imdradar timeline. Approximately 2K views in the retrieved snapshot. An exact post permalink was unavailable.",
  },
];

export function filterPosts({
  query,
  topic,
  savedOnly,
  saved,
  sort,
}: {
  query: string;
  topic: Topic;
  savedOnly: boolean;
  saved: string[];
  sort: Sort;
}): Post[] {
  const needle = query.trim().toLocaleLowerCase();
  const selected = posts.filter(
    (post) =>
      (topic === "All tweets" || post.topic === topic) &&
      (!savedOnly || saved.includes(post.id)) &&
      `${post.author} ${post.handle} ${post.title} ${post.summary} ${post.topic}`
        .toLocaleLowerCase()
        .includes(needle),
  );
  if (sort === "views")
    selected.sort((a, b) => (b.views ?? -1) - (a.views ?? -1));
  if (sort === "author")
    selected.sort((a, b) => a.author.localeCompare(b.author));
  return selected;
}

export function readSaved(raw: string | null): string[] {
  try {
    const value: unknown = JSON.parse(raw ?? "[]");
    return Array.isArray(value)
      ? [
          ...new Set(
            value.filter(
              (id): id is string =>
                typeof id === "string" && posts.some((post) => post.id === id),
            ),
          ),
        ]
      : [];
  } catch {
    return [];
  }
}

export function xSearch(post?: Post) {
  return `https://x.com/search?q=${encodeURIComponent(post ? `from:${post.handle} (IMD OR "identity.md")` : 'IdentityMD OR "identity.md"')}&f=top`;
}
