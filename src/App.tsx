import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { ROUND_OF_32, ROUND_LABELS, SLOT_TO_IDX, TOTAL_ROUNDS, type Team } from './data';

// ─── Types & helpers ──────────────────────────────────────────────────────────
type Picks = Record<string, Team>;

function matchKey(round: number, idx: number) { return `r${round}-${idx}`; }

function getRoundPairs(picks: Picks, round: number): [Team | null, Team | null][] {
  if (round === 0) return ROUND_OF_32.map(m => [m.teamA, m.teamB]);
  // Round 1 (R16): pair R32 picks by bracketSlot so date-sorted display order
  // doesn't break bracket groupings (slots 2k and 2k+1 feed R16 match k).
  if (round === 1) {
    return Array.from({ length: 8 }, (_, i) => [
      picks[matchKey(0, SLOT_TO_IDX[i * 2])]     ?? null,
      picks[matchKey(0, SLOT_TO_IDX[i * 2 + 1])] ?? null,
    ]);
  }
  const count = 16 / Math.pow(2, round);
  return Array.from({ length: count }, (_, i) => [
    picks[matchKey(round - 1, i * 2)] ?? null,
    picks[matchKey(round - 1, i * 2 + 1)] ?? null,
  ]);
}

function countPicks(picks: Picks, round: number) {
  const n = 16 / Math.pow(2, round);
  return Array.from({ length: n }, (_, i) => picks[matchKey(round, i)]).filter(Boolean).length;
}

function totalInRound(round: number) { return 16 / Math.pow(2, round); }

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: '#0a0e1a', card: '#111827', cardHover: '#1a2236',
  border: '#1e2d45', borderGreen: '#22c55e',
  text: '#e2e8f0', muted: '#64748b', dim: '#374151',
  gold: '#f59e0b', green: '#22c55e',
};

// ─── Name Gate ────────────────────────────────────────────────────────────────
function NameGate({ onStart }: { onStart: (name: string) => void }) {
  const [name, setName] = useState('');
  const [err, setErr] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setErr(true); return; }
    onStart(name.trim());
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🏆</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.gold, marginBottom: 6 }}>FIFA World Cup 2026</h1>
        <p style={{ fontSize: 14, color: C.muted, marginBottom: 32 }}>Predict and share with your friends!</p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <input
              autoFocus
              type="text"
              placeholder="Enter your name *"
              value={name}
              maxLength={30}
              onChange={e => { setName(e.target.value); setErr(false); }}
              style={{
                width: '100%', padding: '14px 16px',
                background: C.card, border: `2px solid ${err ? '#ef4444' : name.trim() ? C.gold : C.border}`,
                borderRadius: 10, color: C.text, fontSize: 16, fontFamily: 'inherit',
                outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s',
              }}
            />
            {err && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 6, textAlign: 'left' }}>Please enter your name to continue</p>}
          </div>
          <button
            type="submit"
            style={{
              padding: '14px', background: `linear-gradient(90deg,#d97706,${C.gold})`,
              color: '#000', border: 'none', borderRadius: 10, fontSize: 16,
              fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Start Predicting →
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Team Slot button ─────────────────────────────────────────────────────────
function TeamSlot({ team, side, winner, ready, onPick }: {
  team: Team | null; side: 'A' | 'B'; winner: Team | null; ready: boolean; onPick: () => void;
}) {
  const picked = !!winner && winner.name === team?.name;
  const loser  = !!winner && !picked && !!team;
  const radius = side === 'A' ? '10px 10px 0 0' : '0 0 10px 10px';
  return (
    <button
      onClick={onPick}
      disabled={!ready || !team}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', minHeight: 52, padding: '10px 14px',
        background: picked ? 'linear-gradient(90deg,#0d2b18,#22c55e18)' : C.card,
        border: `1.5px solid ${picked ? C.borderGreen : C.border}`,
        borderRadius: radius, color: picked ? '#86efac' : loser ? C.dim : C.text,
        fontSize: 15, fontWeight: picked ? 700 : 500,
        cursor: ready && team ? 'pointer' : 'default',
        transition: 'all 0.15s', textAlign: 'left', fontFamily: 'inherit',
        opacity: loser ? 0.4 : 1,
      }}
    >

      <span style={{ flex: 1 }}>{team?.name ?? <span style={{ color: C.dim }}>TBD</span>}</span>
      {picked && <span style={{ fontSize: 14 }}>✓</span>}
    </button>
  );
}

