import { Component, OnInit, OnDestroy, AfterViewInit, HostListener, HostBinding, ViewChild, ElementRef } from '@angular/core';
// API detached for now — re-enable these to restore AI palette generation:
// import { inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
// import { GatewayService } from '../gateway.service';

const DEFAULT_RAINBOW = [
  { hex: '#FF0000' },
  { hex: '#FF7F00' },
  { hex: '#FFFF00' },
  { hex: '#00FF00' },
  { hex: '#0000FF' },
  { hex: '#4B0082' },
  { hex: '#9400D3' },
];

// Hardcoded soft pastel rainbow used as the default palette and local fallback,
// so the page always has a chill, dreamy gradient (pink -> peach -> yellow ->
// mint -> aqua).
const CYBERPUNK_FALLBACK = [
  { hex: '#FBB6E0', name: 'Pastel Pink', role: 'primary', rgb: [251, 182, 224] },
  { hex: '#FFC9B5', name: 'Soft Peach', role: 'secondary', rgb: [255, 201, 181] },
  { hex: '#FDE9A9', name: 'Butter Yellow', role: 'accent', rgb: [253, 233, 169] },
  { hex: '#DDF5A6', name: 'Lime Mist', role: 'secondary', rgb: [221, 245, 166] },
  { hex: '#AEEFC6', name: 'Mint Green', role: 'accent', rgb: [174, 239, 198] },
  { hex: '#A9EEE6', name: 'Seafoam', role: 'primary', rgb: [169, 238, 230] },
  { hex: '#A7DBF5', name: 'Sky Aqua', role: 'background', rgb: [167, 219, 245] },
];

// Searchable, named themed palettes. Type a name in the search box (Enter) to
// load one. Keys are lowercased for case-insensitive matching.
const PALETTES: Record<string, { hex: string }[]> = {
  pastel: CYBERPUNK_FALLBACK,
  sunset: [
    { hex: '#FF6B6B' }, { hex: '#FF8E72' }, { hex: '#FFB05C' },
    { hex: '#FFD56B' }, { hex: '#F98A8A' }, { hex: '#C9508A' }, { hex: '#6A2C70' },
  ],
  ocean: [
    { hex: '#001F54' }, { hex: '#034078' }, { hex: '#1282A2' },
    { hex: '#3AA6B9' }, { hex: '#5FD0DF' }, { hex: '#A2E8F0' }, { hex: '#E0FBFF' },
  ],
  forest: [
    { hex: '#0B3D2E' }, { hex: '#14532D' }, { hex: '#2E7D32' },
    { hex: '#4CAF50' }, { hex: '#8BC34A' }, { hex: '#C5E1A5' }, { hex: '#EDF7E0' },
  ],
  lavender: [
    { hex: '#2E1A47' }, { hex: '#5E3B8C' }, { hex: '#8E6FCB' },
    { hex: '#B79CED' }, { hex: '#D6C4F5' }, { hex: '#E9DEFB' }, { hex: '#F6F0FF' },
  ],
  autumn: [
    { hex: '#3D1E0F' }, { hex: '#7B341E' }, { hex: '#B5541B' },
    { hex: '#D97B29' }, { hex: '#E9A63C' }, { hex: '#F2C57C' }, { hex: '#F7E1B5' },
  ],
  neon: [
    { hex: '#FF00A0' }, { hex: '#FF2079' }, { hex: '#FE00FE' },
    { hex: '#00F0FF' }, { hex: '#00FF9F' }, { hex: '#B4FF00' }, { hex: '#FEE440' },
  ],
  fire: [
    { hex: '#1A0000' }, { hex: '#4D0000' }, { hex: '#990000' },
    { hex: '#E23E00' }, { hex: '#FF7A00' }, { hex: '#FFB300' }, { hex: '#FFE066' },
  ],
  aurora: [
    { hex: '#011627' }, { hex: '#023E5C' }, { hex: '#0E7C7B' },
    { hex: '#17C3B2' }, { hex: '#7DE2D1' }, { hex: '#B8F2E6' }, { hex: '#D9FFF5' },
  ],
  candy: [
    { hex: '#FF5FA2' }, { hex: '#FF8FC7' }, { hex: '#FFB3DE' },
    { hex: '#FFD1E8' }, { hex: '#C8B6FF' }, { hex: '#9BF6FF' }, { hex: '#CAFFBF' },
  ],
  mono: [
    { hex: '#0A0A0A' }, { hex: '#2B2B2B' }, { hex: '#4D4D4D' },
    { hex: '#7A7A7A' }, { hex: '#A6A6A6' }, { hex: '#D4D4D4' }, { hex: '#F5F5F5' },
  ],
  cyberpunk: [
    { hex: '#0D0221' }, { hex: '#241734' }, { hex: '#7B2FFF' },
    { hex: '#FF00A0' }, { hex: '#00F0FF' }, { hex: '#0AF5A3' }, { hex: '#FEE440' },
  ],
  rose: [
    { hex: '#4A0E2E' }, { hex: '#8C1C4C' }, { hex: '#C13B6B' },
    { hex: '#E86A92' }, { hex: '#F3A0B8' }, { hex: '#F9C9D6' }, { hex: '#FDE7EC' },
  ],
  mint: [
    { hex: '#04352E' }, { hex: '#0B6E52' }, { hex: '#1FA37A' },
    { hex: '#4FD1A5' }, { hex: '#8CE8C6' }, { hex: '#BFF5E1' }, { hex: '#E6FFF6' },
  ],
  peach: [
    { hex: '#7A2E2E' }, { hex: '#C24E38' }, { hex: '#F0754C' },
    { hex: '#FF9E6D' }, { hex: '#FFC29A' }, { hex: '#FFDDC4' }, { hex: '#FFF1E8' },
  ],
  galaxy: [
    { hex: '#0B0B2B' }, { hex: '#241B54' }, { hex: '#4B2E83' },
    { hex: '#7A3FB0' }, { hex: '#A85CD1' }, { hex: '#D89CF0' }, { hex: '#F1D6FF' },
  ],
  desert: [
    { hex: '#4A2C15' }, { hex: '#87582C' }, { hex: '#B98A4B' },
    { hex: '#D7B377' }, { hex: '#E8CE9E' }, { hex: '#F2E2C4' }, { hex: '#FBF5E7' },
  ],
  tropical: [
    { hex: '#004D40' }, { hex: '#00897B' }, { hex: '#26C6A6' },
    { hex: '#66E0C0' }, { hex: '#FFD54F' }, { hex: '#FF8A65' }, { hex: '#FF5E7E' },
  ],
  vaporwave: [
    { hex: '#2B0F54' }, { hex: '#6A1E9C' }, { hex: '#B32DB0' },
    { hex: '#FF2E97' }, { hex: '#FF6EC7' }, { hex: '#59D8E6' }, { hex: '#B8F0FF' },
  ],
  sakura: [
    { hex: '#5C2A3E' }, { hex: '#9E4A63' }, { hex: '#D0748E' },
    { hex: '#F0A6BC' }, { hex: '#FAC9D8' }, { hex: '#FDE3EC' }, { hex: '#FFF5F8' },
  ],
  citrus: [
    { hex: '#7A4A00' }, { hex: '#C77800' }, { hex: '#F0A500' },
    { hex: '#FFC93C' }, { hex: '#E8E020' }, { hex: '#B6E33B' }, { hex: '#7CC900' },
  ],
  berry: [
    { hex: '#2A0A29' }, { hex: '#5C0F4C' }, { hex: '#8E1B6B' },
    { hex: '#BE2C8A' }, { hex: '#E05CA8' }, { hex: '#F094C6' }, { hex: '#FAD0E5' },
  ],
  slate: [
    { hex: '#0F172A' }, { hex: '#1E293B' }, { hex: '#334155' },
    { hex: '#64748B' }, { hex: '#94A3B8' }, { hex: '#CBD5E1' }, { hex: '#F1F5F9' },
  ],
  // --- Dark, moody palettes (kept in the deep luminance range) ---
  midnight: [
    { hex: '#020210' }, { hex: '#070B2E' }, { hex: '#0E1A4A' },
    { hex: '#15275F' }, { hex: '#1E3A73' }, { hex: '#2A4E8A' }, { hex: '#3A63A6' },
  ],
  obsidian: [
    { hex: '#000000' }, { hex: '#0A0A0A' }, { hex: '#141414' },
    { hex: '#1F1F1F' }, { hex: '#2B2B2B' }, { hex: '#3A3A3A' }, { hex: '#4A4A4A' },
  ],
  deepsea: [
    { hex: '#00131A' }, { hex: '#012A38' }, { hex: '#01455C' },
    { hex: '#046073' }, { hex: '#077A8C' }, { hex: '#0B94A6' }, { hex: '#12AEBF' },
  ],
  wine: [
    { hex: '#160208' }, { hex: '#33060F' }, { hex: '#520B1B' },
    { hex: '#731427' }, { hex: '#8E1F35' }, { hex: '#A82C46' }, { hex: '#C13A59' },
  ],
  ember: [
    { hex: '#0A0400' }, { hex: '#1F0C02' }, { hex: '#3D1904' },
    { hex: '#5E2A06' }, { hex: '#8A3F09' }, { hex: '#B5560E' }, { hex: '#E0741A' },
  ],
  mossdark: [
    { hex: '#03120B' }, { hex: '#0A2417' }, { hex: '#123825' },
    { hex: '#1C4E34' }, { hex: '#276645' }, { hex: '#337F57' }, { hex: '#419A6C' },
  ],
  void: [
    { hex: '#050008' }, { hex: '#120026' }, { hex: '#20003F' },
    { hex: '#31005C' }, { hex: '#460A7A' }, { hex: '#5C1A99' }, { hex: '#7530B8' },
  ],
};

@Component({
  selector: 'app-page-color',
  imports: [FormsModule],
  templateUrl: './page-first.html',
  styleUrl: './page-first.scss',
})
export class PageFirst implements OnInit, AfterViewInit, OnDestroy {
  // API detached for now — re-enable to restore AI palette generation:
  // private gateway = inject(GatewayService);

  // Palette grid state (bound by the template).
  theme = '';
  colors: any[] = [];
  loading = false;

