import type { Species } from "@/lib/types";

export type MascotMood = "feliz" | "estudando" | "comemorando" | "calmo";

const BODY = "#f5f9ff";
const SHADE = "#cddbf7";
const BLUE = "#3b78f5";
const BLUE_DARK = "#1c3f9e";
const VISOR = "#14308a";
const EYE = "#6ee0ff";

function Ears({ species }: { species: Species }) {
  switch (species) {
    case "Gato Robô":
      return (
        <g>
          <path d="M58 62 L54 16 L92 44 Z" fill={BLUE} />
          <path d="M142 62 L146 16 L108 44 Z" fill={BLUE} />
          <path d="M62 52 L60 28 L80 44 Z" fill="#ffb3c7" />
          <path d="M138 52 L140 28 L120 44 Z" fill="#ffb3c7" />
        </g>
      );
    case "Pássaro Robô":
      return (
        <g>
          <path d="M100 40 C94 22 84 18 78 20 C86 26 90 34 92 42 Z" fill={BLUE} />
          <path d="M100 40 C100 18 100 12 100 8 C106 18 108 28 106 42 Z" fill="#7aa5ff" />
          <path d="M100 40 C106 22 116 18 122 20 C114 26 110 34 108 42 Z" fill={BLUE} />
        </g>
      );
    case "Dragão Robô":
      return (
        <g>
          <path d="M66 58 C54 40 56 22 44 14 C64 16 80 34 84 52 Z" fill={BLUE_DARK} />
          <path d="M134 58 C146 40 144 22 156 14 C136 16 120 34 116 52 Z" fill={BLUE_DARK} />
          <path d="M92 44 L100 28 L108 44 Z" fill={BLUE} />
        </g>
      );
    case "Tigre Robô":
      return (
        <g>
          <circle cx="64" cy="50" r="17" fill={BLUE} />
          <circle cx="136" cy="50" r="17" fill={BLUE} />
          <circle cx="64" cy="50" r="9" fill="#ffd9a0" />
          <circle cx="136" cy="50" r="9" fill="#ffd9a0" />
          <path d="M88 44 L92 56 M100 40 L100 54 M112 44 L108 56" stroke={BLUE_DARK} strokeWidth="4" strokeLinecap="round" />
        </g>
      );
    case "Cobra Robô":
      return (
        <g>
          <ellipse cx="52" cy="84" rx="16" ry="28" fill={BLUE} />
          <ellipse cx="148" cy="84" rx="16" ry="28" fill={BLUE} />
        </g>
      );
    default:
      return (
        <g>
          <path d="M62 64 L46 14 Q74 24 86 52 Z" fill={BLUE} />
          <path d="M138 64 L154 14 Q126 24 114 52 Z" fill={BLUE} />
          <path d="M62 56 L54 30 Q70 38 78 52 Z" fill="#8db4ff" />
          <path d="M138 56 L146 30 Q130 38 122 52 Z" fill="#8db4ff" />
        </g>
      );
  }
}

function Extras({ species }: { species: Species }) {
  if (species === "Pássaro Robô") return <path d="M100 108 L90 118 L100 128 L110 118 Z" fill="#ffb347" />;
  if (species === "Cobra Robô")
    return <path d="M100 120 L100 132 M100 132 L94 138 M100 132 L106 138" stroke="#ff5c7a" strokeWidth="3" strokeLinecap="round" fill="none" />;
  if (species === "Gato Robô")
    return <path d="M70 108 L46 104 M70 114 L46 118 M130 108 L154 104 M130 114 L154 118" stroke={SHADE} strokeWidth="2" strokeLinecap="round" />;
  if (species === "Dragão Robô")
    return (
      <g>
        <path d="M26 120 C10 108 8 86 22 76 C22 92 34 98 44 100 Z" fill={BLUE} opacity="0.9" />
        <path d="M174 120 C190 108 192 86 178 76 C178 92 166 98 156 100 Z" fill={BLUE} opacity="0.9" />
      </g>
    );
  return null;
}

