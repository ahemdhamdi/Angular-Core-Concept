import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

declare global {
  interface Window {
    initMap: () => void;
  }
}
@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor() { }
}