  // Colors currently painted on screen (interpolated between two palettes).
  rainbowColors: any[] = [];
  // Base palette (used when a specific palette is pinned via search).
  private baseColors: any[] = [];
  private rainbowRaf: number | null = null;
  private lastFrameTs = 0;

  // Auto-cycle: the default rainbow smoothly morphs through ALL palettes in
  // order, then loops. `cycleProgress` is a continuous index into paletteKeys.
  private cycleProgress = 0;
  private autoCycle = true; // false once the user pins a palette via search
  // Seconds to spend transitioning from one palette to the next.
  private static readonly PALETTE_TRANSITION_SEC = 12;

  // One-shot intro after a pick: the whole page becomes the solid picked color,
  // then eases into the nearest cycle palette before normal cycling resumes.
  private introFrom: string[] | null = null; // solid color repeated per stop
  private introTo: string[] | null = null; // nearest palette (light->dark)
  private introProgress = 0; // 0..1
  private static readonly INTRO_HOLD_SEC = 0.7; // hold the solid color first
  private static readonly INTRO_TRANSITION_SEC = 2.5; // then ease into palette
  private introHoldElapsed = 0;

  showRainbow = false;

  // Glowing cursor + trail.
  // The cursor stays hidden until the user has moved a cumulative distance
  // past REVEAL_THRESHOLD_PX, then it appears and starts trailing.
  private static readonly REVEAL_THRESHOLD_PX = 1500;
  // The cursor auto-hides after this many ms of no mouse movement.
  private static readonly IDLE_HIDE_MS = 4_000;
  cursorVisible = false;
  cursorPos = { x: 0, y: 0 };
  trail: { x: number; y: number }[] = [];
  private movedDistance = 0;
  private lastPointer: { x: number; y: number } | null = null;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;

  // Color-selection gesture:
  //   double-click -> ring shrinks to a small aiming dot (`aiming = true`)
  aiming = false;
  // The color currently under the ring center (drives the dot's tint).
  hoverColor = '';
  // Outline/glow color for the cursor, chosen to contrast the background under
  // it so a bright color doesn't make the cursor disappear.
  outlineColor = 'rgba(255,255,255,0.9)';

  // Radial bloom state: set on confirm, cleared after the animation ends.
  bloomActive = false;
  bloomX = 0;
  bloomY = 0;
  bloomGradient = '';
  // Random seed for the SVG ink-turbulence filter — new value each bloom so
  // every ink shape looks different.
  bloomSeed = 0;

  // Cursor-driven WATER SIMULATION (replaces the old CSS ring ripples).
  // A low-res height-field grid stepped by the 2D wave equation each frame:
  //   next[i] = (prev[left]+prev[right]+prev[up]+prev[down]) / 2  -  curr[i]
  //   next[i] *= damping
  // Cursor moves push a Gaussian dent into the field, so a dragging hand
  // leaves a real wake (velocity -> depth) and overlapping disturbances
  // interfere just like water.
  @ViewChild('waterCanvas') waterCanvasRef?: ElementRef<HTMLCanvasElement>;
  private waterCtx: CanvasRenderingContext2D | null = null;
  private waterImg: ImageData | null = null;
  private waterPrev: Float32Array | null = null;
  private waterCurr: Float32Array | null = null;
  private waterW = 520;   // sim grid width  (cells) — higher = less pixelation
  private waterH = 300;   // sim grid height (cells)
  private waterRaf: number | null = null;
  private waterResizeBound: (() => void) | null = null;
  private lastWaterPoint: { x: number; y: number; t: number } | null = null;
  // Smoothed motion state — updated per pointer event via low-pass filters.
  // Using smoothed values (instead of raw last-frame deltas) prevents the
  // "vel goes to 0" flicker between OS mouse events and makes the water
  // respond to actual motion feel rather than sample-to-sample jitter.
  private motionVx = 0;        // cells / ms, smoothed
  private motionVy = 0;
  private motionSpeed = 0;     // |v|, smoothed
  private motionDirX = 0;      // unit direction (persists during pauses)
  private motionDirY = 0;
  private prevMotionSpeed = 0; // for acceleration detection
  // Advance the physics only every Nth frame so ripples spread visibly slower
  // (each RAF still paints, so motion stays smooth — only the wave speed drops).
  private static readonly WATER_STEP_EVERY = 3;
  private waterStepPhase = 0;
  // Smoothed visibility 0..1 based on background luminance under the cursor:
  // ~0.30 over pale colors (subtle), ~1.0 over dark colors (vivid).
  private waterVisibility = 0.7;
  private static readonly WATER_DAMPING = 0.988;
  private static readonly WATER_MAX_DENT = 90;       // per-touch amplitude (was 240)
  private static readonly WATER_RADIUS_MIN = 3.5;    // cells (grid is 320 wide)
  private static readonly WATER_RADIUS_MAX = 8.0;    // cells (faster = wider)
  private static readonly WATER_RENDER_GAIN = 4.0;   // height -> luminance
  private static readonly WATER_HEIGHT_CLAMP = 120;  // cap absolute height so waves can't saturate
  private static readonly WATER_CALM_THRESHOLD = 3.0; // |height| below this = surface considered still (allows ambient noise headroom)
  // Ambient "breathing" — occasional micro-dents keep the surface alive
  // without ever exceeding WATER_CALM_THRESHOLD, so the color-cycle gate
  // still ticks over as if the pool were still.
  private static readonly AMBIENT_INTERVAL_MS = 1500;
  private static readonly AMBIENT_AMPLITUDE = 0.7;   // stays under calm threshold
  private static readonly AMBIENT_RADIUS = 2.6;      // small ring, subtle
  private lastAmbientTs = 0;

  // ---- Rendering (refraction + specular + caustics) --------------------
  // Refraction strength: how many grid rows the color is offset by per unit
  // of vertical wave slope. Small values keep the color coherent; large
  // values start to smear the rainbow into "melted" strokes.
  private static readonly REFRACT_STRENGTH = 3.5;
  // Specular tightness: higher = smaller, sharper glints (like sun on water).
  private static readonly SPECULAR_POWER = 22;
  private static readonly SPECULAR_GAIN = 130;
  private static readonly CAUSTIC_GAIN = 260;
  // Per-frame scratch: precomputed rainbow row colors so refracted sampling
  // doesn't reparse hex strings 57k times.
  private rowR: Uint8Array | null = null;
  private rowG: Uint8Array | null = null;
  private rowB: Uint8Array | null = null;

  // ---- Rain mode (idle atmosphere, feature #10) ------------------------
  // Once the cursor has been idle for RAIN_IDLE_MS the pool starts getting
  // occasional random raindrops — meditative background motion. Cursor
  // motion instantly stops the rain.
  private static readonly RAIN_IDLE_MS = 5_000;
  private static readonly RAIN_INTERVAL_MS = 700;
  // Rain comes in "showers" — pours for a while, then stops for a calm
  // window during which the water settles and the palette cycle can
  // advance (the cycle gate requires `isWaterCalm`).
  private static readonly RAIN_SHOWER_MS = 12_000;   // duration of one downpour
  private static readonly RAIN_CALM_MS   = 8_000;    // quiet pause between showers
  // Total time one atmosphere session runs before we re-roll (alternating
  // rain <-> swim). Keeps the user seeing variety without the same mode
  // playing indefinitely.
  // Idle atmospheres run for a fixed duration, then retire so the palette
  // cycle can resume for a cooldown window before the next atmosphere rolls.
  // Palette cycling is FROZEN while an atmosphere is playing — colors only
  // advance during the mouse-active and cooldown windows, so the palette
  // change never overlaps with rain/swim visuals.
  private static readonly RAIN_SESSION_MS  = 180_000; // 3 min of rain
  private static readonly SWIM_SESSION_MS  = 180_000; // 3 min of swim
  private static readonly ATMOSPHERE_COOLDOWN_MS = 30_000; // palette cycle window between atmospheres
  private atmosphereStartTs = 0;
  private cooldownUntilTs = 0;
  private rainPhaseStartTs = 0;
  private rainPhase: 'shower' | 'calm' = 'shower';
  // Nature-themed palettes where falling petals/leaves fit the atmosphere.
  // Any other monotone palette (mono, slate, ocean, midnight, obsidian…)
  // gets plain water without rain — falling petals into a night sky or a
  // gray studio looks out of place.
  private static readonly RAIN_ELIGIBLE_PALETTES = new Set([
    'sakura', 'rose', 'lavender', 'candy',
    'forest', 'mint',
    'autumn', 'peach',
  ]);
  private lastRainTs = 0;
  // Idle sessions pick EXACTLY ONE atmosphere: rain (80%) or swimmer (20%).
  // Cursor motion resets `idleMode` back to null so the next idle re-rolls.
  private idleMode: 'rain' | 'swimmer' | null = null;

  // ---- Sakura petals + leaves (rain-mode companion) --------------------
  // A couple of petals drift down each rain window, flutter as they fall,
  // then LAND on the water surface for a moment before fading. Cap of
  // SAKURA_MAX visible at a time keeps it a whisper, not a snowstorm.
  sakuraPetals: {
    id: number;
    x: number;
    drift: number;
    delay: number;
    scale: number;
    kind: 'sakura' | 'leaf';
    variant: number;  // 0..2 for leaf shape variety (blade / oval / maple)
    color: string;
    w: number;        // px, container width for landing-ripple offset
    h: number;        // px, container height for landing-ripple offset
    landY: number;    // in vh — where on-screen the petal comes to rest
    rotStart: number;
    rotEnd: number;
  }[] = [];
  private sakuraId = 0;
  private lastSakuraTs = 0;
  private static readonly SAKURA_INTERVAL_MS = 3500;
  // Fall (~5s) + land hold (~3s) + fade = 8.5s total.
  private static readonly SAKURA_LIFE_MS = 8500;
  private static readonly SAKURA_MAX = 3;
  private static readonly SAKURA_COLORS = [
    '#ffc9d9', '#ffb3c9', '#ff9fbf', '#f492b0',
  ];
  private static readonly LEAF_COLORS = [
    '#b21f2c', '#c8342b', '#e26128', '#e8a02b',
    '#c98a25', '#5a7a2b', '#2f5e2a', '#3a5f1a',
  ];

  // ---- Idle "swimmer" screen-saver (feature #13) -----------------------
  // Same idle threshold as rain — the two are mutually exclusive; each idle
  // window randomly picks one or the other (see idleMode).
  private swimmerActive = false;
  private swimmerPhase = 0;

