import {ChangeDetectorRef, Component, ViewEncapsulation} from "@angular/core";
import {
  CalendarDayViewBeforeRenderEvent,
  CalendarEvent,
  CalendarEventAction,
  CalendarMonthViewBeforeRenderEvent,
  CalendarView,
  CalendarViewPeriod,
  CalendarWeekViewBeforeRenderEvent
} from "angular-calendar";
import {forkJoin, Subject, Subscription} from "rxjs";
import {ActivatedRoute, Params} from "@angular/router";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {isAfter, isBefore, isSameDay, isSameMonth} from 'date-fns';
import {MonthViewDay, WeekDay} from 'calendar-utils';
import {
  areDatesEqual,
  areDatesSameDay,
  Checklist,
  CHECKLIST_FILTER,
  CHECKLIST_STATUS,
  CHECKLIST_TYPE, ChecklistInstanceDialogComponent,
  EVENT_COLOR_MEANING,
  getEventsForChecklists, getFnsDate,
  HandleErrorService,
  SchedulerFilter
} from "../../_core";
import {McLoggerService} from "@bamzooka/ui-kit-logger";
import {HttpParams} from "@angular/common/http";
import {finalize} from "rxjs/operators";
import {DataService} from "../../_core/services/data.service";

enum EVENT_ACTION {
  CLICKED = 'Clicked',
  VIEW = 'View'
}

