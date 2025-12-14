import type { MailDataRequired } from '@sendgrid/helpers/classes/mail';
import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';

type RsvpData = {
  name: string;
  email: string;
  attending?: string;
  guests?: number;
  message?: string;
  visibility?: string;
};

function buildMessage(rsvp: RsvpData) {
  const subject = `RSVP from ${rsvp.name} - ${rsvp.attending ?? 'unspecified'}`;
  const text = `Name: ${rsvp.name}\nEmail: ${rsvp.email}\nAttending: ${rsvp.attending}\nGuests: ${rsvp.guests}\nMessage: ${rsvp.message ?? ''}`;
  const html = `<p><strong>Name:</strong> ${rsvp.name}</p><p><strong>Email:</strong> ${rsvp.email}</p><p><strong>Attending:</strong> ${rsvp.attending}</p><p><strong>Guests:</strong> ${rsvp.guests}</p><p><strong>Visibility:</strong> ${rsvp.visibility ?? 'private'}</p><p><strong>Message:</strong> ${rsvp.message ?? ''}</p>`;
  return { subject, text, html };
}

export async function sendRsvpNotification(rsvp: RsvpData) {
  // Prefer SendGrid if configured
  if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM && process.env.SENDGRID_TO) {
    try {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const { subject, text, html } = buildMessage(rsvp);
      const msg: MailDataRequired = {
        to: process.env.SENDGRID_TO!,
        from: process.env.SENDGRID_FROM!,
        subject,
        text,
        html,
      };
      await sgMail.send(msg);
      console.log('RSVP email sent via SendGrid');
      return;
    } catch (err) {
      console.error('SendGrid send error', err);
      // fall through to SMTP attempt
    }
  }

  // Fallback to SMTP if configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_FROM && process.env.SMTP_TO) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: (process.env.SMTP_SECURE ?? 'false') === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      const { subject, text, html } = buildMessage(rsvp);
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: process.env.SMTP_TO,
        subject,
        text,
        html,
      });
      console.log('RSVP email sent via SMTP');
      return;
    } catch (err) {
      console.error('SMTP send error', err);
    }
  }

  console.warn('No email provider configured, skipping RSVP notification');
}