  // ---- Cursor droplets (feature #7) ------------------------------------
  // Fast cursor motion sprays tiny droplet divs; they fall + fade via CSS
  // then self-destruct. Also drives the pulse animation on the cursor orb.
  cursorDroplets: { id: number; x: number; y: number }[] = [];
  private cursorDropletId = 0;
  private lastDropletTs = 0;
  private static readonly DROPLET_THROTTLE_MS = 45;
  private static readonly DROPLET_LIFE_MS = 900;

  // ---- Palette-name overlay (feature #9) -------------------------------
  // Displays the current palette's name in elegant serif type, low opacity,
  // fading in when the palette changes and out after a moment.
  paletteLabel = '';
  paletteLabelVisible = false;
  private paletteLabelHideTimer: ReturnType<typeof setTimeout> | null = null;

  // ---- Subtle sound (feature #11) --------------------------------------
  // A single AudioContext synthesizes a soft water-drop tone on each
  // splashWater() call. First user click also unlocks the context per
  // browser autoplay policy.
  private audioCtx: AudioContext | null = null;
  soundEnabled = true;
  private static readonly BLOOM_DURATION_MS = 5500;

  // Mode gate: `useWaterSim` is true only when the palette has ≤ 2 distinct
  // hues (grayscale, single-hue, or two-hue). Colorful palettes (>2 hues)
  // would look dizzying under a full water sim, so we fall back to the
  // original expanding-ring ripples for those.
  useWaterSim = true;
  private lastHueCount = -1;
  // When a specific palette is pinned via search, we resume auto-cycling
  // after this many ms of no cursor activity (water settling).
  private static readonly PIN_IDLE_RESUME_MS = 10_000;
  // Absolute idle escape hatch: after this long the cycle resumes and
  // advances even if the water is still stirring (rain / swimmer keeps
  // the surface permanently active, so the calm-water gate would otherwise
  // freeze the color forever).
  private static readonly LONG_IDLE_BYPASS_MS = 180_000;
  private lastActivityTs = 0;

  // Original expanding-ring ripple state — used ONLY when useWaterSim=false.
  ripples: { id: number; x: number; y: number; tone: 'light' | 'dark' }[] = [];
  private rippleId = 0;
  private lastRippleTs = 0;
  private static readonly RIPPLE_THROTTLE_MS = 320;
  private static readonly RIPPLE_LIFE_MS = 3000;
  private static readonly RIPPLE_MAX = 8;

  // While aiming, freeze ALL animations on the page so the pixel under the
  // dot stays stable until the confirm click.
  @HostBinding('class.frozen')
  get frozen(): boolean {
    return this.aiming;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    const point = { x: e.clientX, y: e.clientY };

    // Route the disturbance to whichever mode is active for this palette.
    if (this.useWaterSim) {
      this.disturbWater(point.x, point.y);
    } else {
      this.spawnRipple(point.x, point.y);
    }
    // Any pointer movement counts as activity — resets the "idle-resume" timer
    // so a pinned palette only unpins after the user has stopped touching the
    // page for PIN_IDLE_RESUME_MS.
    this.lastActivityTs = performance.now();
    // Cursor moved — end the current idle-atmosphere session so the next
    // idle window re-rolls between rain and swimmer.
    const wasAtmosphere = this.idleMode !== null;
    this.idleMode = null;
    this.lastIdleMode = null;
    this.swimmerActive = false;
    this.rainPhaseStartTs = 0;
    this.atmosphereStartTs = 0;
    this.cooldownUntilTs = 0;
    // Clear any petals still in the air and hard-damp the water so lingering
    // ripples / wake / raindrops don't keep animating after the user has
    // returned. Otherwise rain visually looks like it "keeps raining"
    // for a few seconds after the mouse moves.
    if (wasAtmosphere) {
      this.sakuraPetals = [];
      this.fastDampWater();
    }

    // Any movement resets the idle-hide countdown.
    this.armIdleTimer();

    // Accumulate travelled distance until the reveal threshold is met.
    if (!this.cursorVisible) {
      if (this.lastPointer) {
        const dx = point.x - this.lastPointer.x;
        const dy = point.y - this.lastPointer.y;
        this.movedDistance += Math.hypot(dx, dy);
      }
      this.lastPointer = point;

      if (this.movedDistance < PageFirst.REVEAL_THRESHOLD_PX) {
        return;
      }

      // Threshold crossed: reveal the cursor at the current position.
      this.cursorPos = point;
      this.cursorVisible = true;
      return;
    }

    this.trail.unshift({ x: this.cursorPos.x, y: this.cursorPos.y });
    if (this.trail.length > 6) {
      this.trail.pop();
    }
    this.cursorPos = point;
    // Always live-preview the color under the dot. While aiming the rainbow is
    // frozen, so this reads the exact stable color as the dot moves over it.
    this.hoverColor = this.sampleColorAt(point.y);
    this.outlineColor = this.contrastOutline(this.hoverColor);
    // Spray tiny droplets when moving fast — visually communicates "you're
    // touching water". Throttled so a quick swipe doesn't spawn hundreds.
    this.maybeSpawnCursorDroplet(point.x, point.y);
  }

  // Emit a small droplet div at (x, y) if we're moving fast enough and the
  // throttle window has elapsed. The template animates them falling; they
  // self-remove after DROPLET_LIFE_MS.
  private maybeSpawnCursorDroplet(x: number, y: number) {
    if (this.motionSpeed < 0.35) return;
    const now = performance.now();
    if (now - this.lastDropletTs < PageFirst.DROPLET_THROTTLE_MS) return;
    this.lastDropletTs = now;
    const id = ++this.cursorDropletId;
    // Jitter position a touch so consecutive droplets don't perfectly stack.
    this.cursorDroplets.push({
      id,
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 6,
    });
    setTimeout(() => {
      this.cursorDroplets = this.cursorDroplets.filter((d) => d.id !== id);
    }, PageFirst.DROPLET_LIFE_MS);
  }

  // Dark outline on bright colors, light outline on dark colors, so the cursor
  // stays visible over any background.
  private contrastOutline(hex: string): string {
    return this.lum({ hex }) > 150
      ? 'rgba(0, 0, 0, 0.75)'
      : 'rgba(255, 255, 255, 0.95)';
  }

  // ---- Water simulation --------------------------------------------------
  //
  // Physics: 2D linear wave equation, finite difference on a fixed grid.
  //   next = (N + S + E + W) / 2  -  prev,   then multiply by damping.
  // We keep TWO height buffers (prev, curr) and swap each frame.
  //
  // Input: cursor moves push a Gaussian bump into `curr`. Between two
  // consecutive mouse events we interpolate points along the path so the
  // wake is continuous (no gaps at high speed). Dent depth scales with
  // pointer velocity, so slow drags = tiny wake, fast swipes = big splash.
  //
  // Output: each frame is written to an ImageData as signed luminance
  // (peaks bright, troughs dark). The canvas is upscaled by CSS and
  // composited with `mix-blend-mode: overlay` for caustic-like highlights.

  private initWater() {
    const canvas = this.waterCanvasRef?.nativeElement;
    if (!canvas) return;
    this.waterCtx = canvas.getContext('2d', { willReadFrequently: false });
    if (!this.waterCtx) return;

    this.rebuildWaterBuffers();

    // Reallocate the sim grid when the viewport aspect changes noticeably —
    // otherwise a fixed 16:9 grid stretches non-uniformly on portrait/wide
    // monitors, ripples appear as ovals, and there's a "dead margin" in
    // the corners that raindrops never reach.
    this.waterResizeBound = () => this.rebuildWaterBuffers();
    window.addEventListener('resize', this.waterResizeBound);

    this.startWaterLoop();
  }

  // Choose a grid resolution that matches the viewport's aspect ratio so
  // circular ripples stay circular on-screen. Total cell count is kept
  // roughly constant (~150k) so per-frame cost doesn't spike.
  private rebuildWaterBuffers() {
    const canvas = this.waterCanvasRef?.nativeElement;
    if (!canvas) return;
    const vw = Math.max(1, window.innerWidth || canvas.clientWidth || 1);
    const vh = Math.max(1, window.innerHeight || canvas.clientHeight || 1);
    const aspect = vw / vh;
    // Target ~150k cells. width = sqrt(target * aspect), height = width / aspect.
    const target = 150_000;
    const newW = Math.max(160, Math.min(900, Math.round(Math.sqrt(target * aspect))));
    const newH = Math.max(120, Math.min(900, Math.round(newW / aspect)));
    if (newW === this.waterW && newH === this.waterH && this.waterCurr) return;
    this.waterW = newW;
    this.waterH = newH;
    canvas.width = newW;
    canvas.height = newH;
    const n = newW * newH;
    this.waterPrev = new Float32Array(n);
    this.waterCurr = new Float32Array(n);
    this.waterImg = this.waterCtx!.createImageData(newW, newH);
    for (let i = 3; i < this.waterImg.data.length; i += 4) {
      this.waterImg.data[i] = 255;
    }
  }

