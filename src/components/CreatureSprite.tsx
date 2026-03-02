// ─── SHARED HELPERS ───────────────────────────────────────────────────────────
function Eye({ cx, cy, r = 6 }: { cx: number; cy: number; r?: number }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill="white" />
      <circle cx={cx + 0.5} cy={cy + 0.5} r={r * 0.58} fill="#1a1a1a" />
      <circle cx={cx - r * 0.28} cy={cy - r * 0.32} r={r * 0.28} fill="white" />
    </>
  );
}

function Eyes({ lx, ly, rx, ry, r = 6 }: { lx: number; ly: number; rx: number; ry: number; r?: number }) {
  return (
    <>
      <Eye cx={lx} cy={ly} r={r} />
      <Eye cx={rx} cy={ry} r={r} />
    </>
  );
}

function Smile({ cx, cy, w = 9 }: { cx: number; cy: number; w?: number }) {
  return (
    <path
      d={`M${cx - w},${cy} Q${cx},${cy + w * 0.75} ${cx + w},${cy}`}
      stroke="#1a1a1a"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
  );
}

function Blush({ lx, ly, rx, ry, r = 5 }: { lx: number; ly: number; rx: number; ry: number; r?: number }) {
  return (
    <>
      <ellipse cx={lx} cy={ly} rx={r} ry={r * 0.65} fill="#FF69B4" opacity="0.45" />
      <ellipse cx={rx} cy={ry} rx={r} ry={r * 0.65} fill="#FF69B4" opacity="0.45" />
    </>
  );
}

// ─── FIRE LINE ────────────────────────────────────────────────────────────────

function Embrit() {
  return (
    <>
      <circle cx="50" cy="63" r="33" fill="#FF9800" opacity="0.12" />
      {/* Body */}
      <ellipse cx="50" cy="66" rx="25" ry="21" fill="#FF9800" />
      <ellipse cx="50" cy="64" rx="21" ry="17" fill="#FFA726" />
      {/* Flame crown */}
      <path d="M50,44 C46,37 37,25 42,14 C44,23 49,20 50,28 C51,20 56,23 58,14 C63,25 54,37 50,44Z" fill="#FF6B35" />
      <path d="M50,44 C47,38 41,29 44,20 C46,26 49,24 50,30 C51,24 54,26 56,20 C59,29 53,38 50,44Z" fill="#FFD600" />
      {/* Face */}
      <Eyes lx={42} ly={59} rx={58} ry={59} r={6.5} />
      <Blush lx={33} ly={66} rx={67} ry={66} r={5.5} />
      <Smile cx={50} cy={69} w={8} />
    </>
  );
}

function Scorchlet() {
  return (
    <>
      <circle cx="50" cy="58" r="34" fill="#E64A19" opacity="0.12" />
      {/* Flame tail (behind body) */}
      <path d="M68,70 C80,58 84,44 76,34 C73,44 69,40 72,52 C67,44 70,60 63,70Z" fill="#FF6B35" />
      <path d="M70,68 C80,58 82,46 76,38 C73,46 70,44 73,53 C69,46 71,60 66,68Z" fill="#FFD600" />
      {/* Body */}
      <ellipse cx="48" cy="72" rx="20" ry="16" fill="#E65100" />
      {/* Head */}
      <circle cx="50" cy="50" r="22" fill="#EF6C00" />
      <circle cx="50" cy="48" r="18" fill="#FF7043" />
      {/* Ears */}
      <polygon points="34,40 38,20 46,38" fill="#E65100" />
      <polygon points="54,38 62,20 66,40" fill="#E65100" />
      <polygon points="36,39 39,25 44,38" fill="#FFAB91" />
      <polygon points="56,38 61,25 65,39" fill="#FFAB91" />
      {/* Snout */}
      <ellipse cx="50" cy="56" rx="9" ry="6" fill="#FFCCBC" />
      {/* Face */}
      <Eyes lx={42} ly={48} rx={58} ry={48} r={5.5} />
      <Smile cx={50} cy={59} w={7} />
    </>
  );
}

