import { notificationChannelZodEnumDto, notificationReferenceTypeZodEnumDto, notificationStatusZodEnumDto, notificationTypeZodEnumDto } from "../dtos/NotificationDtos";


export class NotificationEntity {

constructor(
    public readonly id: string,
    public readonly user_id: string,
    public title: string,
    public body: string,
    public  type: notificationTypeZodEnumDto,
    public  channel: notificationChannelZodEnumDto,
    public  status: notificationStatusZodEnumDto,
    public is_read: boolean,
    public readonly created_at: Date,
    public reference_id?: string | null,
    public reference_type?: notificationReferenceTypeZodEnumDto | null,
    public read_at?: Date | null,
    public sent_at?: Date | null,
    public failed_reason?: string | null,
  ) {}

    /** Mark the notification as read */
  markAsRead(): void {
    if (!this.is_read) {
      this.is_read = true;
      this.read_at = new Date();
      if (this.status === 'delivered') {
        this.status = 'read';
      }
    }
  }

    /** Update the status of the notification */
  updateStatus(newStatus: notificationStatusZodEnumDto, failedReason?: string): void {
    this.status = newStatus;

    if (newStatus === 'failed') {
      this.failed_reason = failedReason ?? 'Unknown error';
    }

    if (newStatus === 'sent') {
      this.sent_at = new Date();
    }

    if (newStatus === 'read' && !this.is_read) {
      this.markAsRead();
    }
  }

    /** Link the notification to a specific entity */
  linkReference(referenceId: string, referenceType: notificationReferenceTypeZodEnumDto): void {
    this.reference_id = referenceId;
    this.reference_type = referenceType;
  }

  /** Check if the notification can be acted upon (pending or sent) */
  isActionable(): boolean {
    return ['pending', 'sent'].includes(this.status);
  }


}