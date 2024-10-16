export interface EmailOptions {
  emailTo: string;
  subject: string;
  template: 'activation-email.ejs' | 'comment-reply.ejs';
  data: { [key: string]: any };
}