function Infernox() {
  return (
    <>
      <circle cx="50" cy="55" r="38" fill="#B71C1C" opacity="0.1" />
      {/* Wings */}
      <path d="M30,58 C16,44 8,28 16,16 C22,30 26,40 30,50Z" fill="#7F0000" opacity="0.85" />
      <path d="M70,58 C84,44 92,28 84,16 C78,30 74,40 70,50Z" fill="#7F0000" opacity="0.85" />
      <path d="M30,54 C20,42 14,30 20,20 C24,32 28,42 30,52Z" fill="#B71C1C" opacity="0.5" />
      <path d="M70,54 C80,42 86,30 80,20 C76,32 72,42 70,52Z" fill="#B71C1C" opacity="0.5" />
      {/* Body */}
      <ellipse cx="50" cy="74" rx="24" ry="18" fill="#C62828" />
      <ellipse cx="50" cy="62" rx="13" ry="11" fill="#C62828" />
      {/* Head */}
      <ellipse cx="50" cy="48" rx="22" ry="19" fill="#D32F2F" />
      <ellipse cx="50" cy="46" rx="18" ry="15" fill="#E53935" />
      {/* Horns */}
      <path d="M37,34 C33,22 35,12 39,8 C37,20 41,27 39,34Z" fill="#7F0000" />
      <path d="M63,34 C67,22 65,12 61,8 C63,20 59,27 61,34Z" fill="#7F0000" />
      {/* Fierce eyes */}
      <ellipse cx="41" cy="45" rx="7" ry="5" fill="#FF6F00" />
      <ellipse cx="59" cy="45" rx="7" ry="5" fill="#FF6F00" />
      <ellipse cx="41" cy="45" rx="4.5" ry="4" fill="#1a1a1a" />
      <ellipse cx="59" cy="45" rx="4.5" ry="4" fill="#1a1a1a" />
      <circle cx="39" cy="43" r="1.5" fill="white" />
      <circle cx="57" cy="43" r="1.5" fill="white" />
      {/* Flame breath */}
      <path d="M40,57 C34,62 26,62 22,58 C28,58 32,54 36,60Z" fill="#FF6B35" opacity="0.85" />
      <path d="M40,57 C35,61 30,60 28,57 C32,57 35,54 38,59Z" fill="#FFD600" opacity="0.7" />
      {/* Scales */}
      <path d="M42,68 Q50,72 58,68" stroke="#B71C1C" strokeWidth="1.5" fill="none" opacity="0.6" />
      <path d="M40,76 Q50,80 60,76" stroke="#B71C1C" strokeWidth="1.5" fill="none" opacity="0.6" />
    </>
  );
}

// ─── WATER LINE ───────────────────────────────────────────────────────────────

function Dropkin() {
  return (
    <>
      <ellipse cx="50" cy="64" rx="30" ry="28" fill="#29B6F6" opacity="0.12" />
      {/* Teardrop body */}
      <path d="M50,18 C28,30 22,50 22,62 C22,80 34,90 50,90 C66,90 78,80 78,62 C78,50 72,30 50,18Z" fill="#29B6F6" />
      <path d="M50,24 C32,36 28,54 28,64 C28,78 36,86 50,86 C64,86 72,78 72,64 C72,54 68,36 50,24Z" fill="#4FC3F7" />
      {/* Highlight */}
      <ellipse cx="37" cy="40" rx="9" ry="14" fill="white" opacity="0.22" />
      {/* Water ripples on body */}
      <path d="M36,74 Q50,80 64,74" stroke="#0288D1" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M38,80 Q50,84 62,80" stroke="#0288D1" strokeWidth="1.5" fill="none" opacity="0.35" />
      {/* Face */}
      <Eyes lx={41} ly={56} rx={59} ry={56} r={7} />
      <Blush lx={30} ly={66} rx={70} ry={66} r={5.5} />
      <Smile cx={50} cy={68} w={9} />
    </>
  );
}

