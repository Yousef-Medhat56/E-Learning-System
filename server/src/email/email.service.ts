import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EmailOptions } from './interfaces/email.interface';
import * as path from 'path';
import * as ejs from 'ejs';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendEmail({ emailTo, subject, template, data }: EmailOptions) {
    try {
      // get email template path
      const templatePath = path.join(__dirname, '/templates', template);

      // render ejs file
      const html = await ejs.renderFile(templatePath, data);

      // sned email
      await this.mailerService.sendMail({
        from: process.env.EMAIL_USERNAME,
        to: emailTo,
        subject,
        html,
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