@Component({
  selector: 'bamzooka-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CalendarComponent {
  eventActions = EVENT_ACTION;
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date(Date.now());
  period: CalendarViewPeriod | null = null;

  queryParamsSubscription: Subscription | null = null;
  refresh: Subject<void> = new Subject();
  actions: CalendarEventAction[] = [
    // {
    //   label: 'more',
    //   onClick: ({ event }: { event: CalendarEvent }): void => {
    //     this.handleEvent(EVENT_ACTION.VIEW, event);
    //   }
    // }
  ];

  checklists: Checklist[] = [];
  events: CalendarEvent[] = [];
  activeDayIsOpen = false;
  httpCallInProgress = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private handleErrorsService: HandleErrorService,
    private logger: McLoggerService,
    private dataService: DataService
  ) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(() => {
      if (this.period) {
        this.getChecklists(this.period);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
  }

  get currentWorkspace(): any {
    return (window as any).currentWorkspace;
  }

  dayClicked({date, events}: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(getFnsDate(date), getFnsDate(this.viewDate))) {
      this.activeDayIsOpen = !((isSameDay(getFnsDate(this.viewDate), getFnsDate(date)) && this.activeDayIsOpen) || events.length === 0);
      this.viewDate = date;
    }
  }

  onFetchChecklistEventsIfPeriodChanged(newPeriod: CalendarViewPeriod): void {
    if (
      !newPeriod ||
      (this.period &&
        areDatesEqual(this.period.start, newPeriod.start) &&
        areDatesEqual(this.period.end, newPeriod.end))
    ) {
      return;
    }
    this.logger.info(`DashboardCalendar: onFetchChecklistEventsIfPeriodChanged`);
    this.getChecklists(newPeriod);
  }

  beforeViewRender(
    event:
      | CalendarMonthViewBeforeRenderEvent
      | CalendarWeekViewBeforeRenderEvent
      | CalendarDayViewBeforeRenderEvent
  ) {
    this.onFetchChecklistEventsIfPeriodChanged(event.period);
    this.period = event.period;
    this.cdr.detectChanges();
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  handleEvent(action: string, event: CalendarEvent): void {
    this.logger.info(`DashboardCalendar: handle ${action} event for event id=${event.id}`);
    let checklistAssociated: Checklist | undefined;
    switch (action) {
      case EVENT_ACTION.VIEW:
        break;

      case EVENT_ACTION.CLICKED:
        checklistAssociated = this.getChecklistForEvent(event);
        if (checklistAssociated) {
          this.openChecklistDetailDialog(checklistAssociated);
        }
        break;
    }
  }

  getChecklistForEvent(calendarEvent: CalendarEvent): Checklist | undefined {
    return this.checklists.find((c) => c.id === calendarEvent.id);
  }

  /**
   * Return the sorted events. The sort goes:
   * Put the events with the longest period on bottom.
   */
  getSortedDayEvents(day: MonthViewDay): CalendarEvent[] {
    return day.events.sort((e1, e2) => {
      if (!e1.end && !e2.end) {
        return 0;
      }
      if (!e1.end && e2.end) {
        return -1;
      }
      if (e1.end && !e2.end) {
        return 1;
      }
      const firstDayOfRow = new Date(day.date.getTime());
      const lastDayOfRow = new Date(day.date.getTime());
      const depthLeft = day.date.getDay();
      const depthRight = 7 - 1 - day.date.getDay();
      firstDayOfRow.setDate(day.date.getDate() - depthLeft);
      lastDayOfRow.setDate(day.date.getDate() + depthRight);
      const begin1: Date = isBefore(getFnsDate(e1.start), getFnsDate(firstDayOfRow)) ? firstDayOfRow : e1.start;
      // @ts-ignore
      const end1: Date = isAfter(getFnsDate(e1.end), getFnsDate(lastDayOfRow)) ? lastDayOfRow : e1.end;

      const begin2: Date = isBefore(getFnsDate(e2.start),getFnsDate(firstDayOfRow)) ? firstDayOfRow : e2.start;
      // @ts-ignore
      const end2: Date = isAfter(getFnsDate(e2.end), getFnsDate(lastDayOfRow)) ? lastDayOfRow : e2.end;

      const period1 = Math.abs(end1.getTime() - begin1.getTime());
      const period2 = Math.abs(end2.getTime() - begin2.getTime());
      if (period1 < period2) {
        return -1;
      }
      if (period1 > period2) {
        return 1;
      }
      return 0;
    });
  }

  /**
   * The checklist should be displayed only if the day is the first day of the week
   * or if the day is the start of the event
   */
  shouldDisplayChecklistForEventForDay(event: CalendarEvent, day: WeekDay): boolean {
    const isFirstDayOfWeek = day.date.getDay() === 0;
    if (isFirstDayOfWeek) {
      return true;
    }
    return areDatesSameDay(event.start, day.date);
  }

  isTextEllipsis(event: CalendarEvent, day: MonthViewDay): boolean {
    return !event.end || isSameDay(getFnsDate(event.end), getFnsDate(day.date));
  }

  stringToDate(date: string): Date {
    return new Date(date);
  }

  private openChecklistDetailDialog(checklist: Checklist): void {
    this.logger.info(`DashboardCalendar: openChecklistDetailDialog checklist id=${checklist.id}`);
    // open the modal
    const ref = this.modalService.open(ChecklistInstanceDialogComponent);
    // populate the component inputs
    const componentInstance: ChecklistInstanceDialogComponent = ref.componentInstance;
    componentInstance.checklist = checklist;
  }

  private getChecklists(period: CalendarViewPeriod): void {
    // build query params filtering for checklists
    const queryParamsForChecklists: Params = {
      ...this.route.snapshot.queryParams,
      status: CHECKLIST_STATUS.ACTIVE,
      type: CHECKLIST_TYPE.CHECKLIST_RUN
    };
    queryParamsForChecklists[
      CHECKLIST_FILTER.CREATED_AT_OR_DUE_AT_WITHIN_TWO_DATES
      ] = `${period.start.toString()}|${period.end.toString()}`;

    // build query params filtering for fake checklists
    const queryParamsForFakeChecklists: Params = {
      ...this.route.snapshot.queryParams
    };
    const schedulerStartDate: Date = isBefore(getFnsDate(period.start), getFnsDate(new Date())) ? new Date() : period.start;
    const schedulerEndDate: Date = isBefore(getFnsDate(period.end), getFnsDate(new Date())) ? new Date() : period.end;
    queryParamsForFakeChecklists[SchedulerFilter.IS_EXPIRED] = false;
    queryParamsForFakeChecklists[SchedulerFilter.START_DATE] = schedulerStartDate.toString();
    queryParamsForFakeChecklists[SchedulerFilter.END_DATE] = schedulerEndDate.toString();

    const workspaceId = this.currentWorkspace.id
    const checklistParams = new HttpParams({
      fromObject: queryParamsForChecklists
    });
    const fakeChecklistParams = new HttpParams({
      fromObject: queryParamsForFakeChecklists
    });
    // start processing
    this.httpCallInProgress = true;
    this.logger.info(`DashboardCalendar getChecklists with params:`);
    this.logger.table(queryParamsForChecklists);
    this.logger.info(`DashboardCalendar getFakeChecklists with params:`);
    this.logger.table(queryParamsForFakeChecklists);
    forkJoin([
      this.dataService.getChecklists(checklistParams, workspaceId),
      this.dataService.getFakeChecklistsFromScheduler(fakeChecklistParams, workspaceId)
    ])
      .pipe(finalize(() => (this.httpCallInProgress = false)))
      .subscribe(
        (checklistsAndFakeChecklists: any) => {
          const checklists = checklistsAndFakeChecklists[0].concat(checklistsAndFakeChecklists[1]);
          this.checklists = checklists;
          this.createEventsForChecklists(checklists, period);
        },
        (err: any) => {
          this.handleErrorsService.displayCloudErrorToUser(err);
        }
      );
  }

  private createEventsForChecklists(checklists: Checklist[], period: CalendarViewPeriod) {
    this.events = getEventsForChecklists(
      checklists,
      period,
      this.view,
      EVENT_COLOR_MEANING.TEMPLATE,
      this.actions
    );

    console.log('+++++events', this.events);

  }
}