function Waveling() {
  return (
    <>
      <ellipse cx="50" cy="62" rx="34" ry="28" fill="#0288D1" opacity="0.1" />
      {/* Tail */}
      <path d="M16,66 C10,58 12,50 16,56 C18,62 20,60 22,54 C24,60 22,68 16,66Z" fill="#0277BD" />
      {/* Body */}
      <ellipse cx="52" cy="64" rx="28" ry="20" fill="#0288D1" />
      <ellipse cx="53" cy="62" rx="24" ry="16" fill="#29B6F6" />
      {/* Belly */}
      <ellipse cx="52" cy="68" rx="20" ry="11" fill="#B3E5FC" opacity="0.55" />
      {/* Dorsal fin */}
      <path d="M44,46 C42,34 48,27 52,36 C53,29 57,31 56,42Z" fill="#0277BD" />
      {/* Pectoral fin */}
      <path d="M70,66 C78,58 82,66 78,70 C75,66 72,68 70,66Z" fill="#4FC3F7" />
      {/* Head */}
      <circle cx="66" cy="56" r="15" fill="#29B6F6" />
      <circle cx="67" cy="54" r="12" fill="#4FC3F7" />
      {/* Eye */}
      <Eye cx={70} cy={50} r={5} />
      {/* Smile */}
      <path d="M62,62 Q68,68 75,64" stroke="#0277BD" strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  );
}

function Tidalore() {
  return (
    <>
      <circle cx="50" cy="55" r="40" fill="#01579B" opacity="0.1" />
      {/* Serpentine lower body */}
      <path d="M28,82 C18,74 18,60 26,52 C22,58 24,68 30,72 C26,62 32,50 40,48 C34,56 34,68 40,74Z" fill="#0277BD" />
      {/* Main body */}
      <ellipse cx="54" cy="62" rx="24" ry="18" fill="#0277BD" />
      <ellipse cx="54" cy="60" rx="20" ry="14" fill="#0288D1" />
      {/* Head */}
      <ellipse cx="66" cy="46" rx="20" ry="16" fill="#0288D1" />
      <ellipse cx="66" cy="44" rx="16" ry="12" fill="#29B6F6" />
      {/* Beard/chin detail */}
      <path d="M60,54 C62,60 68,62 72,58" stroke="#4FC3F7" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Spine fins */}
      <path d="M42,50 C40,40 44,32 47,40Z" fill="#4FC3F7" />
      <path d="M50,48 C48,38 52,30 55,38Z" fill="#4FC3F7" />
      <path d="M58,48 C56,38 60,30 63,38Z" fill="#4FC3F7" />
      {/* Wise, half-lidded eyes */}
      <ellipse cx="62" cy="42" rx="7" ry="4.5" fill="white" />
      <ellipse cx="73" cy="43" rx="7" ry="4.5" fill="white" />
      {/* Slit pupils */}
      <ellipse cx="62" cy="42" rx="2.5" ry="4" fill="#01579B" />
      <ellipse cx="73" cy="43" rx="2.5" ry="4" fill="#01579B" />
      <circle cx="61" cy="40" r="1.5" fill="white" />
      <circle cx="72" cy="41" r="1.5" fill="white" />
    </>
  );
}

// ─── GRASS LINE ───────────────────────────────────────────────────────────────

function Sproutie() {
  return (
    <>
      <circle cx="50" cy="67" r="32" fill="#4CAF50" opacity="0.12" />
      {/* Body */}
      <circle cx="50" cy="68" r="24" fill="#4CAF50" />
      <circle cx="50" cy="66" r="20" fill="#66BB6A" />
      {/* Belly */}
      <ellipse cx="50" cy="72" rx="12" ry="9" fill="#A5D6A7" opacity="0.5" />
      {/* Stem */}
      <rect x="48" y="39" width="4" height="12" rx="2" fill="#388E3C" />
      {/* Big leaf */}
      <ellipse cx="50" cy="28" rx="15" ry="9" fill="#8BC34A" transform="rotate(-18 50 28)" />
      <ellipse cx="50" cy="29" rx="12" ry="7" fill="#AED581" transform="rotate(-18 50 29)" />
      <path d="M54,22 Q50,34 42,37" stroke="#558B2F" strokeWidth="1.5" fill="none" />
      {/* Root nubs */}
      <path d="M38,90 C36,96 30,98 30,94" stroke="#388E3C" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M50,92 C50,98 50,100 50,98" stroke="#388E3C" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M62,90 C64,96 70,98 70,94" stroke="#388E3C" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Face */}
      <Eyes lx={42} ly={63} rx={58} ry={63} r={6.5} />
      <Blush lx={32} ly={71} rx={68} ry={71} r={5} />
      <Smile cx={50} cy={74} w={8} />
    </>
  );
}

