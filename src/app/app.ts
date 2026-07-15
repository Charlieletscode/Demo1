import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PageFirst } from './page-first/page-first';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PageFirst],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('color');
}
