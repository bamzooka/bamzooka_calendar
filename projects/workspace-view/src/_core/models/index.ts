import {format, parseISO} from 'date-fns';

export * from './checklist-calendar-events';
export * from './checklist';
export * from './scheduler';
export * from './user';

export const getFnsDate = (date: string | Date) => {
  return parseISO(new Date(date).toISOString());

};
