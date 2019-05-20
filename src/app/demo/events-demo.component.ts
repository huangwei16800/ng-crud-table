import {Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Column, Settings, DataTable, CellEventType} from '../../lib/ng-data-table';
import {getColumnsPlayers} from './columns';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-events-demo',
  template: `
    <div #tooltip class="tooltip">
      <b>{{this.eventName}}</b>: {{this.eventValue}}
    </div>
    <app-data-table [table]="table"></app-data-table>
    <div class="dt-message dt-message-success" style="word-break: break-all;"
    *ngIf="this.cellValueChangedEvent">
      <b>cellValueChanged:</b> {{this.cellValueChangedEvent}}
    </div><br>
    <div class="dt-message dt-message-success" style="word-break: break-all;">
    <b>{{this.eventName}}:</b> {{this.eventValue}}
    </div>
  `,
})

export class EventsDemoComponent implements OnInit, OnDestroy {

  table: DataTable;
  columns: Column[];

  settings: Settings = new Settings({
    hoverEvents: true,
    contextMenu: true,
  });
  eventName: string = 'Event name';
  eventValue: any = 'event value';
  cellValueChangedEvent: any;
  timer: any;
  @ViewChild('tooltip') tooltip: ElementRef;

  private subscriptions: Subscription[] = [];

  constructor(private http: HttpClient, private cd: ChangeDetectorRef) {
    this.columns = getColumnsPlayers();
    this.table = new DataTable(this.columns, this.settings);
  }

  ngOnInit() {
    this.table.events.onLoading(true);
    this.http.get('assets/players.json').subscribe(data => {
      this.table.rows = data;
      this.table.events.onLoading(false);
    });

    const subCell = this.table.events.cellSource$.subscribe((data) => {
      if (data.type === CellEventType.ContextMenu) {
        this.printEvent('contextmenu', data);
      }
      if (data.type === CellEventType.Mouseover) {
        this.printEvent('mouseover', data);
        if (this.timer) {
          clearTimeout(this.timer);
        }
        this.timer = setTimeout(() => {
          this.showTooltip(data.event);
          this.timer = null;
        }, 700);
      }
      if (data.type === CellEventType.Mouseout) {
        this.printEvent('mouseout', data);
        this.hideTooltip();
      }
      if (data.type === CellEventType.ValueChanged) {
        this.cellValueChangedEvent = JSON.stringify(data);
      }
    });
    this.subscriptions.push(subCell);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  printEvent(name: string, event: any) {
    this.eventName = name;
    if (this.eventName === 'mouseout') {
      this.eventValue = JSON.stringify(event);
    } else {
      const columnName = this.table.columns[event.columnIndex].name;
      const cell = this.table.rows[event.rowIndex][columnName];
      this.eventValue = JSON.stringify({columnName, cell});
    }
    this.cd.detectChanges();
  }

  showTooltip(event: MouseEvent) {
    this.tooltip.nativeElement.style.left = event.pageX + 'px';
    this.tooltip.nativeElement.style.top = event.pageY + 'px';
    this.tooltip.nativeElement.style.visibility = 'visible';
  }

  hideTooltip() {
    this.tooltip.nativeElement.style.visibility = 'hidden';
  }

}