function Fernling() {
  return (
    <>
      <ellipse cx="50" cy="62" rx="36" ry="30" fill="#388E3C" opacity="0.1" />
      {/* Leaf collar/frill (behind head) */}
      <ellipse cx="50" cy="52" rx="26" ry="10" fill="#8BC34A" />
      <ellipse cx="50" cy="50" rx="22" ry="8" fill="#AED581" />
      {/* Leaf midribs */}
      <path d="M50,44 L50,60" stroke="#558B2F" strokeWidth="1.5" opacity="0.6" />
      <path d="M36,48 L50,54" stroke="#558B2F" strokeWidth="1" opacity="0.5" />
      <path d="M64,48 L50,54" stroke="#558B2F" strokeWidth="1" opacity="0.5" />
      {/* Body */}
      <ellipse cx="50" cy="72" rx="20" ry="18" fill="#388E3C" />
      <ellipse cx="50" cy="70" rx="16" ry="14" fill="#4CAF50" />
      {/* Tail */}
      <path d="M66,76 C76,72 80,80 78,84 C74,80 70,80 68,76Z" fill="#388E3C" />
      {/* Legs */}
      <ellipse cx="38" cy="86" rx="6" ry="9" fill="#2E7D32" rx="6" />
      <ellipse cx="48" cy="88" rx="6" ry="9" fill="#2E7D32" />
      <ellipse cx="52" cy="88" rx="6" ry="9" fill="#2E7D32" />
      <ellipse cx="62" cy="86" rx="6" ry="9" fill="#2E7D32" />
      {/* Head */}
      <circle cx="50" cy="50" r="18" fill="#4CAF50" />
      <circle cx="50" cy="48" r="14" fill="#66BB6A" />
      {/* Face */}
      <Eyes lx={43} ly={46} rx={57} ry={46} r={5.5} />
      <Blush lx={36} ly={53} rx={64} ry={53} r={4} />
      <Smile cx={50} cy={56} w={7} />
      {/* Small tongue */}
      <path d="M48,57 L52,57 L50,60Z" fill="#EF5350" />
    </>
  );
}

function Verdanox() {
  return (
    <>
      <circle cx="50" cy="52" r="42" fill="#2E7D32" opacity="0.1" />
      {/* Root feet */}
      <path d="M32,90 C26,96 20,98 22,94 C26,92 30,90 32,86Z" fill="#4E342E" />
      <path d="M50,92 C50,98 50,100 50,96Z" fill="#4E342E" />
      <path d="M68,90 C74,96 80,98 78,94 C74,92 70,90 68,86Z" fill="#4E342E" />
      {/* Trunk */}
      <rect x="33" y="42" width="34" height="48" rx="8" fill="#4E342E" />
      <rect x="37" y="46" width="26" height="40" rx="6" fill="#6D4C41" />
      {/* Bark texture */}
      <path d="M42,52 Q50,56 58,52" stroke="#4E342E" strokeWidth="1.5" fill="none" opacity="0.6" />
      <path d="M40,62 Q50,66 60,62" stroke="#4E342E" strokeWidth="1.5" fill="none" opacity="0.6" />
      <path d="M42,72 Q50,76 58,72" stroke="#4E342E" strokeWidth="1.5" fill="none" opacity="0.6" />
      {/* Branch arms */}
      <path d="M33,50 C22,44 14,50 12,44 C18,42 25,46 32,48Z" fill="#5D4037" />
      <path d="M67,50 C78,44 86,50 88,44 C82,42 75,46 68,48Z" fill="#5D4037" />
      {/* Leaf clusters on branches */}
      <circle cx="10" cy="42" r="8" fill="#43A047" />
      <circle cx="90" cy="42" r="8" fill="#43A047" />
      {/* Canopy */}
      <ellipse cx="50" cy="26" rx="32" ry="22" fill="#2E7D32" />
      <ellipse cx="36" cy="30" rx="18" ry="14" fill="#388E3C" />
      <ellipse cx="64" cy="30" rx="18" ry="14" fill="#388E3C" />
      <ellipse cx="50" cy="20" rx="24" ry="18" fill="#43A047" />
      {/* Berries */}
      <circle cx="40" cy="14" r="3.5" fill="#E53935" />
      <circle cx="56" cy="16" r="3.5" fill="#E53935" />
      <circle cx="50" cy="10" r="3.5" fill="#E53935" />
      {/* Face in trunk — glowing eyes */}
      <ellipse cx="44" cy="56" rx="5" ry="4" fill="#1B5E20" />
      <ellipse cx="56" cy="56" rx="5" ry="4" fill="#1B5E20" />
      <ellipse cx="44" cy="56" rx="3.5" ry="3" fill="#76FF03" opacity="0.9" />
      <ellipse cx="56" cy="56" rx="3.5" ry="3" fill="#76FF03" opacity="0.9" />
      <circle cx="43" cy="55" r="1.2" fill="white" />
      <circle cx="55" cy="55" r="1.2" fill="white" />
      {/* Stern mouth */}
      <path d="M44,63 Q50,61 56,63" stroke="#4E342E" strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  );
}

