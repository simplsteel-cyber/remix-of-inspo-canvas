import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { C, serif } from '../lib/core.js';
import { supabase } from '../lib/supabase.js';
import { parseMasterMenu, MASTER_SHEET } from '../lib/importMenu.js';
import { Btn, SectionTitle, cardStyle } from '../components/ui.jsx';
import { useUser } from '../context/UserContext.jsx';
import { useMenu } from '../context/MenuContext.jsx';
import { ShieldCheck, Upload, CheckCircle2, AlertTriangle } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// /admin — menu management. Upload the Master Menu Excel, review
// the parsed rows and data issues, then upsert into Supabase.
// Requires a signed-in user whose profiles.role = 'admin'.
// ─────────────────────────────────────────────────────────────

export function AdminScreen() {
  const { user, isAdmin, booting } = useUser();
  const { refreshMenu, menuSource } = useMenu();
  const [parsed, setParsed] = useState(null); // { meals, issues, fileName }
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null); // { ok, message }

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    try {
      const wb = XLSX.read(await file.arrayBuffer());
      const { meals, issues } = parseMasterMenu(wb);
      setParsed({ meals, issues, fileName: file.name });
    } catch (err) {
      setParsed(null);
      setResult({ ok: false, message: `Could not read the file: ${err.message}` });
    }
    e.target.value = '';
  };

  const runImport = async () => {
    if (!parsed?.meals.length) return;
    setImporting(true);
    setResult(null);
    const { error } = await supabase.from('meals').upsert(parsed.meals, { onConflict: 'name' });
    setImporting(false);
    if (error) {
      setResult({ ok: false, message: `Import failed: ${error.message}` });
    } else {
      setResult({ ok: true, message: `Imported ${parsed.meals.length} meals (${parsed.meals.filter((m) => m.availability).length} available, ${parsed.meals.filter((m) => !m.availability).length} hidden pending photo/data).` });
      refreshMenu();
    }
  };

  const shell = (content) => (
    <div className="min-h-screen flex justify-center" style={{ background: '#EFEFEC' }}>
      <div className="w-full max-w-2xl min-h-screen px-5 pt-8 pb-10" style={{ background: C.warm }}>
        <div className="flex items-center gap-2">
          <ShieldCheck size={22} color={C.sage} />
          <SectionTitle>Lean Kitchen — Admin</SectionTitle>
        </div>
        {content}
        <div className="mt-8 text-xs" style={{ color: C.mute }}>
          <a href="/" className="underline">Back to the app</a> · Menu currently served from: {menuSource || '…'}
        </div>
      </div>
    </div>
  );

  if (booting) return shell(<p className="text-sm mt-6" style={{ color: C.mute }}>Loading…</p>);

  if (!user) {
    return shell(
      <div className="rounded-3xl p-5 mt-6 text-sm" style={cardStyle}>
        <p style={{ color: C.ink }}>You need to sign in first.</p>
        <p className="mt-2" style={{ color: C.mute }}>Open <a href="/" className="underline">the app</a>, sign in with your admin account, then return to <code>/admin</code>.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return shell(
      <div className="rounded-3xl p-5 mt-6 text-sm" style={cardStyle}>
        <p style={{ color: C.ink }}>This account doesn't have admin access.</p>
        <p className="mt-2" style={{ color: C.mute }}>
          Signed in as {user.email || user.phone}. An existing admin (or the Supabase dashboard SQL editor) must run:
        </p>
        <pre className="mt-2 p-3 rounded-xl text-xs overflow-x-auto" style={{ background: C.grey, color: C.ink }}>
{`update profiles set role = 'admin'
where id = '${user.id}';`}
        </pre>
      </div>
    );
  }

  return shell(<>
    <div className="rounded-3xl p-5 mt-6" style={cardStyle}>
      <h3 className="text-sm font-semibold" style={{ color: C.ink }}>Import the menu from Excel</h3>
      <p className="text-sm mt-1" style={{ color: C.mute }}>
        Upload the master workbook — the <span className="font-medium">“{MASTER_SHEET}”</span> sheet is parsed, previewed below, and upserted by dish name. Dishes marked “Needs photo” or missing a price are imported as unavailable.
      </p>
      <label className="inline-flex items-center gap-2 rounded-full px-5 py-3 mt-4 text-sm font-semibold cursor-pointer"
        style={{ background: C.cta, color: '#fff' }}>
        <Upload size={16} /> Choose .xlsx file
        <input type="file" accept=".xlsx,.xls" className="sr-only" onChange={onFile} />
      </label>
    </div>

    {result && (
      <div role="status" className="flex items-start gap-2 rounded-2xl px-4 py-3 mt-4 text-sm"
        style={result.ok ? { background: C.mint, color: '#3e6b2f' } : { background: '#FBEDEB', color: '#c0392b' }}>
        {result.ok ? <CheckCircle2 size={16} className="flex-none mt-0.5" /> : <AlertTriangle size={16} className="flex-none mt-0.5" />}
        {result.message}
      </div>
    )}

    {parsed && (
      <div className="rounded-3xl p-5 mt-4" style={cardStyle}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: C.ink }}>{parsed.fileName}</h3>
            <div className="text-xs mt-0.5" style={{ color: C.mute }}>
              {parsed.meals.length} dishes parsed · {parsed.meals.filter((m) => m.availability).length} available · {parsed.issues.length} data notes
            </div>
          </div>
          <Btn small busy={importing} disabled={!parsed.meals.length} onClick={runImport}>
            Import {parsed.meals.length} meals
          </Btn>
        </div>

        {parsed.issues.length > 0 && (
          <details className="mt-3 text-xs" style={{ color: '#b06c22' }}>
            <summary className="cursor-pointer font-medium">Data notes ({parsed.issues.length})</summary>
            <ul className="mt-1.5 grid gap-1 list-disc pl-4">
              {parsed.issues.map((i) => <li key={i}>{i}</li>)}
            </ul>
          </details>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs" style={{ color: C.ink }}>
            <thead>
              <tr className="text-left" style={{ color: C.mute }}>
                {['Dish', 'Diet', 'Price', 'Kcal', 'Protein', 'Section', 'Available'].map((h) => (
                  <th key={h} className="py-2 pr-3 font-medium" style={{ borderBottom: `1px solid ${C.line}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parsed.meals.map((m) => (
                <tr key={m.name}>
                  <td className="py-1.5 pr-3" style={{ borderBottom: `1px solid ${C.line}` }}>{m.name}</td>
                  <td className="py-1.5 pr-3" style={{ borderBottom: `1px solid ${C.line}`, color: m.diet === 'Non-Veg' ? C.nonveg : C.veg }}>{m.diet || '—'}</td>
                  <td className="py-1.5 pr-3" style={{ borderBottom: `1px solid ${C.line}` }}>{m.price_raw || '—'}</td>
                  <td className="py-1.5 pr-3" style={{ borderBottom: `1px solid ${C.line}` }}>{m.kcal ?? '—'}</td>
                  <td className="py-1.5 pr-3" style={{ borderBottom: `1px solid ${C.line}` }}>{m.protein ?? '—'}</td>
                  <td className="py-1.5 pr-3" style={{ borderBottom: `1px solid ${C.line}` }}>{m.section || '—'}</td>
                  <td className="py-1.5 pr-3" style={{ borderBottom: `1px solid ${C.line}` }}>
                    {m.availability
                      ? <span style={{ color: C.veg }}>Yes</span>
                      : <span title="Needs photo or missing critical data" style={{ color: '#b06c22' }}>Hidden</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </>);
}
