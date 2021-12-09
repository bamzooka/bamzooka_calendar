import {Component, Input} from '@angular/core';
import {
  Checklist,
  getChecklistDetailUrl,
  getChecklistTemplateUrl,
  getCompletionInPercent, getFnsDate,
  isChecklistTemplate
} from "../../models";
import {isAfter} from 'date-fns';
@Component({
  selector: 'app-checklist-instance',
  templateUrl: './checklist-instance.component.html',
  styleUrls: ['./checklist-instance.component.scss']
})
export class ChecklistInstanceComponent {
  @Input() checklistInstance!: Checklist;
  @Input() classes: string[] = [];
  @Input() shouldDisplayStarAction = true;
  @Input() shouldDisplayCompletionCheckbox = false;
  @Input() shouldDisplayChecklistExternalLink = false;

  getUserBadgeStyle(): unknown {
    return { width: '25px', height: '25px' };
  }

  getMyCompletionInPercent(): number {
    return Math.round(getCompletionInPercent(this.checklistInstance));
  }

  isChecklistTemplate(): boolean {
    return isChecklistTemplate(this.checklistInstance);
  }

  getChecklistDueDate(): Date | undefined {
    if (this.checklistInstance.due_at) {
      return new Date(this.checklistInstance.due_at);
    }
    return undefined;
  }

  getChecklistDetailUrl(checklist: Checklist): string {
    if (checklist.is_fake_checklist) {
      return `/${getChecklistTemplateUrl(checklist)}`;
    } else {
      return `/${getChecklistDetailUrl(checklist)}`;
    }
  }

  getCompletedAtTextClass(): string {
    if (!this.getChecklistDueDate() || !this.getCompletedAtDate()) {
      return `text-muted`;
    }
    if (this.wasCompletedTooLate()) {
      return `text-danger`;
    } else {
      return `text-muted`;
    }
  }

  wasCompletedTooLate(): boolean {
    if (this.getChecklistDueDate() && this.getCompletedAtDate()) {
      // @ts-ignore
      const dueDate: Date =  this.getChecklistDueDate();
      // @ts-ignore
      const completedAt: Date = this.getCompletedAtDate();
      return isAfter(getFnsDate(completedAt), getFnsDate(dueDate));
    }
    return false;
  }

  getCompletedAtDate(): Date | undefined {
    if (this.checklistInstance.completed_at) {
      return new Date(this.checklistInstance.completed_at);
    }
    return undefined;
  }
}
