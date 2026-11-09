import git from "isomorphic-git";
import http from "isomorphic-git/http/node/index.js";
import fs from "fs";

const dir = process.cwd();
const remoteUrl = process.argv[2];
const token = process.env.GITHUB_TOKEN || process.argv[3];

if (!remoteUrl) {
  console.log("Usage: node scripts/git-push.mjs <github-repo-url> [github-token]");
  console.log("Example: node scripts/git-push.mjs https://github.com/username/breatheiq.git ghp_yourPersonalAccessToken");
  process.exit(1);
}

async function push() {
  console.log(`Setting remote 'origin' to: ${remoteUrl}`);
  try {
    await git.deleteRemote({ fs, dir, remote: "origin" });
  } catch {}
  await git.addRemote({ fs, dir, remote: "origin", url: remoteUrl });

  console.log("Pushing main branch to origin...");
  const pushResult = await git.push({
    fs,
    http,
    dir,
    remote: "origin",
    ref: "main",
    onAuth: () => ({ username: token || "oauth2", password: "" }),
  });
  console.log("Push completed successfully!", pushResult);
}

push().catch(err => {
  console.error("Push failed:", err);
  process.exit(1);
});
