import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TitleService {
  private title$ = new BehaviorSubject<string>('getting-started');

  setTitle(title: string) {
    this.title$.next(title ?? 'getting-started');
  }

  getTitle(): Observable<string> {
    return this.title$.asObservable();
  }
}