  private startWaterLoop() {
    if (this.waterRaf !== null) return;
    const tick = () => {
      // Re-evaluate palette hue count → decide sim vs ripple mode.
      this.updateSimMode();
      // Auto-resume cycling after a pin. Normally requires BOTH cursor idle
      // AND water settled (so a decaying ripple doesn't strobe color on top
      // of an active wake). But once the user has been idle for
      // LONG_IDLE_BYPASS_MS (3 min) we resume regardless — rain/swimmer
      // keeps the surface stirring forever, so we'd never resume otherwise.
      const idleMs = performance.now() - this.lastActivityTs;
      if (!this.autoCycle &&
          idleMs > PageFirst.PIN_IDLE_RESUME_MS &&
          (this.isWaterCalm() || idleMs > PageFirst.LONG_IDLE_BYPASS_MS)) {
        this.autoCycle = true;
      }
      if (this.useWaterSim) {
        // Frame-skip the physics step to slow perceived wave speed while
        // keeping rendering at full 60 fps for smooth motion.
        this.waterStepPhase = (this.waterStepPhase + 1) % PageFirst.WATER_STEP_EVERY;
        if (this.waterStepPhase === 0) {
          this.stepWater();
        }
        // Sprinkle tiny background disturbances so the pool always looks
        // alive rather than dead-frozen. Amplitude is small enough that
        // isWaterCalm() still returns true — the color-cycle gate is unaffected.
        this.tickAmbient();
        // Rain + sakura + swimmer are MONOTONE-ONLY atmosphere — they only
        // read as coherent when the background is a single color family.
        // A colorful (bi/tri-tone) palette gets the plain ring ripples.
        this.tickRain();
        this.tickSwimmer();
        // Ease the visibility toward the target dictated by the color under
        // the cursor: dim on light backgrounds, vivid on dark ones.
        const bgLum = this.lum({ hex: this.sampleColorAt(this.cursorPos.y) });
        const target = 0.25 + 0.75 * (1 - Math.min(1, Math.max(0, bgLum / 255)));
        this.waterVisibility += (target - this.waterVisibility) * 0.08;
        this.renderWater();
      } else {
        // Colorful mode: kill any rain/swimmer state and clear pending
        // petals so the transition looks clean.
        this.idleMode = null;
        this.swimmerActive = false;
        if (this.sakuraPetals.length) this.sakuraPetals = [];
      }
      // If !useWaterSim, we leave the canvas alone (hidden via [style.display]).
      this.waterRaf = requestAnimationFrame(tick);
    };
    this.waterRaf = requestAnimationFrame(tick);
  }

  // Ambient "breathing" of the water surface. Every AMBIENT_INTERVAL_MS
  // we drop one tiny random dent (amplitude ~1, well under the calm
  // threshold of 1.5). Cumulative energy is negligible, so isWaterCalm()
  // still returns true and the color cycle keeps flowing — the surface
  // just never looks perfectly frozen.
  private tickAmbient() {
    const now = performance.now();
    if (now - this.lastAmbientTs < PageFirst.AMBIENT_INTERVAL_MS) return;
    this.lastAmbientTs = now;
    const W = this.waterW;
    const H = this.waterH;
    // Bias toward the interior so ambient bumps aren't lost to edge damping.
    const cx = 8 + Math.random() * (W - 16);
    const cy = 8 + Math.random() * (H - 16);
    // Occasional randomization: sometimes a "double drop" for texture.
    const amp = PageFirst.AMBIENT_AMPLITUDE * (0.6 + Math.random() * 0.6);
    this.dent(cx, cy, amp, PageFirst.AMBIENT_RADIUS);
    if (Math.random() < 0.15) {
      this.dent(
        cx + (Math.random() - 0.5) * 6,
        cy + (Math.random() - 0.5) * 6,
        amp * 0.7,
        PageFirst.AMBIENT_RADIUS * 0.8,
      );
    }
  }

  // "Rain mode" — after RAIN_IDLE_MS with no cursor input, tiny raindrops
  // start falling into the pool at random spots. Bigger than ambient noise
  // so they read as real drops, but still cheap enough to leave calm windows
  // for the color cycle to advance between drops.
  private tickRain() {
    const now = performance.now();
    const idle = now - this.lastActivityTs;
    if (idle < PageFirst.RAIN_IDLE_MS) return;
    this.ensureIdleMode();
    if (this.idleMode !== 'rain') return;
    if (!this.isRainEligiblePalette()) return;

    // Shower / calm phase machine. First entry starts a shower; when its
    // window elapses we flip to calm so the water can settle and the
    // palette cycle can advance to the next theme.
    if (this.rainPhaseStartTs === 0) {
      this.rainPhaseStartTs = now;
      this.rainPhase = 'shower';
    }
    const inPhaseMs = now - this.rainPhaseStartTs;
    const phaseLen = this.rainPhase === 'shower'
      ? PageFirst.RAIN_SHOWER_MS
      : PageFirst.RAIN_CALM_MS;
    if (inPhaseMs >= phaseLen) {
      this.rainPhase = this.rainPhase === 'shower' ? 'calm' : 'shower';
      this.rainPhaseStartTs = now;
    }
    if (this.rainPhase === 'calm') return;

    if (now - this.lastRainTs < PageFirst.RAIN_INTERVAL_MS) return;
    this.lastRainTs = now;
    const W = this.waterW;
    const H = this.waterH;
    const ramp = Math.min(1, (idle - PageFirst.RAIN_IDLE_MS) / 3000);
    const remaining = PageFirst.RAIN_SHOWER_MS - inPhaseMs;
    const tail = Math.max(0, Math.min(1, remaining / 2500));
    const dropsThisTick = 1 + ((Math.random() * 2) | 0);
    for (let i = 0; i < dropsThisTick; i++) {
      const cx = 6 + Math.random() * (W - 12);
      const cy = 6 + Math.random() * (H - 12);
      const isBig = Math.random() < 0.22;
      const amp = (isBig ? 12 + Math.random() * 5 : 5 + Math.random() * 4) * ramp * tail;
      const radius = isBig ? 6 : 3.5;
      this.dent(cx, cy, amp, radius);
    }
    this.maybeSpawnSakura(now);
  }

  // Is the palette currently on-screen one of the nature-themed ones that
  // makes sense for falling petals? Uses whichever cycle entry has the
  // most weight (the nearer of the two we're crossfading between).
  private isRainEligiblePalette(): boolean {
    // Any palette that's using the water sim (monotone, non-dark) can host
    // rain. Rain looks fine even on non-"nature" palettes — the drops are
    // just circular dents, and petals fall regardless.
    return this.useWaterSim;
  }

  // On first crossing of the idle threshold, roll dice to pick this idle
  // window's atmosphere: ~85% rain, ~15% swimmer, and NEVER swimmer twice
  // in a row (feels broken when it keeps hiding the cursor). Cursor motion
  // resets idleMode to null so the next idle re-rolls.
  private lastIdleMode: 'rain' | 'swimmer' | null = null;
  private ensureIdleMode() {
    const now = performance.now();
    // Session-elapsed check: retire an atmosphere once its fixed duration
    // is up. After retiring, we enter a cooldown window (waits for water
    // to become static, then lets the palette cycle for a while) before
    // rolling the next atmosphere.
    if (this.idleMode) {
      const sessionLen = this.idleMode === 'rain'
        ? PageFirst.RAIN_SESSION_MS
        : PageFirst.SWIM_SESSION_MS;
      if (now - this.atmosphereStartTs >= sessionLen) {
        this.lastIdleMode = this.idleMode;
        this.idleMode = null;
        this.swimmerActive = false;
        this.rainPhaseStartTs = 0;
        // Cooldown starts only once the water has fully settled — set a
        // sentinel here, and the block below stamps the real timer once
        // isWaterCalm() returns true.
        this.cooldownUntilTs = 0;
      }
      if (this.idleMode) return;
    }
    // After retiring, wait for the pool to become static, then hold a
    // cooldown window so the palette cycle can breathe. During cooldown
    // the rainbow-flow tick will advance colors normally (idleMode is
    // null and mouse is idle, so its gates pass on calm water).
    // Skip the cooldown for the very first atmosphere after page load
    // (or after a mouse-move reset) so the user doesn't have to wait
    // 30s of only-color-changing before seeing rain/swim.
    if (this.lastIdleMode !== null) {
      if (this.cooldownUntilTs === 0) {
        if (!this.isWaterCalm()) return;
        this.cooldownUntilTs = now + PageFirst.ATMOSPHERE_COOLDOWN_MS;
        return;
      }
      if (now < this.cooldownUntilTs) return;
    }

    // Cooldown done — pure 90/10 roll for the next atmosphere.
    const rainOk = this.isRainEligiblePalette();
    const r = Math.random();
    if (r < 0.80) {
      if (!rainOk) {
        // No rain here — extend the cooldown a bit and try again.
        this.cooldownUntilTs = now + 5_000;
        return;
      }
      this.idleMode = 'rain';
    } else {
      this.idleMode = 'swimmer';
    }
    this.atmosphereStartTs = now;
    this.cooldownUntilTs = 0;
    this.lastIdleMode = this.idleMode;
  }

  // Spawn one petal — 60% sakura, 40% leaf — with a random landing spot
  // between 55% and 92% of the viewport height so it visibly comes to rest
  // ON the water surface rather than falling past the bottom of the page.
  private maybeSpawnSakura(now: number) {
    if (this.sakuraPetals.length >= PageFirst.SAKURA_MAX) return;
    if (now - this.lastSakuraTs < PageFirst.SAKURA_INTERVAL_MS) return;
    this.lastSakuraTs = now;
    const id = ++this.sakuraId;
    const rotStart = -30 + Math.random() * 60;
    const kind: 'sakura' | 'leaf' = Math.random() < 0.55 ? 'sakura' : 'leaf';
    const palette = kind === 'sakura'
      ? PageFirst.SAKURA_COLORS
      : PageFirst.LEAF_COLORS;
    // Only one leaf shape now — a classic 5-lobed maple. Container size
    // stays consistent so the silhouette reads at natural proportions.
    const variant = 0;
    const dims = kind === 'sakura'
      ? { w: 26, h: 28 }
      : { w: 62, h: 68 };
    const petal = {
      id,
      x: Math.random() * (window.innerWidth || 800),
      drift: (Math.random() - 0.5) * 220,
      delay: Math.random() * 0.4,
      scale: 0.8 + Math.random() * 0.55,
      kind,
      variant,
      color: palette[(Math.random() * palette.length) | 0],
      w: dims.w,
      h: dims.h,
      landY: 55 + Math.random() * 37,
      rotStart,
      rotEnd: rotStart + 320 + Math.random() * 200,
    };
    this.sakuraPetals.push(petal);
    // Schedule a small water dent at the landing spot so a real ripple
    // appears when the petal touches the surface (matches the CSS anim
    // that reaches landY at ~59% of the 8.5s life).
    const landDelayMs = petal.delay * 1000 + 8500 * 0.59;
    setTimeout(() => this.dropOnWaterAt(petal), landDelayMs);
    setTimeout(() => {
      this.sakuraPetals = this.sakuraPetals.filter((p) => p.id !== id);
    }, PageFirst.SAKURA_LIFE_MS + petal.delay * 1000);
  }