// ─── ELECTRIC LINE ────────────────────────────────────────────────────────────

function Zappet() {
  return (
    <>
      <circle cx="50" cy="65" r="32" fill="#FFC107" opacity="0.15" />
      {/* Ears */}
      <ellipse cx="34" cy="30" rx="10" ry="20" fill="#FFCA28" />
      <ellipse cx="66" cy="30" rx="10" ry="20" fill="#FFCA28" />
      <ellipse cx="34" cy="30" rx="6" ry="15" fill="#F48FB1" />
      <ellipse cx="66" cy="30" rx="6" ry="15" fill="#F48FB1" />
      {/* Body */}
      <circle cx="50" cy="66" r="22" fill="#FFCA28" />
      <circle cx="50" cy="64" r="18" fill="#FFD54F" />
      {/* Belly */}
      <ellipse cx="50" cy="70" rx="11" ry="9" fill="#FFF8E1" opacity="0.65" />
      {/* Lightning cheek mark */}
      <path d="M34,58 L30,63 L35,63 L31,69" stroke="#FF6F00" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Face */}
      <Eyes lx={42} ly={61} rx={58} ry={61} r={6.5} />
      <Blush lx={32} ly={68} rx={68} ry={68} r={5.5} />
      <Smile cx={50} cy={72} w={8} />
      {/* Zigzag tail */}
      <path d="M66,76 L74,70 L70,64 L78,58" stroke="#FFA000" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="78" cy="58" r="4" fill="#FFD600" />
      {/* Sparks at tail tip */}
      <path d="M75,55 L78,51 M81,57 L85,55 M78,61 L82,63" stroke="#FFD600" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
    </>
  );
}

function Voltling() {
  return (
    <>
      <circle cx="50" cy="60" r="34" fill="#FFA000" opacity="0.12" />
      {/* Spiky fur around head */}
      <path d="M29,40 C26,30 32,23 34,32Z" fill="#FF8F00" />
      <path d="M35,33 C35,22 41,18 41,28Z" fill="#FF8F00" />
      <path d="M59,28 C59,18 65,22 65,33Z" fill="#FF8F00" />
      <path d="M66,32 C68,23 74,30 71,40Z" fill="#FF8F00" />
      {/* Body */}
      <ellipse cx="50" cy="74" rx="23" ry="18" fill="#FF8F00" />
      <ellipse cx="50" cy="72" rx="19" ry="14" fill="#FFB300" />
      {/* Head */}
      <circle cx="50" cy="50" r="22" fill="#FFB300" />
      <circle cx="50" cy="48" r="18" fill="#FFCA28" />
      {/* Floppy ears */}
      <ellipse cx="32" cy="50" rx="9" ry="13" fill="#FF8F00" transform="rotate(15 32 50)" />
      <ellipse cx="68" cy="50" rx="9" ry="13" fill="#FF8F00" transform="rotate(-15 68 50)" />
      {/* Snout */}
      <ellipse cx="50" cy="55" rx="11" ry="7" fill="#FFE082" />
      {/* Lightning forehead bolt */}
      <path d="M46,34 L50,40 L46,40 L50,46" stroke="#FF6F00" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Face */}
      <Eyes lx={42} ly={48} rx={58} ry={48} r={5.5} />
      {/* Tongue */}
      <path d="M45,59 Q50,64 55,59" stroke="#EF5350" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Sparks */}
      <path d="M19,54 L15,49 M19,54 L13,55 M19,54 L17,62" stroke="#FFD600" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <path d="M81,54 L85,49 M81,54 L87,55 M81,54 L83,62" stroke="#FFD600" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    </>
  );
}

