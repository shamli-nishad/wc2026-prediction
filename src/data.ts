export type Team = { name: string; flag: string };

export type R32Match = {
  teamA: Team;
  teamB: Team;
  date: string;
  venue: string;
  bracketSlot: number; // 0-15; slots 2k and 2k+1 feed R16 match k
};

// Sorted chronologically for display in the picker.
// bracketSlot preserves the original bracket groupings so R16 pairs are correct:
//   slots (0,1)→R16[0]  (2,3)→R16[1]  (4,5)→R16[2]  (6,7)→R16[3]
//   slots (8,9)→R16[4]  (10,11)→R16[5] (12,13)→R16[6] (14,15)→R16[7]
export const ROUND_OF_32: R32Match[] = [
  // Jun 28
  { bracketSlot: 2,  teamA: { name: 'South Africa', flag: '🇿🇦' }, teamB: { name: 'Canada',         flag: '🇨🇦' }, date: 'Jun 28', venue: 'SoFi Stadium, Inglewood' },
  // Jun 29
  { bracketSlot: 0,  teamA: { name: 'Germany',      flag: '🇩🇪' }, teamB: { name: 'Paraguay',       flag: '🇵🇾' }, date: 'Jun 29', venue: 'Gillette Stadium, Foxborough' },
  { bracketSlot: 3,  teamA: { name: 'Netherlands',  flag: '🇳🇱' }, teamB: { name: 'Morocco',        flag: '🇲🇦' }, date: 'Jun 29', venue: 'Estadio BBVA, Guadalupe' },
  { bracketSlot: 8,  teamA: { name: 'Brazil',       flag: '🇧🇷' }, teamB: { name: 'Japan',          flag: '🇯🇵' }, date: 'Jun 29', venue: 'NRG Stadium, Houston' },
  // Jun 30
  { bracketSlot: 1,  teamA: { name: 'France',       flag: '🇫🇷' }, teamB: { name: 'Sweden',         flag: '🇸🇪' }, date: 'Jun 30', venue: 'MetLife Stadium, East Rutherford' },
  { bracketSlot: 9,  teamA: { name: 'Ivory Coast',  flag: '🇨🇮' }, teamB: { name: 'Norway',         flag: '🇳🇴' }, date: 'Jun 30', venue: 'AT&T Stadium, Arlington' },
  { bracketSlot: 10, teamA: { name: 'Mexico',       flag: '🇲🇽' }, teamB: { name: 'Ecuador',        flag: '🇪🇨' }, date: 'Jun 30', venue: 'Estadio Azteca, Mexico City' },
  // Jul 1
  { bracketSlot: 6,  teamA: { name: 'USA',          flag: '🇺🇸' }, teamB: { name: 'Bosnia & Herz.', flag: '🇧🇦' }, date: 'Jul 1',  venue: "Levi's Stadium, Santa Clara" },
  { bracketSlot: 7,  teamA: { name: 'Belgium',      flag: '🇧🇪' }, teamB: { name: 'Senegal',        flag: '🇸🇳' }, date: 'Jul 1',  venue: 'Lumen Field, Seattle' },
  { bracketSlot: 11, teamA: { name: 'England',      flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' }, teamB: { name: 'DR Congo',       flag: '🇨🇩' }, date: 'Jul 1',  venue: 'Mercedes-Benz Stadium, Atlanta' },
  // Jul 2
  { bracketSlot: 4,  teamA: { name: 'Portugal',     flag: '🇵🇹' }, teamB: { name: 'Croatia',        flag: '🇭🇷' }, date: 'Jul 2',  venue: 'BMO Field, Toronto' },
  { bracketSlot: 5,  teamA: { name: 'Spain',        flag: '🇪🇸' }, teamB: { name: 'Austria',        flag: '🇦🇹' }, date: 'Jul 2',  venue: 'SoFi Stadium, Inglewood' },
  { bracketSlot: 14, teamA: { name: 'Switzerland',  flag: '🇨🇭' }, teamB: { name: 'Algeria',        flag: '🇩🇿' }, date: 'Jul 2',  venue: 'BC Place, Vancouver' },
  // Jul 3
  { bracketSlot: 12, teamA: { name: 'Argentina',    flag: '🇦🇷' }, teamB: { name: 'Cape Verde',     flag: '🇨🇻' }, date: 'Jul 3',  venue: 'Hard Rock Stadium, Miami' },
  { bracketSlot: 13, teamA: { name: 'Australia',    flag: '🇦🇺' }, teamB: { name: 'Egypt',          flag: '🇪🇬' }, date: 'Jul 3',  venue: 'AT&T Stadium, Arlington' },
  { bracketSlot: 15, teamA: { name: 'Colombia',     flag: '🇨🇴' }, teamB: { name: 'Ghana',          flag: '🇬🇭' }, date: 'Jul 3',  venue: 'Arrowhead Stadium, Kansas City' },
];

// Lookup: bracketSlot → array index (for building R16 pairs)
export const SLOT_TO_IDX: Record<number, number> = Object.fromEntries(
  ROUND_OF_32.map((m, i) => [m.bracketSlot, i])
);

export const ROUND_LABELS = ['Round of 32', 'Round of 16', 'Quarter-Finals', 'Semi-Finals', 'Final'];
export const TOTAL_ROUNDS = 5;
