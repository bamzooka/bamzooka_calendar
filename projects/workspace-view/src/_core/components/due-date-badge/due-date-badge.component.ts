import {Component, Input} from "@angular/core";
import {getShortestDateFormatWithHours} from "../../utils";


function getTitleDependingOnDueDate(date: Date | undefined): string {
  if(!date) {
    return 'No due date';
  }
  const now: Date = new Date(Date.now());
  const dueDateMinus2Days: Date = new Date(date);
  dueDateMinus2Days.setDate(date.getDate() - 2);
  // 2 days before the due date
  if (now >= dueDateMinus2Days && now < date) {
    return `due soon`;
  }
  if (date < now) {
    // past the due date
    return `past due`;
  } else {
    // before 2 days before the due date
    return `due date`;
  }
}

function getBootstrapClassDependingOnDueDate(date: Date): string {
  const now: Date = new Date(Date.now());
  const dueDateMinus2Days: Date = new Date(date);
  dueDateMinus2Days.setDate(date.getDate() - 2);

  // 2 days before the due date
  if (now >= dueDateMinus2Days && now < date) {
    return `warning`;
  }
  if (date < now) {
    // past the due date
    return `danger`;
  } else {
    // before 2 days before the due date
    return `secondary`;
  }
}

@Component({
  selector: 'due-date-badge',
  template: `
    <span
      class="badge"
      [attr.title]="getTitleDependingOnDueDate()"
      [ngClass]="getClassDependingOnDueDate()!"
    >
  <mc-icon [name]="'clock'"></mc-icon>
  &nbsp;<span class="text-muted">{{ dueDate.toString() | dueDatePipe }}</span>
</span>

  `,
  styles: [`
    .badge {
      font-weight: unset;
    }

  `]
})
export class DueDateBadgeComponent {
  @Input() dueDate!: Date;
  @Input() isCompleted: boolean = false;

  getTitleDependingOnDueDate(): string | undefined {
    if (this.isCompleted) {
      return undefined;
    }
    return getTitleDependingOnDueDate(this.dueDate);
  }

  getPipeDateFormatter(date: Date): string {
    return getShortestDateFormatWithHours(date);
  }

  getClassDependingOnDueDate(): string | undefined {
    if (!this.dueDate) {
      return undefined;
    }
    /** If the element is completed */
    if (this.isCompleted) {
      return 'badge-outline-secondary';
    }

    return `badge-outline-${getBootstrapClassDependingOnDueDate(this.dueDate)}`;

  }
}