function Thunderax() {
  return (
    <>
      <circle cx="50" cy="50" r="44" fill="#F57F17" opacity="0.08" />
      {/* Lightning mane — radiating spikes */}
      {([0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330] as number[]).map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 50 + 22 * Math.cos(rad);
        const y1 = 47 + 22 * Math.sin(rad);
        const xm = 50 + 31 * Math.cos(rad + 0.15);
        const ym = 47 + 31 * Math.sin(rad + 0.15);
        const x2 = 50 + 40 * Math.cos(rad);
        const y2 = 47 + 40 * Math.sin(rad);
        return (
          <polygon
            key={i}
            points={`${x1},${y1} ${xm},${ym} ${x2},${y2}`}
            fill={i % 2 === 0 ? '#FFB300' : '#FFD54F'}
          />
        );
      })}
      {/* Body */}
      <ellipse cx="50" cy="76" rx="20" ry="16" fill="#E65100" />
      {/* Head */}
      <circle cx="50" cy="47" r="21" fill="#F57F17" />
      <circle cx="50" cy="45" r="17" fill="#FF8F00" />
      {/* Ears */}
      <polygon points="33,36 37,22 44,35" fill="#E65100" />
      <polygon points="56,35 63,22 67,36" fill="#E65100" />
      {/* Muzzle */}
      <ellipse cx="50" cy="53" rx="9" ry="6" fill="#FFA726" opacity="0.7" />
      {/* Regal half-lidded eyes */}
      <ellipse cx="42" cy="43" rx="6.5" ry="4.5" fill="#FFE082" />
      <ellipse cx="58" cy="43" rx="6.5" ry="4.5" fill="#FFE082" />
      <ellipse cx="42" cy="43" rx="4" ry="3.5" fill="#1a1a1a" />
      <ellipse cx="58" cy="43" rx="4" ry="3.5" fill="#1a1a1a" />
      <circle cx="41" cy="42" r="1.5" fill="white" />
      <circle cx="57" cy="42" r="1.5" fill="white" />
      {/* Strong brow */}
      <path d="M37,39 Q42,36 47,39" stroke="#E65100" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M53,39 Q58,36 63,39" stroke="#E65100" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Tail with lightning */}
      <path d="M62,80 C70,76 74,70 78,74 L76,70 L80,68 L76,66" stroke="#FFD54F" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

// ─── SHADOW LINE ──────────────────────────────────────────────────────────────

