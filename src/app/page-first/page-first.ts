
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface ColorCard {
  hex: string;
  name?: string;
  role?: string;
  rgb?: number[];
}

const PASTEL: ColorCard[] = [
  { hex: '#FBB6E0', name: 'Pastel Pink' },
  { hex: '#FFC9B5', name: 'Soft Peach' },
  { hex: '#FDE9A9', name: 'Butter Yellow' },
  { hex: '#DDF5A6', name: 'Lime Mist' },
  { hex: '#AEEFC6', name: 'Mint Green' },
  { hex: '#A9EEE6', name: 'Seafoam' },
  { hex: '#A7DBF5', name: 'Sky Aqua' }
];

const PALETTES: Record<string, ColorCard[]> = {
  pastel: PASTEL,

  sunset: [
    { hex: '#FF6B6B' },
    { hex: '#FF8E72' },
    { hex: '#FFB05C' },
    { hex: '#FFD56B' },
    { hex: '#F98A8A' },
    { hex: '#C9508A' },
    { hex: '#6A2C70' }
  ],

  ocean: [
    { hex: '#001F54' },
    { hex: '#034078' },
    { hex: '#1282A2' },
    { hex: '#3AA6B9' },
    { hex: '#5FD0DF' },
    { hex: '#A2E8F0' },
    { hex: '#E0FBFF' }
  ],

  forest: [
    { hex: '#0B3D2E' },
    { hex: '#14532D' },
    { hex: '#2E7D32' },
    { hex: '#4CAF50' },
    { hex: '#8BC34A' },
    { hex: '#C5E1A5' },
    { hex: '#EDF7E0' }
  ],

  neon: [
    { hex: '#FF00A0' },
    { hex: '#FF2079' },
    { hex: '#FE00FE' },
    { hex: '#00F0FF' },
    { hex: '#00FF9F' },
    { hex: '#B4FF00' },
    { hex: '#FEE440' }
  ]
};

@Component({
  selector: 'app-page-color',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './page-first.html',
  styleUrl: './page-first.scss'
})
export class PageFirst implements OnInit {

  theme = '';

  colors: ColorCard[] = [];

  ngOnInit(): void {
    this.generate();
  }

  generate(): void {

    const key =
      this.theme.trim().toLowerCase();

    if (!key) {
      this.colors = [...PASTEL];
      return;
    }

    this.colors =
      PALETTES[key] ??
      [...PASTEL];
  }

  selectColor(color: ColorCard): void {

    navigator.clipboard
      ?.writeText(color.hex);

    console.log(
      'Copied:',
      color.hex
    );
  }

  textColor(color: ColorCard): string {

    const [r, g, b] =
      this.parseHex(color.hex);

    const brightness =
      r * 0.299 +
      g * 0.587 +
      b * 0.114;

    return brightness > 140
      ? '#000'
      : '#FFF';
  }

  private parseHex(
    hex: string
  ): [number, number, number] {

    const clean =
      hex.replace('#', '');

    const r =
      parseInt(
        clean.substring(0, 2),
        16
      );

    const g =
      parseInt(
        clean.substring(2, 4),
        16
      );

    const b =
      parseInt(
        clean.substring(4, 6),
        16
      );

    return [r, g, b];
  }
}
