// import { Checklist } from '@bamzooka/bamzooka-models';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarView,
  CalendarViewPeriod
} from 'angular-calendar';
import { generateColorFromNumber, hexToRgb } from '@bamzooka/utils-color';
import { isWithinInterval, isAfter } from 'date-fns';
import {getFnsDate} from "./index";


export function areDatesEqual(d1: Date, d2: Date): boolean {
  return d1.getTime() === d2.getTime();
}

export function areDatesSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}


/**
 * Returns a color according to the diff between the due date and today's date
 */
export function getColorDependingOnDueDate(date: Date): string {
  const now: Date = new Date(Date.now());
  const dueDateMinus2Days: Date = new Date(date);
  dueDateMinus2Days.setDate(date.getDate() - 2);

  // 2 days before the due date
  if (now >= dueDateMinus2Days && now < date) {
    return '#ffc107';
  }
  if (date < now) {
    // past the due date
    return `#dc3545`;
  } else {
    // before 2 days before the due date
    return `#6c757d`;
  }
}
export enum EVENT_COLOR_MEANING {
  DUE_DATE,
  TEMPLATE
}

export interface ChecklistEventColor {
  primary: string;
  secondary: string;
}

export function getEventsForChecklists(
  // checklists: Checklist[],
  checklists: any[],
  period: CalendarViewPeriod,
  viewType: CalendarView,
  colorMeaning = EVENT_COLOR_MEANING.TEMPLATE,
  actionEvents: CalendarEventAction[] = []
): CalendarEvent[] {
  return checklists.map((c) => {
    return getEventForChecklist(c, period, viewType, colorMeaning, actionEvents);
  });
}

export function getEventForChecklist(
  // checklist: Checklist,
  checklist: any,
  period: CalendarViewPeriod,
  viewType: CalendarView,
  colorMeaning = EVENT_COLOR_MEANING.TEMPLATE,
  actionEvents: CalendarEventAction[] = []
) {
  let eventColor: ChecklistEventColor;
  switch (colorMeaning) {
    case EVENT_COLOR_MEANING.TEMPLATE:
      eventColor = getChecklistTemplateEventColor(checklist);
      break;
    case EVENT_COLOR_MEANING.DUE_DATE:
      eventColor = getChecklistDueDateEventColor(checklist);
      break;
  }
  return {
    id: checklist.id,
    title: checklist.title,
    actions: actionEvents,
    start: new Date(checklist.created_at),
    end: getChecklistEndDate(checklist),
    color: eventColor,
    allDay: getChecklistIsAllDay(checklist, period, viewType)
  } as CalendarEvent;
}

function getChecklistIsAllDay(
  // checklist: Checklist,
  checklist: any,
  period: CalendarViewPeriod,
  viewType: CalendarView
): boolean {
  let startDate: Date;
  switch (viewType) {
    case CalendarView.Month:
      return !!checklist.due_at;
    case CalendarView.Week:
    case CalendarView.Day:
      startDate = new Date(checklist.created_at);

      if (
        isWithinInterval(startDate, {
          start:
         getFnsDate(period.start),
          end: getFnsDate(period.end)
        })
      ) {
        return false;
      }
      if (!checklist.due_at) {
        return false;
      }
      return !isWithinInterval(getFnsDate(checklist.due_at), {
        start: period.start,
        end: period.end
      });
  }
}

function getChecklistTemplateEventColor(checklist: any): ChecklistEventColor {
  const primary = generateColorFromNumber(checklist.checklist_template_id);
  const secondary = generateColorFromNumber(checklist.checklist_template_id);
  const primaryRgb = hexToRgb(primary) || '';
  const secondaryRgb = hexToRgb(secondary) || '';
  const primaryOpacity = 0.4;
  const secondaryOpacity = 0.2;

  const primaryParam =
    `rgba(${primaryRgb[0]},${primaryRgb[1]},` + `${primaryRgb[2]},${primaryOpacity})`;
  const secondaryParam =
    `rgba(${secondaryRgb[0]},${secondaryRgb[1]},` + `${secondaryRgb[2]},${secondaryOpacity})`;
  return {
    primary: primaryParam,
    secondary: secondaryParam
  };
}

function getChecklistDueDateEventColor(checklist: any): ChecklistEventColor {
  let color: string;
  if (checklist.is_fake_checklist) {
    color = '#87CEEB';
  } else {
    if (checklist.due_at) {
      if (checklist.completed_at) {
        if (isAfter(getFnsDate(checklist.completed_at), getFnsDate(checklist.due_at))) {
          color = '#dc3545';
        } else {
          color = '#28a745';
        }
      } else {
        color = getColorDependingOnDueDate(new Date(checklist.due_at));
      }
    } else {
      color = `#6c757d`;
    }
  }
  return {
    primary: color,
    secondary: color
  };
}

function getChecklistEndDate(checklist: any): Date | null {
  return checklist.due_at && isAfter(getFnsDate(checklist.due_at), getFnsDate(checklist.created_at))
    ? new Date(checklist.due_at)
    : null;
}
