import {Component, Injector, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {NoopLocationStrategy, RoutedEntryComponent} from "@bamzooka/bamzooka-plugin-sdk";
import {Router, RouterModule} from "@angular/router";
import {CalendarBaseComponent} from "./calendar-base.component";
import {CalendarComponent} from "./calendar/calendar.component";
import {LocationStrategy} from "@angular/common";
import {createCustomElement} from "@angular/elements";
import {CalendarModule, DateAdapter} from "angular-calendar";
import {adapterFactory} from 'angular-calendar/date-adapters/date-fns';
import {McIconModule, McPaginationModule, McPipeTruncateModule, McUserBadgeModule} from "@bamzooka/ui-kit";
import {Check, CalendarWeek, CardChecklist, BoxArrowUpRight} from '@bamzooka/ui-kit-icon';
import {NgbDropdownModule} from "@ng-bootstrap/ng-bootstrap";
import {
  ChecklistInstanceDialogComponent, UserBadgeComponent
} from "../_core";
import {HttpClientModule} from "@angular/common/http";

@Component({
  selector: 'entry-component',
  template: '<router-outlet></router-outlet>'
})
class EntryComponent extends RoutedEntryComponent {
}

@NgModule({
  declarations: [
    EntryComponent,
    CalendarBaseComponent,
    CalendarComponent,
    ChecklistInstanceDialogComponent,
    UserBadgeComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot([
      {
        path: 'bamzooka_calendar',
        component: CalendarBaseComponent,
        children: [
          {
            path: '',
            component: CalendarComponent
          }
        ]
      }
    ]),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    McPaginationModule,
    NgbDropdownModule,
    McPipeTruncateModule,
    McIconModule.pick({
      Check,
      CalendarWeek,
      CardChecklist,
      BoxArrowUpRight
    }),
    McUserBadgeModule
  ],
  providers: [
    {provide: LocationStrategy, useClass: NoopLocationStrategy}
  ]
})
export class AppModule {

  constructor(injector: Injector, private router: Router) {
    // @ts-ignore
    const baseHrf = window['plugin-base-href'];
    const config = this.router.config;
    config[0].path = `${baseHrf}/${config[0].path}`;
    this.router.resetConfig(config);
    const el = createCustomElement(EntryComponent, {injector: injector});
    customElements.define('bamzooka-calendar-workspace', el);
  }

  ngDoBootstrap() {
  }
}
