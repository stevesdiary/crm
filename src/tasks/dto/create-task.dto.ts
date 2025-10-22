export class CreateTaskDto {
  type: string;
  subject: string;
  status?: string;
  priority?: string;
  dueAt?: Date;
  assignedTo: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  notes?: string;
  reminders?: {
    type: string;
    time: Date;
  }[];
}