  // Convert a petal's landing point (in viewport coordinates) to water grid
  // cell units and drop a small dent — creates a real ripple where the
  // sakura/leaf visually touches the water. Skipped if water mode isn't
  // active, or if rain mode has since ended (cursor moved, palette changed)
  // — a stray splash without visible cause looks like a bug.
  private dropOnWaterAt(p: { x: number; drift: number; landY: number; kind: 'sakura' | 'leaf'; scale: number; w: number; h: number }) {
    if (!this.useWaterSim || this.idleMode !== 'rain') return;
    if (!this.waterCurr || !this.waterCanvasRef) return;
    const rect = this.waterCanvasRef.nativeElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    // The petal element is positioned at its top-LEFT (`left: p.x`), and
    // the SVG has intrinsic box dimensions carried on the petal itself
    // (dims vary per leaf variant). Its visible center therefore sits
    // at `left + w/2 * scale` / `-60 + landY + h/2 * scale`.
    const px = p.x + p.drift + (p.w * p.scale) / 2;
    const py = -60 + (p.landY / 100) * (window.innerHeight || rect.height) + (p.h * p.scale) / 2;
    const cx = (px - rect.left) * (this.waterW / rect.width);
    const cy = (py - rect.top) * (this.waterH / rect.height);
    // Leaves are heavier than sakura petals — bigger dent, wider ring.
    // Kept close to raindrop scale so the landing doesn't dominate the
    // pool as a giant dark blob next to the small raindrop rings.
    const amp = p.kind === 'leaf' ? 12 : 7;
    const rad = p.kind === 'leaf' ? 4.5 : 3.8;
    this.dent(cx, cy, amp, rad);
  }

  // Idle screen-saver "swimmer" — a body drifts across the pool along a
  // slow Lissajous curve, leaving a wake. Cursor motion cancels it. Only
  // active when idleMode picked 'swimmer' for this idle window (20% odds).
  private tickSwimmer() {
    const idle = performance.now() - this.lastActivityTs;
    if (idle < PageFirst.RAIN_IDLE_MS) {
      this.swimmerActive = false;
      return;
    }
    this.ensureIdleMode();
    if (this.idleMode !== 'swimmer') {
      this.swimmerActive = false;
      return;
    }
    if (!this.swimmerActive) {
      this.swimmerActive = true;
      this.swimmerPhase = Math.random() * Math.PI * 2;
      // Also hide the cursor once we enter screen-saver mode.
      this.hideCursor();
    }
    this.swimmerPhase += 0.011; // ~1 revolution per 10 seconds
    const W = this.waterW;
    const H = this.waterH;
    // Lissajous — two orthogonal sinusoids at ratio 3:2 give a curved,
    // non-repeating-looking wake around the pool interior.
    const cx = W * 0.5 + Math.cos(this.swimmerPhase * 1.0) * (W * 0.35);
    const cy = H * 0.5 + Math.sin(this.swimmerPhase * 1.5) * (H * 0.35);
    // Compute an approximate motion direction from the derivatives for
    // shaping the wake as a stick, not a dot.
    const dx = -Math.sin(this.swimmerPhase * 1.0) * (W * 0.35);
    const dy =  Math.cos(this.swimmerPhase * 1.5) * (H * 0.35) * 1.5;
    const mag = Math.hypot(dx, dy) || 1;
    this.dentDirectional(cx, cy, 4.5, 2.4, dx / mag, dy / mag, 3.2);
  }

  // Is the water surface visually settled? Scans the current height field
  // (sparsely — every 8th cell is plenty for a global threshold check) and
  // returns true when the peak |height| is below WATER_CALM_THRESHOLD.
  // Used by the auto-resume gate so we only unpin a palette once ripples
  // have actually died down, not just because the cursor stopped moving.
  private isWaterCalm(): boolean {
    const curr = this.waterCurr;
    if (!curr) return true;
    const threshold = PageFirst.WATER_CALM_THRESHOLD;
    // Sparse scan: 1 in every 8 cells, fast enough to run every frame.
    for (let i = 0; i < curr.length; i += 8) {
      const v = curr[i];
      if (v > threshold || v < -threshold) return false;
    }
    return true;
  }

  // Aggressively bleed off any residual height so an atmosphere's lingering
  // wake vanishes cleanly on cursor resume. Multiplies every cell by a
  // strong decay in a single pass — cheap and visually reads as the water
  // settling in ~0.3 s instead of ~2 s.
  private fastDampWater() {
    const curr = this.waterCurr;
    const prev = this.waterPrev;
    if (!curr || !prev) return;
    const k = 0.25;
    for (let i = 0; i < curr.length; i++) {
      curr[i] *= k;
      prev[i] *= k;
    }
  }

  // we also zero the sim buffers so re-entering water mode starts calm.
  private updateSimMode() {
    const n = this.countDistinctHues(this.rainbowColors);
    const dark = this.isDarkPalette(this.rainbowColors);
    // Water sim is for TRUE monotone palettes only (all hues within one
    // 60° family). Bi-tone (n = 2) or richer palettes look muddled under
    // a water sim / swimmer, so they fall back to plain ring ripples.
    // Dark palettes are also excluded — the canvas uses `mix-blend-mode:
    // overlay` on a grayscale height map, and on near-black backgrounds
    // the trough of each wave collapses into a hard black core with
    // harsh concentric rings (see user screenshot). Ring ripples read
    // much better on dark themes.
    const shouldWater = n === 1 && !dark;
    if (n === this.lastHueCount && shouldWater === this.useWaterSim) return;
    this.lastHueCount = n;
    if (shouldWater === this.useWaterSim) return;
    this.useWaterSim = shouldWater;
    if (shouldWater) {
      // Coming back to water mode: reset the height field so no stale wave.
      if (this.waterPrev) this.waterPrev.fill(0);
      if (this.waterCurr) this.waterCurr.fill(0);
    } else {
      // Leaving water mode: drop any pending ripple divs so they don't linger.
      this.ripples = [];
    }
  }

  // Average perceptual luminance of the palette's non-gray colors. Palettes
  // whose mean is below ~0.28 (dark obsidian, deep navy, espresso, etc.)
  // look terrible under the overlay-blended water canvas — every wave
  // trough turns near-black and forms visible banding rings. We use the
  // sRGB luminance formula (0.2126 R + 0.7152 G + 0.0722 B on normalized
  // channels) for a perceptually correct brightness measure.
  private isDarkPalette(colors: any[]): boolean {
    if (!colors?.length) return false;
    let sum = 0;
    let count = 0;
    for (const c of colors) {
      const hex = (c?.hex ?? '').replace('#', '');
      if (hex.length !== 6) continue;
      const r = parseInt(hex.slice(0, 2), 16) / 255;
      const g = parseInt(hex.slice(2, 4), 16) / 255;
      const b = parseInt(hex.slice(4, 6), 16) / 255;
      sum += 0.2126 * r + 0.7152 * g + 0.0722 * b;
      count++;
    }
    if (count === 0) return false;
    return sum / count < 0.28;
  }

  // Count how many DISTINCT hues the palette contains — for the purpose of
  // deciding "monotone vs colorful". We collect the hue angle of every
  // non-gray color, then measure the SMALLEST ARC on the color wheel that
  // contains all of them. If that arc is narrow enough, the palette is
  // still perceptually monotone (e.g. pink + lavender + purple — all one
  // color family), regardless of how many raw distinct shades there are.
  //
  // Returns:
  //   0 -> no hue (all grayscale)
  //   1 -> all hues within HUE_FAMILY_ARC (monotone family, e.g. purples)
  //   2 -> hues span up to 2× that arc (bi-tone, e.g. teal + orange)
  //   3 -> genuinely colorful spread
  private countDistinctHues(colors: any[]): number {
    if (!colors?.length) return 0;
    const CHROMA_MIN = 12;              // below this = grayscale, no hue
    const HUE_FAMILY_ARC = 60;          // ≤60° of the wheel = one family
    const hues: number[] = [];
    for (const c of colors) {
      const hex = (c?.hex ?? '').replace('#', '');
      if (hex.length !== 6) continue;
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const chroma = max - min;
      if (chroma < CHROMA_MIN) continue;
      let h: number;
      if (max === r)      h = ((g - b) / chroma) % 6;
      else if (max === g) h = (b - r) / chroma + 2;
      else                h = (r - g) / chroma + 4;
      h *= 60;
      if (h < 0) h += 360;
      hues.push(h);
    }
    if (hues.length === 0) return 0;
    if (hues.length === 1) return 1;

    // Find the smallest arc that contains all hues by looking at the LARGEST
    // gap between consecutive sorted hues on the circle — the answer is
    // 360° minus that gap.
    hues.sort((a, b) => a - b);
    let maxGap = 360 - hues[hues.length - 1] + hues[0];   // wrap-around gap
    for (let i = 1; i < hues.length; i++) {
      const gap = hues[i] - hues[i - 1];
      if (gap > maxGap) maxGap = gap;
    }
    const span = 360 - maxGap;

    if (span <= HUE_FAMILY_ARC)         return 1;   // e.g. lavender→pink→purple
    if (span <= HUE_FAMILY_ARC * 2)     return 2;   // bi-tone
    return 3;                                       // colorful
  }

  private stopWaterLoop() {
    if (this.waterRaf !== null) {
      cancelAnimationFrame(this.waterRaf);
      this.waterRaf = null;
    }
  }

  private destroyWater() {
    this.stopWaterLoop();
    if (this.waterResizeBound) {
      window.removeEventListener('resize', this.waterResizeBound);
      this.waterResizeBound = null;
    }
    this.waterPrev = null;
    this.waterCurr = null;
    this.waterImg = null;
    this.waterCtx = null;
  }