// ─── Match card ───────────────────────────────────────────────────────────────
function MatchCard({ teamA, teamB, winner, date, venue, onPick }: {
  teamA: Team | null; teamB: Team | null; winner: Team | null;
  date?: string; venue?: string; onPick: (t: Team) => void;
}) {
  const ready = !!(teamA && teamB);
  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${winner ? C.borderGreen + '55' : C.border}` }}>
      {(date || venue) && (
        <div style={{ background: '#0d1321', padding: '5px 14px', fontSize: 11, color: C.muted, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ flexShrink: 0 }}>{date}</span>
          <span style={{ textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#3d5068' }}>{venue}</span>
        </div>
      )}
      <TeamSlot team={teamA} side="A" winner={winner} ready={ready} onPick={() => teamA && onPick(teamA)} />
      <div style={{ background: '#0d1321', height: 1 }} />
      <TeamSlot team={teamB} side="B" winner={winner} ready={ready} onPick={() => teamB && onPick(teamB)} />
    </div>
  );
}

// ─── Round view ───────────────────────────────────────────────────────────────
function RoundView({ round, picks, onPick }: {
  round: number; picks: Picks; onPick: (t: Team, r: number, i: number) => void;
}) {
  const pairs = getRoundPairs(picks, round);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {pairs.map(([a, b], idx) => {
        const meta = round === 0 ? ROUND_OF_32[idx] : null;
        return (
          <MatchCard
            key={idx} teamA={a} teamB={b}
            winner={picks[matchKey(round, idx)] ?? null}
            date={meta?.date} venue={meta?.venue}
            onPick={t => onPick(t, round, idx)}
          />
        );
      })}
    </div>
  );
}

// ─── Bracket image (for download) ────────────────────────────────────────────
// Sections: R16 matchups (r0 pairs), QF matchups (r1 pairs), SF matchups (r2 pairs),
//           Final matchup (r3 pair), Champion (r4 pick)
function BracketImage({ picks, userName, predictedOn }: { picks: Picks; userName: string; predictedOn: string }) {

  // Build matchup pairs for a given round:
  // picks from round `picksRound` are paired as (0,1),(2,3),... representing who faces each other
  // in the *next* round (the round labeled `label`).
  // Returns matchup pairs plus the predicted winner for each match.
  // winner = the pick from the *next* round at the same bracket position.
  function getMatchups(picksRound: number): { a: Team | null; b: Team | null; winner: Team | null }[] {
    const count = totalInRound(picksRound);
    return Array.from({ length: count / 2 }, (_, i) => {
      const idxA = picksRound === 0 ? SLOT_TO_IDX[i * 2]     : i * 2;
      const idxB = picksRound === 0 ? SLOT_TO_IDX[i * 2 + 1] : i * 2 + 1;
      return {
        a:      picks[matchKey(picksRound, idxA)]     ?? null,
        b:      picks[matchKey(picksRound, idxB)]     ?? null,
        winner: picks[matchKey(picksRound + 1, i)]    ?? null,
      };
    });
  }

  function TeamEntry({ team, isWinner }: { team: Team | null; isWinner: boolean }) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flex: 1, padding: '5px 4px',
        background: isWinner ? '#0d2b18' : 'transparent',
        borderRadius: 6,
      }}>
        <span style={{
          fontSize: 11, fontWeight: isWinner ? 800 : 600,
          textAlign: 'center', wordBreak: 'break-word', lineHeight: 1.2,
          color: isWinner ? '#86efac' : team ? C.text : C.dim,
        }}>
          {team?.name ?? 'TBD'}
        </span>
      </div>
    );
  }

  function MatchupCard({ a, b, winner }: { a: Team | null; b: Team | null; winner: Team | null }) {
    const aWins = !!winner && !!a && winner.name === a.name;
    const bWins = !!winner && !!b && winner.name === b.name;
    return (
      <div style={{
        flex: '1 1 0', minWidth: 0,
        background: '#111827', border: `1px solid ${winner ? '#22c55e44' : '#1e2d45'}`,
        borderRadius: 10, overflow: 'hidden',
        display: 'flex', flexDirection: 'row', alignItems: 'stretch',
      }}>
        <TeamEntry team={a} isWinner={aWins} />
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 3px', color: '#2a3a54', fontSize: 10, fontWeight: 700,
          flexShrink: 0,
        }}>vs</div>
        <TeamEntry team={b} isWinner={bWins} />
      </div>
    );
  }

  // Sections: each has a header label and matchup pairs to display
  // Max 2 matchups per row so cards are readable
  const sections: { label: string; matchups: { a: Team | null; b: Team | null; winner: Team | null }[] }[] = [
    { label: 'Round of 16',    matchups: getMatchups(0) },
    { label: 'Quarter-Finals', matchups: getMatchups(1) },
    { label: 'Semi-Finals',    matchups: getMatchups(2) },
  ];

  // The Final: SF winners face each other; champion is the Final winner
  const finalist0 = picks[matchKey(3, 0)] ?? null;
  const finalist1 = picks[matchKey(3, 1)] ?? null;
  const champion  = picks[matchKey(4, 0)] ?? null;

  return (
    <div style={{
      background: C.bg, padding: '16px 16px 12px', borderRadius: 16,
      width: '100%', maxWidth: 560, fontFamily: 'Inter, sans-serif',
      boxSizing: 'border-box',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: C.muted, textTransform: 'uppercase', marginBottom: 4 }}>World Cup 2026 · Prediction</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.gold }}>{userName}</div>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0,
            background: '#1a2236', border: `1px solid ${C.border}`,
            borderRadius: 6, padding: '4px 8px',
          }}>
            <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: C.muted, marginBottom: 1 }}>Predicted on</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.text, whiteSpace: 'nowrap' }}>{predictedOn}</div>
          </div>
        </div>
      </div>

      {/* Champion */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: C.gold, marginBottom: 5 }}>
          🏆 World Champion
        </div>
        {champion ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'linear-gradient(135deg,#78350f,#b45309,#d97706)',
            borderRadius: 10, padding: '8px 14px',
            border: '2px solid #f59e0b',
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{champion.name}</div>
            <span style={{ fontSize: 22, marginLeft: 'auto' }}>🏆</span>
          </div>
        ) : (
          <div style={{ background: '#0d1321', borderRadius: 8, padding: '10px 14px', textAlign: 'center', color: C.dim, fontSize: 12 }}>
            Complete all picks to reveal your champion
          </div>
        )}
      </div>

      {/* The Final */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#7c3aed', marginBottom: 5 }}>
          The Final
        </div>
        <div style={{
          display: 'flex', background: '#1a1040', border: `1px solid ${champion ? '#22c55e44' : '#7c3aed55'}`,
          borderRadius: 8, overflow: 'hidden',
        }}>
          <TeamEntry team={finalist0} isWinner={!!champion && !!finalist0 && champion.name === finalist0.name} />
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 5px', color: '#7c3aed', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>vs</div>
          <TeamEntry team={finalist1} isWinner={!!champion && !!finalist1 && champion.name === finalist1.name} />
        </div>
      </div>

      {/* Semi-Finals, Quarter-Finals, Round of 16 */}
      {[...sections].reverse().map(({ label, matchups }) => {
        type Matchup = { a: Team | null; b: Team | null; winner: Team | null };
        const rows: Matchup[][] = [];
        for (let i = 0; i < matchups.length; i += 2) rows.push(matchups.slice(i, i + 2));

        return (
          <div key={label} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#475569', marginBottom: 5 }}>
              {label}
            </div>
            {rows.map((row, ri) => (
              <div key={ri} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                {row.map(({ a, b, winner }, ci) => <MatchupCard key={ci} a={a} b={b} winner={winner} />)}
                {row.length === 1 && <div style={{ flex: '1 1 0' }} />}
              </div>
            ))}
          </div>
        );
      })}

      <div style={{ marginTop: 8, textAlign: 'center', fontSize: 9, color: '#1e2a3a' }}>
        Created by: Shamli 
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [userName, setUserName] = useState('');
  const [picks, setPicks] = useState<Picks>({});
  const [currentRound, setCurrentRound] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [predictedOn] = useState(() => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
  const summaryRef = useRef<HTMLDivElement>(null);

  function handlePick(team: Team, round: number, idx: number) {
    setPicks(prev => {
      const next = { ...prev, [matchKey(round, idx)]: team };
      let path = idx;
      for (let r = round + 1; r < TOTAL_ROUNDS; r++) {
        path = Math.floor(path / 2);
        delete next[matchKey(r, path)];
      }
      return next;
    });
  }

  async function handleDownload() {
    if (!summaryRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(summaryRef.current, {
        backgroundColor: C.bg, scale: 2.5, useCORS: true, logging: false,
      });
      const filename = `${userName}-wc2026-bracket.png`;

      // On mobile, use the Web Share API so the image lands in the Gallery/Photos app.
      if (navigator.canShare) {
        const blob = await new Promise<Blob>((resolve, reject) =>
          canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/png')
        );
        const file = new File([blob], filename, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: `${userName} World Cup 2026 Prediction` });
          return;
        }
      }

      // Desktop fallback — anchor download
      const a = document.createElement('a');
      a.download = filename;
      a.href = canvas.toDataURL('image/png');
      a.click();
    } finally {
      setDownloading(false);
    }
  }

  // Not yet named — show gate
  if (!userName) return <NameGate onStart={setUserName} />;

  const picksInRound = countPicks(picks, currentRound);
  const totalRound   = totalInRound(currentRound);
  const roundDone    = picksInRound === totalRound;
  const allDone      = [0,1,2,3,4].every(r => countPicks(picks, r) === totalInRound(r));
  const champion     = picks[matchKey(4, 0)] ?? null;
  const overallDone  = [0,1,2,3,4].reduce((s,r) => s + countPicks(picks, r), 0);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 16px 48px' }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: C.gold, margin: 0 }}>🏆 World Cup 2026</h1>
              <p style={{ fontSize: 12, color: C.muted, margin: '3px 0 0' }}>Hi <strong style={{ color: C.text }}>{userName}</strong> — tap a team to advance them</p>
            </div>
            <button
              onClick={() => { if (confirm('Change name? This will reset all picks.')) { setUserName(''); setPicks({}); setCurrentRound(0); setShowSummary(false); } }}
              style={{ background: 'none', border: 'none', color: C.dim, fontSize: 12, cursor: 'pointer', padding: '4px 8px', fontFamily: 'inherit' }}
            >
              ✎ {userName}
            </button>
          </div>

          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <div style={{ flex: 1, height: 5, background: C.border, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(overallDone / 31) * 100}%`, background: `linear-gradient(90deg,${C.gold},${C.green})`, transition: 'width 0.3s', borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>{overallDone}/31</span>
          </div>
        </div>

        {/* Round tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 18, overflowX: 'auto', paddingBottom: 4 }}>
          {ROUND_LABELS.map((label, r) => {
            const done   = countPicks(picks, r) === totalInRound(r);
            const active = currentRound === r && !showSummary;
            const short  = ['R32','R16','QF','SF','Final'][r];
            return (
              <button key={r} onClick={() => { setCurrentRound(r); setShowSummary(false); }}
                style={{
                  flexShrink: 0, padding: '7px 13px',
                  background: active ? C.gold : done ? '#0d2b18' : C.card,
                  color: active ? '#000' : done ? C.green : C.muted,
                  border: `1px solid ${active ? C.gold : done ? C.borderGreen + '66' : C.border}`,
                  borderRadius: 20, fontSize: 12, fontWeight: active ? 700 : 500,
                  cursor: 'pointer', fontFamily: 'inherit', minHeight: 36,
                }}>
                {done && !active ? '✓ ' : ''}{short}
              </button>
            );
          })}
          {allDone && (
            <button onClick={() => setShowSummary(true)}
              style={{
                flexShrink: 0, padding: '7px 13px',
                background: showSummary ? '#7c3aed' : '#2d1b69',
                color: '#c4b5fd', border: '1px solid #7c3aed88',
                borderRadius: 20, fontSize: 12, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', minHeight: 36,
              }}>
              🖼 Card
            </button>
          )}
        </div>

        {/* ── Summary / download view ── */}
        {showSummary ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div ref={summaryRef}>
              <BracketImage picks={picks} userName={userName} predictedOn={predictedOn} />
            </div>
            <button onClick={handleDownload} disabled={downloading}
              style={{
                padding: '14px', background: `linear-gradient(90deg,#d97706,${C.gold})`,
                color: '#000', border: 'none', borderRadius: 10,
                fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
              }}>
              {downloading ? 'Generating…' : '⬇ Download My Bracket Card'}
            </button>
            <button onClick={() => setShowSummary(false)}
              style={{ padding: '10px', background: 'none', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
              ← Back to Picks
            </button>
          </div>
        ) : (
          /* ── Round view ── */
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>{ROUND_LABELS[currentRound]}</h2>
              <span style={{ fontSize: 12, color: roundDone ? C.green : C.muted }}>{picksInRound}/{totalRound}</span>
            </div>

            <RoundView round={currentRound} picks={picks} onPick={handlePick} />

            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              {currentRound > 0 && (
                <button onClick={() => setCurrentRound(r => r - 1)}
                  style={{ flex: 1, padding: 13, background: 'none', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', minHeight: 48 }}>
                  ← Back
                </button>
              )}
              {currentRound < 4 ? (
                <button onClick={() => roundDone && setCurrentRound(r => r + 1)} disabled={!roundDone}
                  style={{
                    flex: 2, padding: 13, minHeight: 48,
                    background: roundDone ? 'linear-gradient(90deg,#1d6b3a,#22c55e)' : C.card,
                    color: roundDone ? '#fff' : C.dim,
                    border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700,
                    cursor: roundDone ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
                  }}>
                  {roundDone ? `Next: ${ROUND_LABELS[currentRound + 1]} →` : `${totalRound - picksInRound} picks remaining`}
                </button>
              ) : (
                <button onClick={() => roundDone && setShowSummary(true)} disabled={!roundDone}
                  style={{
                    flex: 2, padding: 13, minHeight: 48,
                    background: roundDone ? 'linear-gradient(90deg,#7c3aed,#a78bfa)' : C.card,
                    color: roundDone ? '#fff' : C.dim,
                    border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700,
                    cursor: roundDone ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
                  }}>
                  {roundDone ? '🖼 See My Bracket Card →' : `${totalRound - picksInRound} picks remaining`}
                </button>
              )}
            </div>

            {/* Champion preview */}
            {champion && (
              <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 10, background: '#78350f22', border: `1px solid ${C.gold}44`, borderRadius: 10, padding: '10px 14px' }}>
                <span style={{ fontSize: 13, color: '#fde68a' }}>Your champion: <strong>{champion.name}</strong></span>
              </div>
            )}
          </div>
        )}

        {/* Reset */}
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <button onClick={() => { if (confirm('Reset all picks?')) { setPicks({}); setCurrentRound(0); setShowSummary(false); } }}
            style={{ background: 'none', border: 'none', color: C.dim, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            Reset all picks
          </button>
        </div>
      </div>
    </div>
  );
}