export function Mascot({
  species = "Cão Robô",
  mood = "feliz",
  size = 160,
  float = true,
  className = "",
}: {
  species?: Species;
  mood?: MascotMood;
  size?: number;
  float?: boolean;
  className?: string;
}) {
  const happyEyes = mood === "comemorando" || mood === "calmo";
  return (
    <svg
      viewBox="0 0 200 210"
      width={size}
      height={(size * 210) / 200}
      className={`${float ? "float" : ""} ${className}`}
      role="img"
      aria-label={`Mascote ${species}`}
    >
      <defs>
        <linearGradient id={`body-${species}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor={SHADE} />
        </linearGradient>
        <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor={EYE} />
        </radialGradient>
      </defs>

      <ellipse cx="100" cy="198" rx="50" ry="6" fill="#1c3f9e" opacity="0.12" />

      {/* rabo (cão) */}
      {species === "Cão Robô" && (
        <g className="wag">
          <path d="M132 168 C158 160 160 140 152 128" stroke={BLUE} strokeWidth="5" fill="none" strokeLinecap="round" />
          <circle cx="152" cy="126" r="6" fill={BLUE} />
        </g>
      )}
      {species === "Cobra Robô" && (
        <path d="M130 176 C170 176 176 150 150 148 C134 146 140 164 160 162" stroke={BLUE} strokeWidth="9" fill="none" strokeLinecap="round" />
      )}

      <Extras species={species} />

      {/* corpo */}
      <rect x="68" y="136" width="64" height="52" rx="22" fill={`url(#body-${species})`} stroke={SHADE} strokeWidth="2" />
      <rect x="86" y="148" width="28" height="22" rx="9" fill={BLUE} />
      <path d="M92 159 l5 5 l10 -10" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={mood === "estudando" ? 0 : 0.95} />
      <circle cx="100" cy="159" r="3" fill="#fff" opacity={mood === "estudando" ? 0.95 : 0} />
      {/* patas */}
      <rect x="72" y="176" width="22" height="18" rx="9" fill={BODY} stroke={SHADE} strokeWidth="2" />
      <rect x="106" y="176" width="22" height="18" rx="9" fill={BODY} stroke={SHADE} strokeWidth="2" />
      <rect x="72" y="186" width="22" height="6" rx="3" fill={BLUE} />
      <rect x="106" y="186" width="22" height="6" rx="3" fill={BLUE} />

      <Ears species={species} />

      {/* cabeça */}
      <rect x="42" y="50" width="116" height="92" rx="44" fill={`url(#body-${species})`} stroke={SHADE} strokeWidth="2" />
      <circle cx="46" cy="96" r="9" fill={BLUE} />
      <circle cx="154" cy="96" r="9" fill={BLUE} />
      <circle cx="46" cy="96" r="4" fill="#fff" opacity="0.8" />
      <circle cx="154" cy="96" r="4" fill="#fff" opacity="0.8" />
      {species === "Dragão Robô" && <path d="M100 52 L100 60" stroke={BLUE_DARK} strokeWidth="3" />}
      {/* visor */}
      <rect x="56" y="70" width="88" height="50" rx="25" fill={VISOR} />
      <path d="M68 78 Q100 70 132 78" stroke="#fff" strokeWidth="2.5" opacity="0.18" fill="none" strokeLinecap="round" />

      {happyEyes ? (
        <g stroke={EYE} strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M72 100 Q81 88 90 100" />
          <path d="M110 100 Q119 88 128 100" />
        </g>
      ) : (
        <g className="blink">
          <ellipse cx="81" cy="96" rx="9" ry="11" fill="url(#glow)" />
          <ellipse cx="119" cy="96" rx="9" ry="11" fill="url(#glow)" />
          <circle cx="84" cy="92" r="3" fill="#fff" />
          <circle cx="122" cy="92" r="3" fill="#fff" />
        </g>
      )}
      <path d="M90 112 Q100 120 110 112" stroke={EYE} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9" />

      {/* nariz / focinho */}
      {species !== "Pássaro Robô" && <ellipse cx="100" cy="128" rx="6" ry="4" fill={BLUE_DARK} />}

      {/* antena */}
      <path d="M156 70 C168 60 172 44 166 34" stroke={BLUE} strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="166" cy="32" r="5" fill="#ff6b8e" />

      {/* adereços por humor */}
      {mood === "estudando" && (
        <g>
          <rect x="62" y="140" width="76" height="44" rx="6" fill="#2f6bf2" />
          <rect x="66" y="144" width="68" height="36" rx="4" fill="#4d86ff" />
          <path d="M100 144 L100 180" stroke="#1c3f9e" strokeWidth="2" />
          <text x="82" y="166" fontSize="8" fill="#fff" textAnchor="middle" fontWeight="800">♥</text>
          <text x="118" y="166" fontSize="8" fill="#fff" textAnchor="middle" fontWeight="800">♥</text>
        </g>
      )}
      {mood === "comemorando" && (
        <g fill="#ffcc33">
          <path d="M20 40 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" />
          <path d="M176 70 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5z" />
          <circle cx="36" cy="108" r="3" fill="#ff6b8e" />
          <circle cx="170" cy="30" r="3" fill="#5b8cff" />
        </g>
      )}
    </svg>
  );
}
