import git from "isomorphic-git";
import fs from "fs";
import path from "path";

const dir = process.cwd();

async function main() {
  console.log("Initializing git repository in:", dir);
  await git.init({ fs, dir, defaultBranch: "main" });

  // List of files to ignore or directories
  const ignoreList = [
    "node_modules",
    ".node22",
    ".next",
    ".git",
    ".env.local",
    "coverage",
    "build",
    "dist"
  ];

  function getFiles(currentDir, relativePath = "") {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    let files = [];
    for (const entry of entries) {
      if (ignoreList.includes(entry.name)) continue;
      const fullPath = path.join(currentDir, entry.name);
      const rel = relativePath ? `${relativePath}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        files = files.concat(getFiles(fullPath, rel));
      } else {
        files.push(rel);
      }
    }
    return files;
  }

  const filesToAdd = getFiles(dir);
  console.log(`Found ${filesToAdd.length} files to stage.`);

  for (const filepath of filesToAdd) {
    await git.add({ fs, dir, filepath });
  }

  const sha = await git.commit({
    fs,
    dir,
    author: {
      name: "Sabir",
      email: "sabir@breatheiq.local",
    },
    message: "Initial commit: BreatheIQ - Real-Time Air Quality Intelligence Platform",
  });

  console.log("Commit successful! SHA:", sha);
  const currentBranch = await git.currentBranch({ fs, dir });
  console.log("Current branch:", currentBranch);
}

main().catch(err => {
  console.error("Git operation failed:", err);
  process.exit(1);
});

