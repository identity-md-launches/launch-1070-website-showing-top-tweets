import assert from "node:assert/strict";
import { filterPosts, posts, readSaved, topics, xSearch } from "../src/data.ts";

const defaults = {
  query: "",
  topic: "All tweets" as const,
  savedOnly: false,
  saved: [] as string[],
  sort: "curated" as const,
};
assert.equal(
  new Set(posts.map((post) => post.id)).size,
  posts.length,
  "Unique bookmark identifiers",
);
for (const post of posts) {
  assert.ok(
    post.title && post.summary && post.sourceContext,
    "Complete editorial data",
  );
  assert.equal(new URL(post.source).protocol, "https:");
  if (post.xUrl)
    assert.match(post.xUrl, /^https:\/\/x\.com\/\w+\/status\/\d+$/);
  assert.ok(post.views === undefined || post.views >= 0);
}
assert.equal(filterPosts(defaults).length, 8);
assert.equal(
  filterPosts({ ...defaults, query: "  HaCkAtHoN " })[0]?.id,
  "swarm-hackathon",
);
assert.equal(filterPosts({ ...defaults, query: "LastToSign" }).length, 2);
for (const topic of topics.slice(1))
  assert.equal(filterPosts({ ...defaults, topic }).length, 2);
assert.equal(
  filterPosts({ ...defaults, topic: "Community", query: "hackathon" }).length,
  0,
);
assert.equal(filterPosts({ ...defaults, savedOnly: true }).length, 0);
assert.deepEqual(
  filterPosts({ ...defaults, savedOnly: true, saved: ["swarm-hackathon"] }).map(
    (post) => post.id,
  ),
  ["swarm-hackathon"],
);
assert.deepEqual(
  filterPosts({ ...defaults, sort: "views" })
    .map((post) => post.id)
    .slice(-2),
  ["community-coins", "worker-factory"],
);
assert.equal(
  filterPosts({ ...defaults, sort: "views" })[0]?.id,
  "participation-passes",
);
assert.equal(filterPosts({ ...defaults, sort: "author" })[0]?.author, "Adam");
assert.deepEqual(readSaved("{broken"), []);
assert.deepEqual(readSaved("{}"), []);
assert.deepEqual(
  readSaved('["swarm-hackathon","swarm-hackathon",null,"unknown"]'),
  ["swarm-hackathon"],
);
assert.ok(
  new URL(xSearch(posts[1])).searchParams
    .get("q")
    ?.includes("from:surfcoderepeat"),
);
console.log(
  "PASS: data integrity; case-insensitive search; combined topic filters; saved selection; all three sort orders; missing metrics last; malformed storage recovery; X search URLs.",
);
