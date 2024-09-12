export interface EmailOptions {
  emailTo: string;
  subject: string;
  template: 'activation-email.ejs';
  data: { [key: string]: any };
}
