import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import {getShortestDateFormatWithHours} from "../utils";

@Pipe({
  name: 'dueDatePipe'
})
export class DueDatePipe implements PipeTransform {
  datePipe: DatePipe;
  constructor(@Inject(LOCALE_ID) private localeId: string) {
    this.datePipe = new DatePipe(this.localeId);
  }

  transform(value: string): unknown {
    return this.datePipe.transform(value, getShortestDateFormatWithHours(new Date(value)));
  }
}
