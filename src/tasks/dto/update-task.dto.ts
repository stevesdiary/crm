export class UpdateTaskDto {
  type?: string;
  subject?: string;
  status?: string;
  priority?: string;
  dueAt?: Date;
  assignedTo?: string;
  notes?: string;
}