function Dimlit() {
  return (
    <>
      {/* Purple glow aura */}
      <circle cx="50" cy="60" r="36" fill="#7E57C2" opacity="0.08" />
      {/* Body */}
      <ellipse cx="50" cy="74" rx="19" ry="15" fill="#37474F" />
      {/* Head */}
      <circle cx="50" cy="54" r="22" fill="#37474F" />
      <circle cx="50" cy="52" r="18" fill="#455A64" />
      {/* Sharp ears */}
      <polygon points="31,40 36,18 45,38" fill="#263238" />
      <polygon points="55,38 64,18 69,40" fill="#263238" />
      <polygon points="33,39 37,24 44,37" fill="#7E57C2" opacity="0.35" />
      <polygon points="56,37 63,24 68,39" fill="#7E57C2" opacity="0.35" />
      {/* Glowing purple eyes */}
      <ellipse cx="41" cy="52" rx="8" ry="6.5" fill="#7E57C2" />
      <ellipse cx="59" cy="52" rx="8" ry="6.5" fill="#7E57C2" />
      <ellipse cx="41" cy="52" rx="5.5" ry="4.5" fill="#CE93D8" />
      <ellipse cx="59" cy="52" rx="5.5" ry="4.5" fill="#CE93D8" />
      <ellipse cx="41" cy="52" rx="2.5" ry="3.5" fill="#1a1a1a" />
      <ellipse cx="59" cy="52" rx="2.5" ry="3.5" fill="#1a1a1a" />
      <circle cx="40" cy="50" r="1.8" fill="white" opacity="0.8" />
      <circle cx="58" cy="50" r="1.8" fill="white" opacity="0.8" />
      {/* Crescent moon on forehead */}
      <path d="M44,40 Q50,36 56,40 Q52,37 48,40Z" fill="#7E57C2" opacity="0.7" />
      {/* Whiskers */}
      <path d="M28,59 L40,56 M28,62 L40,59" stroke="#607D8B" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <path d="M72,59 L60,56 M72,62 L60,59" stroke="#607D8B" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      {/* Wispy tail */}
      <path d="M66,76 C76,70 80,60 78,50 C82,56 80,70 74,78" stroke="#37474F" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M66,76 C76,70 80,60 78,50 C82,56 80,70 74,78" stroke="#7E57C2" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4" />
    </>
  );
}

function Gloomling() {
  return (
    <>
      {/* Shadow aura */}
      <circle cx="50" cy="58" r="42" fill="#4A148C" opacity="0.07" />
      {/* Shadow wisps */}
      <ellipse cx="18" cy="64" rx="13" ry="8" fill="#1a1a1a" opacity="0.35" />
      <ellipse cx="82" cy="62" rx="13" ry="8" fill="#1a1a1a" opacity="0.35" />
      <ellipse cx="50" cy="88" rx="22" ry="9" fill="#1a1a1a" opacity="0.25" />
      {/* Body */}
      <ellipse cx="50" cy="74" rx="24" ry="20" fill="#212121" />
      <ellipse cx="50" cy="72" rx="20" ry="16" fill="#263238" />
      {/* Head */}
      <ellipse cx="50" cy="50" rx="26" ry="22" fill="#212121" />
      <ellipse cx="50" cy="48" rx="22" ry="18" fill="#263238" />
      {/* Wolf ears */}
      <polygon points="28,36 33,14 42,34" fill="#1a1a1a" />
      <polygon points="58,34 67,14 72,36" fill="#1a1a1a" />
      <polygon points="30,35 34,20 40,33" fill="#4A148C" opacity="0.45" />
      <polygon points="60,33 66,20 71,35" fill="#4A148C" opacity="0.45" />
      {/* Snout */}
      <ellipse cx="50" cy="58" rx="14" ry="9" fill="#263238" />
      <ellipse cx="50" cy="55" rx="9" ry="6" fill="#37474F" />
      {/* Nose */}
      <ellipse cx="50" cy="53" rx="4" ry="2.8" fill="#4A148C" />
      {/* Glowing eyes */}
      <ellipse cx="40" cy="46" rx="7.5" ry="5.5" fill="#7B1FA2" />
      <ellipse cx="60" cy="46" rx="7.5" ry="5.5" fill="#7B1FA2" />
      <ellipse cx="40" cy="46" rx="5" ry="4" fill="#CE93D8" />
      <ellipse cx="60" cy="46" rx="5" ry="4" fill="#CE93D8" />
      <ellipse cx="40" cy="46" rx="2" ry="3.2" fill="#0D0D1A" />
      <ellipse cx="60" cy="46" rx="2" ry="3.2" fill="#0D0D1A" />
      <circle cx="39" cy="44" r="1.5" fill="white" opacity="0.7" />
      <circle cx="59" cy="44" r="1.5" fill="white" opacity="0.7" />
      {/* Shadow tendrils */}
      <path d="M28,74 C20,70 16,80 18,84" stroke="#1a1a1a" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.65" />
      <path d="M72,74 C80,70 84,80 82,84" stroke="#1a1a1a" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.65" />
    </>
  );
}

