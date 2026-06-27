function loadEcosystemTags() {
  try {
    const raw = localStorage.getItem('ecosystem_tags');
    if (!raw) return [];
    const { tags } = JSON.parse(raw);
    return tags || [];
  } catch(_) { return []; }
}

const tags = loadEcosystemTags();
