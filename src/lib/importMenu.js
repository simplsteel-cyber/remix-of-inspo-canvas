import * as XLSX from 'xlsx';

// ─────────────────────────────────────────────────────────────
// Master Menu Excel parser — single source of truth for the
// column mapping. Used by the /admin importer in the browser and
// by scripts/generate-seed.mjs to produce the SQL seed, so the
// two can never drift apart.
//
// Expected sheet: "Master Menu", headers on the 4th row:
// Dish | Cuisine | Diet | Carb / Base | Vegetable Side |
// Price (INR) | Calories (approx) | Protein g (approx) |
// Dietary Tags | Brochure Section | Description | Has Photo? |
// Matched Image (file) | ...
// ─────────────────────────────────────────────────────────────

export const MASTER_SHEET = 'Master Menu';

const clean = (v) => String(v ?? '').trim();

// "500/750" (two portion sizes) → 500 as the base price.
const parsePrice = (raw) => {
  const first = clean(raw).split('/')[0];
  const n = parseInt(first, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
};

const parseIntOrNull = (raw) => {
  const n = parseInt(clean(raw), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
};

export function parseMasterMenu(workbook) {
  const ws = workbook.Sheets[MASTER_SHEET];
  if (!ws) return { meals: [], issues: [`Sheet "${MASTER_SHEET}" not found — found: ${workbook.SheetNames.join(', ')}`] };

  const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  const headerIdx = raw.findIndex((r) => clean(r[0]) === 'Dish');
  if (headerIdx === -1) return { meals: [], issues: ['Could not find the header row (first column "Dish").'] };

  const header = raw[headerIdx].map(clean);
  const col = (name) => header.indexOf(name);
  const cols = {
    name: col('Dish'), cuisine: col('Cuisine'), diet: col('Diet'),
    base: col('Carb / Base'), side: col('Vegetable Side'), price: col('Price (INR)'),
    kcal: col('Calories (approx)'), protein: col('Protein g (approx)'),
    tags: col('Dietary Tags'), section: col('Brochure Section'),
    description: col('Description'), hasPhoto: col('Has Photo?'), image: col('Matched Image (file)'),
  };
  const missingCols = Object.entries(cols).filter(([, i]) => i === -1).map(([k]) => k);
  if (missingCols.includes('name')) return { meals: [], issues: [`Missing required column(s): ${missingCols.join(', ')}`] };

  const issues = missingCols.length ? [`Columns not found (values left empty): ${missingCols.join(', ')}`] : [];
  const meals = [];

  for (const row of raw.slice(headerIdx + 1)) {
    const name = clean(row[cols.name]);
    if (!name || name.toLowerCase().startsWith('legend')) continue;

    const get = (key) => (cols[key] === -1 ? '' : clean(row[cols[key]]));
    const price = parsePrice(get('price'));
    const kcal = parseIntOrNull(get('kcal'));
    const hasPhoto = get('hasPhoto').toLowerCase() === 'yes';
    const tags = get('tags').split(',').map((t) => t.trim()).filter(Boolean);

    const rowIssues = [];
    if (!price) rowIssues.push('missing price');
    if (!kcal) rowIssues.push('missing calories');
    if (!hasPhoto) rowIssues.push('needs photo');
    if (rowIssues.length) issues.push(`${name}: ${rowIssues.join(', ')}`);

    meals.push({
      name,
      cuisine: get('cuisine') || null,
      diet: get('diet') || null,
      vegan: tags.some((t) => t.toLowerCase() === 'vegan'),
      base: get('base') || null,
      side: get('side') || null,
      price,
      price_raw: get('price') || null,
      kcal,
      protein: parseIntOrNull(get('protein')),
      tags,
      section: get('section') || null,
      description: get('description') || null,
      image: get('image') || null,
      // Unavailable until it has a photo and the critical data to sell it.
      availability: hasPhoto && !!price,
    });
  }

  return { meals, issues };
}
