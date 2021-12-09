import {Component, Input, ViewEncapsulation} from "@angular/core";
import {Checklist, getChecklistDetailUrl} from "../../models";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'checklist-instance-dialog',
  templateUrl: './checklist-instance-dialog.component.html',
  styleUrls: ['./checklist-instance-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ChecklistInstanceDialogComponent {
  @Input() checklist!: Checklist;

  constructor(public activeModal: NgbActiveModal) {
  }

  getChecklistViewLink(checklist: Checklist): string {
    if (checklist.is_fake_checklist) {
      return (
        `/workspaces/${checklist.project.workspace_id}` +
        `/checklists/${checklist.checklist_template_id}`
      );
    } else {
      return `/${getChecklistDetailUrl(checklist)}`;
    }
  }
}