function Voidrex() {
  return (
    <>
      {/* Void aura */}
      <circle cx="50" cy="52" r="44" fill="#4A148C" opacity="0.09" />
      {/* Spreading wings (behind body) */}
      <path d="M30,58 C14,44 6,26 14,14 C20,28 24,40 28,52Z" fill="#0D0D1A" />
      <path d="M70,58 C86,44 94,26 86,14 C80,28 76,40 72,52Z" fill="#0D0D1A" />
      <path d="M30,54 C18,42 12,28 18,18 C22,30 26,42 30,52Z" fill="#1A1A2E" opacity="0.7" />
      <path d="M70,54 C82,42 88,28 82,18 C78,30 74,42 70,52Z" fill="#1A1A2E" opacity="0.7" />
      {/* Body */}
      <ellipse cx="50" cy="76" rx="26" ry="18" fill="#0D0D1A" />
      <ellipse cx="50" cy="74" rx="22" ry="14" fill="#1A1A2E" />
      {/* Neck */}
      <ellipse cx="50" cy="62" rx="14" ry="10" fill="#0D0D1A" />
      {/* Head */}
      <ellipse cx="50" cy="48" rx="24" ry="20" fill="#0D0D1A" />
      <ellipse cx="50" cy="46" rx="20" ry="16" fill="#1A1A2E" />
      {/* Horns */}
      <path d="M36,34 C30,22 28,10 32,6 C32,18 36,28 36,34Z" fill="#1A1A2E" />
      <path d="M64,34 C70,22 72,10 68,6 C68,18 64,28 64,34Z" fill="#1A1A2E" />
      <path d="M36,34 C31,24 30,14 33,10 C33,20 36,28 36,34Z" fill="#7C4DFF" opacity="0.4" />
      <path d="M64,34 C69,24 70,14 67,10 C67,20 64,28 64,34Z" fill="#7C4DFF" opacity="0.4" />
      {/* THE VOID EYE — dominant central feature */}
      <ellipse cx="50" cy="44" rx="17" ry="14" fill="#0D0D0D" />
      <ellipse cx="50" cy="44" rx="13" ry="10" fill="#4A148C" opacity="0.85" />
      <ellipse cx="50" cy="44" rx="9" ry="7" fill="#7C4DFF" />
      <ellipse cx="50" cy="44" rx="5" ry="4" fill="#B388FF" />
      <circle cx="50" cy="44" r="2.5" fill="white" />
      <circle cx="47" cy="42" r="1.5" fill="white" opacity="0.6" />
      {/* Smaller side eyes */}
      <ellipse cx="33" cy="47" rx="4" ry="3" fill="#7C4DFF" opacity="0.5" />
      <ellipse cx="67" cy="47" rx="4" ry="3" fill="#7C4DFF" opacity="0.5" />
      {/* Void tendrils */}
      <path d="M26,70 C18,74 14,82 18,88" stroke="#7C4DFF" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M74,70 C82,74 86,82 82,88" stroke="#7C4DFF" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M38,84 C34,90 32,96 36,98" stroke="#7C4DFF" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4" />
      <path d="M62,84 C66,90 68,96 64,98" stroke="#7C4DFF" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4" />
    </>
  );
}

// ─── SPRITE REGISTRY ──────────────────────────────────────────────────────────

const SPRITES: Record<string, () => React.ReactElement> = {
  embrit:    Embrit,
  scorchlet: Scorchlet,
  infernox:  Infernox,
  dropkin:   Dropkin,
  waveling:  Waveling,
  tidalore:  Tidalore,
  sproutie:  Sproutie,
  fernling:  Fernling,
  verdanox:  Verdanox,
  zappet:    Zappet,
  voltling:  Voltling,
  thunderax: Thunderax,
  dimlit:    Dimlit,
  gloomling: Gloomling,
  voidrex:   Voidrex,
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────

interface CreatureSpriteProps {
  creatureId: string;
  size?: number;
  flipX?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function CreatureSprite({ creatureId, size = 80, flipX = false, className, style }: CreatureSpriteProps) {
  const SpriteContent = SPRITES[creatureId] ?? SPRITES['embrit'];

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      style={{
        overflow: 'visible',
        transform: flipX ? 'scaleX(-1)' : undefined,
        flexShrink: 0,
        ...style,
      }}
    >
      <SpriteContent />
    </svg>
  );
}