  // Advance the height field one time step using the discrete wave equation.
  private stepWater() {
    const prev = this.waterPrev;
    const curr = this.waterCurr;
    if (!prev || !curr) return;
    const W = this.waterW;
    const H = this.waterH;
    const damp = PageFirst.WATER_DAMPING;
    const cap = PageFirst.WATER_HEIGHT_CLAMP;
    // Absorbing border: waves lose extra energy as they approach the edge,
    // so they FADE instead of reflecting off the invisible wall. Depth of
    // the absorbing band = 10% of the smaller grid dimension.
    const bandDepth = Math.max(4, Math.floor(Math.min(W, H) * 0.10));

    // Write next state INTO prev (we then swap prev<->curr).
    for (let y = 1; y < H - 1; y++) {
      const row = y * W;
      // Vertical distance from nearest edge (0 at edge, grows inward).
      const dyEdge = Math.min(y, H - 1 - y);
      for (let x = 1; x < W - 1; x++) {
        const i = row + x;
        let v = (curr[i - 1] + curr[i + 1] + curr[i - W] + curr[i + W]) * 0.5 - prev[i];
        v *= damp;
        // Extra damping inside the band. edgeK = 1.0 deep inside, decays
        // toward ~0.85 at the very edge — a smooth quadratic falloff so
        // there's no visible seam where absorption kicks in.
        const dxEdge = Math.min(x, W - 1 - x);
        const dEdge = Math.min(dxEdge, dyEdge);
        if (dEdge < bandDepth) {
          const t = dEdge / bandDepth;             // 0 at edge, 1 at inner boundary
          const edgeK = 0.85 + 0.15 * t * t;
          v *= edgeK;
        }
        if (v > cap) v = cap; else if (v < -cap) v = -cap;
        prev[i] = v;
      }
    }
    // Swap: next (in prev) becomes current; old current becomes scratch.
    this.waterPrev = curr;
    this.waterCurr = prev;
  }

  // Paint the height field as a signed grayscale image (mid-gray = flat).
  // Deviation from 128 is scaled by the smoothed visibility factor, so the
  // ripples visibly dim over pale backgrounds and pop over dark ones. The
  // canvas is composited back onto the rainbow via `mix-blend-mode: overlay`
  // in CSS — softer and less eye-tiring than a per-pixel refraction shader.
  private renderWater() {
    const ctx = this.waterCtx;
    const img = this.waterImg;
    const curr = this.waterCurr;
    if (!ctx || !img || !curr) return;
    const data = img.data;
    const gain = PageFirst.WATER_RENDER_GAIN * this.waterVisibility;
    const len = curr.length;

    for (let i = 0, p = 0; i < len; i++, p += 4) {
      let v = 128 + curr[i] * gain;
      if (v < 0) v = 0; else if (v > 255) v = 255;
      data[p] = v;
      data[p + 1] = v;
      data[p + 2] = v;
    }
    ctx.putImageData(img, 0, 0);
  }

  // Push a Gaussian-shaped dent into the field at (cx, cy) in *cell* units.
  private dent(cx: number, cy: number, amp: number, radius: number) {
    const curr = this.waterCurr;
    if (!curr) return;
    const W = this.waterW;
    const H = this.waterH;
    const r = Math.max(1, radius | 0);
    const x0 = Math.max(1, Math.floor(cx - r));
    const x1 = Math.min(W - 2, Math.ceil(cx + r));
    const y0 = Math.max(1, Math.floor(cy - r));
    const y1 = Math.min(H - 2, Math.ceil(cy + r));
    const inv2s2 = 1 / (2 * radius * radius);
    for (let y = y0; y <= y1; y++) {
      const row = y * W;
      const dy = y - cy;
      for (let x = x0; x <= x1; x++) {
        const dx = x - cx;
        const g = Math.exp(-(dx * dx + dy * dy) * inv2s2);
        curr[row + x] -= amp * g;   // negative = pushed down (finger pressing)
      }
    }
  }

  // Draw an anisotropic (direction-aware) dent — a Gaussian stretched along
  // the axis (dirX, dirY) by `stretch` (>1 = elongated). Used for wake
  // trails: a fast finger's dent should be longer along its path than wide,
  // like a stick shape rather than a symmetric dot.
  private dentDirectional(
    cx: number, cy: number,
    amp: number, radius: number,
    dirX: number, dirY: number, stretch: number,
  ) {
    const curr = this.waterCurr;
    if (!curr) return;
    const W = this.waterW;
    const H = this.waterH;
    const rMajor = radius * stretch;
    const bound = Math.max(2, Math.ceil(rMajor));
    const x0 = Math.max(1, Math.floor(cx - bound));
    const x1 = Math.min(W - 2, Math.ceil(cx + bound));
    const y0 = Math.max(1, Math.floor(cy - bound));
    const y1 = Math.min(H - 2, Math.ceil(cy + bound));
    const invMajor2 = 1 / (2 * rMajor * rMajor);
    const invMinor2 = 1 / (2 * radius * radius);
    // Perpendicular axis (2D cross).
    const perpX = -dirY;
    const perpY = dirX;
    for (let y = y0; y <= y1; y++) {
      const row = y * W;
      const dy = y - cy;
      for (let x = x0; x <= x1; x++) {
        const dx = x - cx;
        // Project (dx,dy) onto major (dir) and minor (perp) axes.
        const proj = dx * dirX + dy * dirY;         // along motion
        const perp = dx * perpX + dy * perpY;       // sideways
        const g = Math.exp(-(proj * proj) * invMajor2 - (perp * perp) * invMinor2);
        curr[row + x] -= amp * g;
      }
    }
  }

  // Cursor moved to (px, py) in screen pixels — main motion-driven physics.
  //
  // MOTION MODEL:
  //   1. Compute raw velocity (Δp / Δt) from the last event.
  //   2. Low-pass filter it into a smoothed velocity vector (motionVx/Vy),
  //      so brief gaps between OS mouse events don't zero the speed.
  //   3. Persist a unit DIRECTION vector — retains the last heading during
  //      pauses so the water still knows which way the "stick" was moving.
  //   4. Track ACCELERATION (Δspeed / dt) — sudden speeds-up = extra splash,
  //      abrupt stops = a small pushback dent ("hand slapping the brakes").
  //
  // RENDERING:
  //   Uses anisotropic (direction-stretched) dents so the wake reads as an
  //   elongated groove behind the finger — like a stick shape rather than
  //   a symmetric dot. Adds a small BOW WAVE stamp ahead of the cursor for
  //   fast motion, mimicking water piling up in front of a moving object.
  private disturbWater(px: number, py: number) {
    if (!this.waterCurr || !this.waterCanvasRef) return;
    const rect = this.waterCanvasRef.nativeElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const sx = this.waterW / rect.width;
    const sy = this.waterH / rect.height;
    const cx = (px - rect.left) * sx;
    const cy = (py - rect.top) * sy;
    if (cx < 0 || cy < 0 || cx >= this.waterW || cy >= this.waterH) {
      this.lastWaterPoint = { x: px, y: py, t: performance.now() };
      return;
    }

    const now = performance.now();
    const last = this.lastWaterPoint;
    this.lastWaterPoint = { x: px, y: py, t: now };

    // Raw instantaneous velocity in grid cells per ms.
    let rvx = 0, rvy = 0, rspeed = 0;
    if (last) {
      const dt = Math.max(1, now - last.t);
      rvx = (px - last.x) * sx / dt;
      rvy = (py - last.y) * sy / dt;
      rspeed = Math.hypot(rvx, rvy);
    }

    // Low-pass smoothing (α higher = snappier response, lower = calmer).
    // Adaptive: rising speed reacts faster (α=0.55) than decay (α=0.20), so
    // launches feel immediate but stops leave a gliding wake.
    const alpha = rspeed > this.motionSpeed ? 0.55 : 0.20;
    this.motionVx += (rvx - this.motionVx) * alpha;
    this.motionVy += (rvy - this.motionVy) * alpha;
    this.prevMotionSpeed = this.motionSpeed;
    this.motionSpeed = Math.hypot(this.motionVx, this.motionVy);

    // Direction: only update when there's meaningful motion, else keep last.
    if (this.motionSpeed > 0.02) {
      this.motionDirX = this.motionVx / this.motionSpeed;
      this.motionDirY = this.motionVy / this.motionSpeed;
    }

    // Normalised speed 0..1 (~0.6 cells/ms = fast swipe).
    const speed = Math.min(1, this.motionSpeed / 0.6);
    // Acceleration: positive = speeding up, negative = decelerating.
    const accel = this.motionSpeed - this.prevMotionSpeed;

    const amp = PageFirst.WATER_MAX_DENT * (0.15 + 0.85 * speed);
    const radius =
      PageFirst.WATER_RADIUS_MIN +
      (PageFirst.WATER_RADIUS_MAX - PageFirst.WATER_RADIUS_MIN) * speed;
    // Wake dent is elongated along motion for a stick-through-water look;
    // stretch grows with speed but is capped so it never becomes a line.
    const stretch = 1 + 1.8 * speed;

    // Interpolate stamps along the path so a fast drag paints a continuous
    // wake instead of dots (still uses direction-stretched shape).
    if (last) {
      const lcx = (last.x - rect.left) * sx;
      const lcy = (last.y - rect.top) * sy;
      const distCells = Math.hypot(cx - lcx, cy - lcy);
      const steps = Math.min(24, Math.max(1, Math.ceil(distCells / (radius * 0.6))));
      const perAmp = amp / Math.sqrt(steps);
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        this.dentDirectional(
          lcx + (cx - lcx) * t,
          lcy + (cy - lcy) * t,
          perAmp, radius,
          this.motionDirX, this.motionDirY, stretch,
        );
      }
    } else {
      this.dentDirectional(cx, cy, amp, radius, this.motionDirX, this.motionDirY, stretch);
    }

    // BOW WAVE: water piling in FRONT of the moving object. Only meaningful
    // at higher speeds; a small positive (upward) bump slightly ahead of
    // the cursor, wider than tall, giving the wake a "prow" like a boat.
    if (speed > 0.35) {
      const ahead = radius * 1.4;
      const bowX = cx + this.motionDirX * ahead;
      const bowY = cy + this.motionDirY * ahead;
      const bowAmp = -amp * 0.28 * speed;   // positive height (crest, not trough)
      this.dentDirectional(
        bowX, bowY, bowAmp, radius * 0.9,
        this.motionDirX, this.motionDirY, 0.55,   // wider than long
      );
    }

