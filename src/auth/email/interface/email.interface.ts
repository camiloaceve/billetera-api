export interface IEmailBody {
  from: string;
  to: string;
  subject: string;
  templateName: string;
  data: any;
}
