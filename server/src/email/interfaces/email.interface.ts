export interface EmailOptions {
  emailTo: string;
  subject: string;
  template:
    | 'activation-email.ejs'
    | 'comment-reply.ejs'
    | 'order-confirmation.ejs';
  data: { [key: string]: any };
}
