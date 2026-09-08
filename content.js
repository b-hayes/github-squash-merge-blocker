(() => {
  const DEFAULTS = ["qa", "main", "master"];
  let protectedBranches = DEFAULTS;

  const norm = (s) => (s || "").trim().replace(/^.*:/, "").toLowerCase();

  const getHeadRef = () => {
    const names = document.querySelectorAll('a[data-component="BranchName"]');
    if (names.length >= 2) {
      const head = names[names.length - 1];
      const href = head.getAttribute("href") || "";
      const m = href.match(/\/tree\/(.+)$/);
      return norm(m ? decodeURIComponent(m[1]) : head.textContent);
    }

    const el =
      document.querySelector(".head-ref") ||
      document.querySelector(".commit-ref.head-ref");
    if (el) return norm(el.textContent);

    const refs = document.querySelectorAll(
      "span.commit-ref, .commit-ref, [class*='commit-ref']"
    );
    if (refs.length >= 2) return norm(refs[refs.length - 1].textContent);
    return null;
  };

  const isProtectedHead = () => {
    const head = getHeadRef();
    if (!head) return false;
    return protectedBranches.map(norm).includes(head);
  };

  const matchesSquash = (el) => /squash/i.test((el.textContent || "").trim());

  const REASON = " — blocked: PR source branch is protected (No-Squash Guard)";

  const disableEl = (el) => {
    el.setAttribute("aria-disabled", "true");
    el.style.opacity = "0.45";
    el.style.cursor = "not-allowed";
    el.style.pointerEvents = "none";
    if (!/No-Squash Guard/.test(el.title || ""))
      el.title = (el.title || el.textContent.trim()) + REASON;
    if ("disabled" in el) el.disabled = true;
  };

  const SEL = 'button, [role="menuitemradio"], [role="menuitem"], [role="option"], summary, a';

  const apply = () => {
    if (!isProtectedHead()) return;
    document.querySelectorAll(SEL).forEach((el) => {
      if (matchesSquash(el)) disableEl(el);
    });
  };

  document.addEventListener(
    "click",
    (e) => {
      if (!isProtectedHead()) return;
      const t = e.target.closest(SEL);
      if (t && matchesSquash(t)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        console.warn("[No-Squash Guard] blocked squash on protected head:", getHeadRef());
      }
    },
    true
  );

  chrome.storage.sync.get({ protectedBranches: DEFAULTS }, (cfg) => {
    if (Array.isArray(cfg.protectedBranches) && cfg.protectedBranches.length) {
      protectedBranches = cfg.protectedBranches;
    }
    console.debug("[No-Squash Guard] head:", getHeadRef(), "protected:", protectedBranches);
    apply();
    new MutationObserver(() => apply()).observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
})();
