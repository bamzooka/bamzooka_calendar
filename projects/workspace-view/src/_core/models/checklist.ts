export enum CHECKLIST_FILTER {
  CHECKLIST_TEMPLATE_ID = 'checklist_template_id',
  ASSIGNEE_ID = 'assignee_id',
  DUE_AT_LESS_THAN = 'due_at_less_than',
  DUE_AT_WITHIN_TWO_DATES = 'due_at_within_two_dates',
  DUE_AT_MORE_OR_EQUAL_THAN = 'due_at_more_or_equal_than',
  IS_COMPLETED = 'is_completed',
  PROJECT_ID = 'project_id',
  STATUS = 'status',
  TYPE = 'type',
  CREATED_AT_OR_DUE_AT_WITHIN_TWO_DATES = 'created_at_or_due_at_within_two_dates',
  NO_DUE_AT = 'no_due_at'
}

export enum CHECKLIST_TYPE {
  CHECKLIST_RUN = 'ChecklistRun',
  CHECKLIST_TEMPLATE = 'ChecklistTemplate',
  CHECKLIST_TABLE = 'ChecklistTable'
}

export enum CHECKLIST_STATUS {
  ACTIVE = 0,
  ARCHIVED = 10,
  DRAFT = 20,
  TRASH = 99
}


export interface Checklist {
  id: number;
  assignee: any
  is_completed: boolean;
  title: string;
  is_fake_checklist: boolean;
  checklist_template_id: number;
  project: {
    workspace_id: number;
    name: string;
  }
  completion_percentage: number;
  type: CHECKLIST_TYPE
  status: CHECKLIST_STATUS;
  due_at: string;
  completed_at: string;
}

export const getChecklistDetailUrl = (checklist: Checklist): string => {
  return `workspaces/${checklist.project.workspace_id}/checklists/${checklist.id}`;
}

export const getCompletionInPercent = (checklist: Checklist): number => {
  return checklist.completion_percentage;
}

export const isChecklistDraft = (checklist: Checklist): boolean => {
  return checklist.status === CHECKLIST_STATUS.DRAFT;
}
export const isChecklistTemplate = (checklist: Checklist): boolean => {
  return (
    checklist.type === CHECKLIST_TYPE.CHECKLIST_TEMPLATE && !isChecklistDraft(checklist)
  );
}

export const getChecklistTemplateUrl = (checklist: Checklist): string => {
  return (
    `workspaces/${checklist.project.workspace_id}` +
    `/checklists/${checklist.checklist_template_id}`
  );
}
