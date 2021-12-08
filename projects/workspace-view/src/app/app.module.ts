import {Component, Injector, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import {NoopLocationStrategy, RoutedEntryComponent} from "@bamzooka/bamzooka-plugin-sdk";
import {Router, RouterModule} from "@angular/router";
import {CalendarBaseComponent} from "./calendar-base.component";
import {CalendarComponent} from "./calendar/calendar.component";
import {LocationStrategy} from "@angular/common";
import {createCustomElement} from "@angular/elements";
@Component({
  selector: 'entry-component',
  template: '<router-outlet></router-outlet>'
})
class EntryComponent extends RoutedEntryComponent {}
@NgModule({
  declarations: [
    EntryComponent,
    CalendarBaseComponent,
    CalendarComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      {
        path: 'bamzooka-calendar',
        component: CalendarBaseComponent,
        children: [
          {
            path: '',
            component: CalendarComponent
          }
        ]
      }
    ])
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
    const el = createCustomElement(EntryComponent, { injector: injector });
    customElements.define('bamzooka-calendar-workspace', el);
  }

  ngDoBootstrap() {
  }
}