    // ACCELERATION SPIKE: sudden burst of speed makes an extra centered
    // splash (like flicking a stick). Only fires when accel > threshold so
    // steady motion doesn't add spurious energy.
    if (accel > 0.08) {
      this.dent(cx, cy, amp * 1.4 * Math.min(1, accel * 8), radius * 1.1);
    }
  }

  // A directional "poke" — used on confirm click / dbl-click. Instead of a
  // symmetric splash we push a burst in the direction the finger was moving
  // (using motionDirX/Y from the smoothed motion tracker), plus a slight
  // pull-back trough behind — matching how a real slap displaces water
  // forward and creates suction behind the hand.
  private splashWater(px: number, py: number) {
    if (!this.waterCurr || !this.waterCanvasRef) return;
    const rect = this.waterCanvasRef.nativeElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const cx = (px - rect.left) * (this.waterW / rect.width);
    const cy = (py - rect.top) * (this.waterH / rect.height);

    const dx = this.motionDirX;
    const dy = this.motionDirY;
    const hasDir = Math.hypot(dx, dy) > 0.5;   // motion tracker seeded?
    const baseAmp = PageFirst.WATER_MAX_DENT * 2.2;
    const baseRad = PageFirst.WATER_RADIUS_MAX * 1.6;

    if (!hasDir) {
      // Fallback: no known direction, symmetric splash.
      this.dent(cx, cy, baseAmp, baseRad);
      return;
    }

    // 1. Main press at the click site — slightly stretched sideways so it
    //    reads as an impact rather than a point poke.
    this.dentDirectional(cx, cy, baseAmp, baseRad, dx, dy, 0.7);
    // 2. Forward burst — water shoved AHEAD of the strike, elongated along
    //    the motion axis. Depth scales with the strike so it feels connected.
    const fwd = baseRad * 1.3;
    this.dentDirectional(
      cx + dx * fwd,
      cy + dy * fwd,
      baseAmp * 0.6, baseRad * 0.9,
      dx, dy, 1.8,
    );
    // 3. Rebound crest BEHIND — small positive height (crest) opposite the
    //    motion, mimicking the suction lift when a hand pulls out of water.
    const back = baseRad * 1.1;
    this.dentDirectional(
      cx - dx * back,
      cy - dy * back,
      -baseAmp * 0.28, baseRad * 0.8,
      dx, dy, 0.6,
    );
    // Subtle synthesized "drop" sound (feature #11).
    this.playDropSound();
  }

  // Synthesize a very soft water-drop tick: a short sine chirp descending
  // in pitch, gated by a fast attack + short decay envelope. No sample
  // file needed. First call also unlocks the AudioContext (browsers
  // require a user gesture, which any click satisfies).
  private playDropSound() {
    if (!this.soundEnabled) return;
    try {
      const Ctor =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!Ctor) return;
      if (!this.audioCtx) this.audioCtx = new Ctor();
      const ctx = this.audioCtx!;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      // Downward chirp — classic water-drop pitch envelope.
      osc.frequency.setValueAtTime(720 + Math.random() * 120, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.14);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.32);
    } catch {
      // Any AudioContext failure is silent — sound is a nice-to-have.
    }
  }

  // Original expanding-ring ripple used only in colorful (>2 hue) palettes.
  // Throttled and capped so a fast drag doesn't spawn dozens of divs;
  // each ripple self-removes after its CSS animation ends.
  private spawnRipple(x: number, y: number) {
    // Ring ripples are the fallback for colorful palettes; when the canvas
    // water sim is active it already draws the disturbance, so a second
    // huge fuzzy ring on top just fogs the screen.
    if (this.useWaterSim) return;
    const now = Date.now();
    if (now - this.lastRippleTs < PageFirst.RIPPLE_THROTTLE_MS) return;
    this.lastRippleTs = now;

    // Match the cursor tone: dark ripple over a bright bg, light over dark.
    const bg = this.sampleColorAt(y);
    const tone: 'light' | 'dark' = this.lum({ hex: bg }) > 150 ? 'dark' : 'light';

    const id = this.rippleId++;
    this.ripples.push({ id, x, y, tone });
    if (this.ripples.length > PageFirst.RIPPLE_MAX) this.ripples.shift();
    setTimeout(() => {
      this.ripples = this.ripples.filter((r) => r.id !== id);
    }, PageFirst.RIPPLE_LIFE_MS);
  }

  // ---- End water simulation ---------------------------------------------

  // Double-click while the cursor is visible: shrink the ring into an aiming dot
  // and freeze the screen. The rainbow is a single static vertical gradient, so
  // the color under the dot is computed exactly from the Y position.
  @HostListener('document:dblclick', ['$event'])
  onDoubleClick(e: MouseEvent) {
    if (!this.cursorVisible) {
      return;
    }
    this.aiming = true;
    this.armIdleTimer();
    this.hoverColor = this.sampleColorAt(e.clientY);
    this.outlineColor = this.contrastOutline(this.hoverColor);
    // Big splash at the dbl-click point — like slapping the water.
    if (this.useWaterSim) this.splashWater(e.clientX, e.clientY);
    else this.spawnRipple(e.clientX, e.clientY);
  }

  // Final single click while aiming: lock in the frozen color and rebuild
  // the rainbow from it.
  @HostListener('document:click', ['$event'])
  onClick(e: MouseEvent) {
    if (!this.cursorVisible || !this.aiming) {
      return;
    }
    if (this.useWaterSim) this.splashWater(e.clientX, e.clientY);
    else this.spawnRipple(e.clientX, e.clientY);
    this.confirmColor(this.hoverColor, e.clientX, e.clientY);
  }

  @HostListener('document:mouseleave')
  onMouseLeave() {
    this.hideCursor();
  }

  // (Re)start the 4s idle countdown; hides the cursor when it elapses.
  private armIdleTimer() {
    if (this.idleTimer !== null) {
      clearTimeout(this.idleTimer);
    }
    this.idleTimer = setTimeout(() => this.hideCursor(), PageFirst.IDLE_HIDE_MS);
  }

  // Hide the glowing cursor and reset movement tracking, so it must re-earn
  // visibility by moving REVEAL_THRESHOLD_PX again.
  private hideCursor() {
    this.cursorVisible = false;
    this.aiming = false;
    this.trail = [];
    this.lastPointer = null;
    this.movedDistance = 0;
    if (this.idleTimer !== null) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }

  // Sample the color of the flowing rainbow at a given viewport Y position.
  // The rainbow is a vertical gradient of `rainbowColors`, so map Y -> hex.
  private sampleColorAt(clientY: number): string {
    const stops = this.rainbowColors.map((c) => c.hex).filter(Boolean);
    if (stops.length === 0) {
      return '#ffffff';
    }
    if (stops.length === 1) {
      return stops[0];
    }
    const t = Math.min(1, Math.max(0, clientY / window.innerHeight));
    const scaled = t * (stops.length - 1);
    const i = Math.floor(scaled);
    if (i >= stops.length - 1) {
      return stops[stops.length - 1];
    }
    return this.mixHex(stops[i], stops[i + 1], scaled - i);
  }

  // Confirm the chosen color: build a NEW palette from it, insert it into the
  // cycle, snap the cycle onto it (so it's clearly shown), then keep cycling
  // onward through all palettes. The cursor must be re-earned by moving.
  private confirmColor(hex: string, _clickX = 0, _clickY = 0) {
    this.hideCursor();

    const picked = this.buildLocalRainbow(hex).map((c) => c.hex);
    const sorted = [...picked].sort(
      (a, b) => this.lum({ hex: b }) - this.lum({ hex: a })
    );

    // Bloom disabled: switch to the picked theme INSTANTLY (no overlay).
    this.bloomActive = false;

    // Insert the picked theme into the cycle and snap onto it, then KEEP the
    // rainbow flowing/cycling onward from there (never stops after a pick).
    const insertAt =
      Math.floor(this.cycleProgress % this.cycleList.length) + 1;
    this.cycleList.splice(insertAt, 0, sorted);
    this.cycleNames.splice(insertAt, 0, 'picked');
    this.cycleProgress = insertAt;
    this.showPaletteLabel('picked');

    this.colors = sorted.map((h) => ({ hex: h }));
    this.rainbowColors = sorted.map((h) => ({ hex: h }));
    this.autoCycle = true;
    this.startRainbowFlow();
  }

  // Build a full-spectrum rainbow anchored at the picked color's hue and sweeping
  // the ENTIRE color wheel, but KEEPING the picked color's own saturation and
  // lightness. A creamy pick -> a creamy rainbow; a vivid pick -> a vivid one.
  private buildLocalRainbow(hex: string): { hex: string }[] {
    const [h, s, l] = this.hexToHsl(hex);
    const count = 7;
    return Array.from({ length: count }, (_, i) => {
      // Full 360deg sweep, anchored at the picked hue; preserve S and L.
      const hue = (((h + (360 / count) * i) % 360) + 360) % 360;
      return { hex: this.hslToHex(hue, s, l) };
    });
  }

  // --- Color math helpers ---

  private parseHex(hex: string): [number, number, number] {
    const h = hex.replace('#', '');
    if (h.length === 3) {
      return [
        parseInt(h[0].repeat(2), 16),
        parseInt(h[1].repeat(2), 16),
        parseInt(h[2].repeat(2), 16),
      ];
    }
    return [
      parseInt(h.substring(0, 2), 16) || 0,
      parseInt(h.substring(2, 4), 16) || 0,
      parseInt(h.substring(4, 6), 16) || 0,
    ];
  }

  private toHex(n: number): string {
    return Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  }

  private mixHex(a: string, b: string, t: number): string {
    const [ar, ag, ab] = this.parseHex(a);
    const [br, bg, bb] = this.parseHex(b);
    return `#${this.toHex(ar + (br - ar) * t)}${this.toHex(ag + (bg - ag) * t)}${this.toHex(
      ab + (bb - ab) * t
    )}`;
  }

  private hexToHsl(hex: string): [number, number, number] {
    let [r, g, b] = this.parseHex(hex);
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    if (d !== 0) {
      if (max === r) {
        h = ((g - b) / d) % 6;
      } else if (max === g) {
        h = (b - r) / d + 2;
      } else {
        h = (r - g) / d + 4;
      }
      h *= 60;
      if (h < 0) {
        h += 360;
      }
    }
    const l = (max + min) / 2;
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    return [h, s, l];
  }

  private hslToHex(h: number, s: number, l: number): string {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0,
      g = 0,
      b = 0;
    if (h < 60) {
      [r, g, b] = [c, x, 0];
    } else if (h < 120) {
      [r, g, b] = [x, c, 0];
    } else if (h < 180) {
      [r, g, b] = [0, c, x];
    } else if (h < 240) {
      [r, g, b] = [0, x, c];
    } else if (h < 300) {
      [r, g, b] = [x, 0, c];
    } else {
      [r, g, b] = [c, 0, x];
    }
    return `#${this.toHex((r + m) * 255)}${this.toHex((g + m) * 255)}${this.toHex((b + m) * 255)}`;
  }

  get rainbowGradient(): string {
    return this.buildGradient(180);
  }

  get rainbowGradientAngled(): string {
    return this.buildGradient(135);
  }

  private buildGradient(angleDeg: number): string {
    if (!this.rainbowColors || this.rainbowColors.length === 0) {
      return `linear-gradient(${angleDeg}deg, #000 0%, #000 100%)`;
    }
    const colors = this.rainbowColors.map((c) => c.hex);
    if (colors.length === 1) {
      return `linear-gradient(${angleDeg}deg, ${colors[0]} 0%, ${colors[0]} 100%)`;
    }
    const stops = colors.map((hex, i) => {
      const percent = Math.round((i / (colors.length - 1)) * 100);
      return `${hex} ${percent}%`;
    });
    return `linear-gradient(${angleDeg}deg, ${stops.join(', ')})`;
  }

  ngOnInit() {
    this.generate();
  }

  ngAfterViewInit() {
    // The canvas is inside `@if (showRainbow)`, which generate() flips to true
    // synchronously, so the element exists by the time this hook fires.
    this.initWater();
  }

  ngOnDestroy() {
    if (this.idleTimer !== null) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    this.stopRainbowFlow();
    this.destroyWater();
  }

  private lum(c: any): number {
    let r = 0,
      g = 0,
      b = 0;
    if (c.rgb && Array.isArray(c.rgb) && c.rgb.length === 3) {
      [r, g, b] = c.rgb;
    } else if (c.hex) {
      const hex = c.hex.replace('#', '');
      if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
      } else if (hex.length === 3) {
        r = parseInt(hex.substring(0, 1).repeat(2), 16);
        g = parseInt(hex.substring(1, 2).repeat(2), 16);
        b = parseInt(hex.substring(2, 3).repeat(2), 16);
      }
    }
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }

  // Load a palette by the typed name (searchable), falling back to the default
  // pastel palette when the input is empty or doesn't match a known theme.
  generate() {
    this.loading = true;
    this.showRainbow = true;
    const key = (this.theme ?? '').trim();
    if (!key) {
      // Empty search -> resume auto-cycling through ALL palettes.
      this.autoCycle = true;
      this.colors = [...CYBERPUNK_FALLBACK];
      this.applyCycle(); // seed the first frame so there's no blank flash
      this.startRainbowFlow();
    } else {
      // Named search -> pin that palette (stops the cycle).
      const palette = this.resolvePalette(key);
      this.colors = [...palette];
      this.setColors(palette);
      this.showPaletteLabel(key);
    }
    this.loading = false;
    // Rainbow keeps flowing continuously — never marked "done".

    // --- API-backed generation (detached for now) ---
    // Re-enable by uncommenting this block (and the gateway/import lines above),
    // and removing the local-fallback assignment above.
    //
    // const theme = this.theme.trim() || 'cyberglow';
    // this.setColors(DEFAULT_RAINBOW); // instant placeholder while waiting
    // this.gateway
    //   .askForJson(
    //     `You are a professional color designer. Generate a palette for the theme "${theme}".
    // Return EXACTLY 5 colors that are harmonious and accessible. For each color provide: "hex" (a valid #RRGGBB string), "name" (an evocative one-or-two word name), "role" (one of: background, primary, secondary, accent, text), and "rgb" ([r,g,b] integers 0-255).
    // Respond with ONLY valid JSON, no markdown, in the shape { "colors": [ { "hex": "...", "name": "...", "role": "...", "rgb": [r,g,b] } ] }.`
    //   )
    //   .subscribe({
    //     next: (data) => {
    //       const list = (data ?? []).slice(0, 5);
    //       this.colors = list.length ? list : [...CYBERPUNK_FALLBACK];
    //       this.setColors(this.colors);
    //       this.loading = false;
    //     },
    //     error: () => {
    //       this.colors = [...CYBERPUNK_FALLBACK];
    //       this.setColors(CYBERPUNK_FALLBACK);
    //       this.loading = false;
    //     },
    //   });
  }

  // Match the typed name to a known palette (case/space-insensitive, prefix
  // match allowed). Empty or unknown -> default pastel palette.
  private resolvePalette(name: string): { hex: string }[] {
    const key = (name ?? '').trim().toLowerCase();
    if (!key) {
      return CYBERPUNK_FALLBACK;
    }
    if (PALETTES[key]) {
      return PALETTES[key];
    }
    // Fuzzy: allow a prefix or substring match against palette names.
    const match = Object.keys(PALETTES).find(
      (k) => k.startsWith(key) || k.includes(key)
    );
    return match ? PALETTES[match] : CYBERPUNK_FALLBACK;
  }

  // All searchable palette names (for the placeholder hint).
  get paletteNames(): string[] {
    return Object.keys(PALETTES);
  }

  // Pick a readable text color (black/white) for a given card background.
  textColor(c: any): string {
    return this.lum(c) > 140 ? '#000000' : '#FFFFFF';
  }

  // Copy the hex to the clipboard.
  selectColor(c: any) {
    const hex = c?.hex;
    if (!hex) {
      return;
    }
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(hex).catch(() => {});
    }
  }

  onCardEnter(_c: any) {}

  onCardLeave() {}

  onOverlayMouseMove() {}

  // The dynamic list of palettes the auto-cycle morphs through. Starts as all
  // built-in palettes; picking a color INSERTS a new palette here.
  // cycleList and cycleNames are parallel arrays indexed by cycleProgress.
  // We shuffle the palette order on init so the color sequence doesn't
  // always march through the same tempo (sakura -> rose -> lavender...).
  private shuffledPaletteKeys: string[] = this.buildShuffledKeys();
  private cycleList: string[][] = this.buildCycleList();
  private cycleNames: string[] = [...this.shuffledPaletteKeys];

  private buildShuffledKeys(): string[] {
    const keys = Object.keys(PALETTES);
    // Fisher-Yates shuffle.
    for (let i = keys.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [keys[i], keys[j]] = [keys[j], keys[i]];
    }
    return keys;
  }

  private buildCycleList(): string[][] {
    return this.shuffledPaletteKeys.map((key) =>
      [...PALETTES[key]].sort((a, b) => this.lum(b) - this.lum(a)).map((c) => c.hex)
    );
  }

  private defaultCycleList(): string[][] {
    return Object.keys(PALETTES).map((key) =>
      [...PALETTES[key]].sort((a, b) => this.lum(b) - this.lum(a)).map((c) => c.hex)
    );
  }

  // Pin a specific palette (from search): stop auto-cycling and paint it.
  private setColors(data: any[]) {
    this.autoCycle = false;
    // Start the idle-resume countdown fresh from the moment of pinning.
    this.lastActivityTs = performance.now();
    this.baseColors = (data.length ? [...data] : [...DEFAULT_RAINBOW]).sort(
      (a, b) => this.lum(b) - this.lum(a)
    );
    this.rainbowColors = this.baseColors.map((c) => ({ hex: c.hex }));
    this.startRainbowFlow();
  }

  // Auto-cycle: crossfade the on-screen rainbow between the current palette and
  // the next one in the list, based on `cycleProgress`.
  private applyCycle() {
    const list = this.cycleList;
    const n = list.length;
    const base = ((this.cycleProgress % n) + n) % n;
    const i = Math.floor(base);
    const t = base - i;
    const from = list[i];
    const to = list[(i + 1) % n];
    const count = Math.max(from.length, to.length);
    this.rainbowColors = Array.from({ length: count }, (_, k) => {
      const a = from[Math.min(k, from.length - 1)];
      const b = to[Math.min(k, to.length - 1)];
      return { hex: this.mixHex(a, b, t) };
    });
    // Palette-name overlay (feature #9): whenever we cross into a new stop
    // in the cycle (t close to 0), reveal the current palette's name.
    if (t < 0.05) {
      const nm = this.cycleNames[i];
      if (nm && nm !== this.paletteLabel) this.showPaletteLabel(nm);
    }
  }

  // Fade the palette-name overlay in, hold briefly, then fade back out.
  private showPaletteLabel(name: string) {
    this.paletteLabel = name;
    this.paletteLabelVisible = true;
    if (this.paletteLabelHideTimer) clearTimeout(this.paletteLabelHideTimer);
    this.paletteLabelHideTimer = setTimeout(() => {
      this.paletteLabelVisible = false;
    }, 2200);
  }

  // Drive the rainbow: auto-cycle through palettes, or hold a pinned one.
  // Paused while aiming (screen frozen) so the picked color stays exact.
  private startRainbowFlow() {
    if (this.rainbowRaf !== null) {
      return;
    }
    this.lastFrameTs = 0;
    const step = (ts: number) => {
      if (this.aiming) {
        // Frozen while aiming; keep the loop alive but don't advance.
        this.lastFrameTs = ts;
        this.rainbowRaf = requestAnimationFrame(step);
        return;
      }
      if (this.lastFrameTs !== 0 && this.autoCycle) {
        // Palette-advance rules:
        //  1. Mouse must be still for MOUSE_HOLD_MS (no color changes while
        //     the user is actively interacting).
        //  2. No idle atmosphere is playing (rain / swim freezes the cycle
        //     so the color doesn't change on top of the effect).
        //  3. Water is currently static.
        // Together this means: colors cycle when the user has stopped
        // interacting AND the pool is calm AND no atmosphere is active.
        // Cooldown windows between atmospheres satisfy all three so the
        // palette gets a chance to advance between rain / swim sessions.
        const MOUSE_HOLD_MS = 400;
        const mouseActive = performance.now() - this.lastActivityTs < MOUSE_HOLD_MS;
        if (!mouseActive && this.idleMode === null && this.isWaterCalm()) {
          const dt = (ts - this.lastFrameTs) / 1000;
          this.cycleProgress += dt / PageFirst.PALETTE_TRANSITION_SEC;
          this.applyCycle();
        }
      }
      this.lastFrameTs = ts;
      this.rainbowRaf = requestAnimationFrame(step);
    };
    this.rainbowRaf = requestAnimationFrame(step);
  }

  private stopRainbowFlow() {
    if (this.rainbowRaf !== null) {
      cancelAnimationFrame(this.rainbowRaf);
      this.rainbowRaf = null;
    }
  }
}
