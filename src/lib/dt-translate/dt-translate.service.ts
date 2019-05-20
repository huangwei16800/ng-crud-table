import { Injectable, EventEmitter } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DtMessagesEn } from './dt-messages';

@Injectable()
export class DtTranslateService {

  data: any = {};
  private _onLangChange: EventEmitter<any> = new EventEmitter<any>();

  constructor() {
    this.data = {DT: new DtMessagesEn()};
  }

  get(key: any): Observable<string | any> {
    return of(this.getValue(this.data, key) || key);
  }

  get onLangChange(): EventEmitter<any> {
    return this._onLangChange;
  }

  use(lang: string) {
    this._onLangChange.emit({lang, translations: ''});
  }

  private getValue(target: any, key: string): any {
    if (!key) { return key; }
    const keys = key.split('.');
    key = '';
    do {
      key += keys.shift();
      if (target && target[key] && (typeof target[key] === 'object' || !keys.length)) {
        target = target[key];
        key = '';
      } else if (!keys.length) {
        target = undefined;
      } else {
        key += '.';
      }
    } while (keys.length);

    return target;
  }

}
