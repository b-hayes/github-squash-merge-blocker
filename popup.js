const DEFAULTS = ["qa", "main", "master"];
const ta = document.getElementById("branches");
const status = document.getElementById("status");

chrome.storage.sync.get({ protectedBranches: DEFAULTS }, (cfg) => {
  ta.value = (cfg.protectedBranches || DEFAULTS).join("\n");
});

document.getElementById("save").addEventListener("click", () => {
  const list = ta.value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  chrome.storage.sync.set({ protectedBranches: list }, () => {
    status.textContent = "Saved";
    setTimeout(() => (status.textContent = ""), 1500);
  });
});
