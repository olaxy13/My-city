import { resend } from '../config/resend';
import { env } from '../config/env';

export interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private static async sendEmail({ to, subject, html }: EmailParams): Promise<boolean> {
    try {
      if (env.NODE_ENV === 'test' || env.RESEND_API_KEY.includes('placeholder')) {
        console.log(`[EmailService Mock] To: ${to} | Subject: "${subject}"`);
        return true;
      }

      const response = await resend.emails.send({
        from: env.EMAIL_FROM,
        to,
        subject,
        html,
      });

      if (response.error) {
        console.error('[EmailService Error]:', response.error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[EmailService Exception]:', error);
      return false;
    }
  }

  static async sendSubmissionReceivedEmail(
    toEmail: string,
    submitterName: string,
    listingTitle: string
  ) {
    const subject = `Your submission "${listingTitle}" has been received!`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
        <h2 style="color: #0f172a;">Submission Received 🚀</h2>
        <p>Hi ${submitterName},</p>
        <p>Thank you for submitting <strong>${listingTitle}</strong> to our city discovery platform.</p>
        <p>Our curation team will review your listing shortly to ensure it meets our quality standards. You will receive an email as soon as a review decision is made.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 13px; color: #64748b;">City Discovery Platform &bull; Exploring the best around you</p>
      </div>
    `;
    return this.sendEmail({ to: toEmail, subject, html });
  }

  static async sendListingApprovedEmail(
    toEmail: string,
    submitterName: string,
    listingTitle: string,
    listingId: string
  ) {
    const publicUrl = `${env.FRONTEND_URL}/listings/${listingId}`;
    const subject = `Congratulations! "${listingTitle}" is now live! 🎉`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
        <h2 style="color: #15803d;">Your Listing is Approved! 🎉</h2>
        <p>Hi ${submitterName},</p>
        <p>Great news! Your listing <strong>${listingTitle}</strong> has been reviewed and approved by our team.</p>
        <p>It is now live on our city discovery feed for the community to discover.</p>
        <div style="margin: 25px 0;">
          <a href="${publicUrl}" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            View Your Live Listing
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 13px; color: #64748b;">City Discovery Platform &bull; Exploring the best around you</p>
      </div>
    `;
    return this.sendEmail({ to: toEmail, subject, html });
  }

  static async sendListingRejectedEmail(
    toEmail: string,
    submitterName: string,
    listingTitle: string,
    rejectionReason: string
  ) {
    const subject = `Update regarding your submission "${listingTitle}"`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
        <h2 style="color: #b91c1c;">Listing Not Approved</h2>
        <p>Hi ${submitterName},</p>
        <p>Thank you for submitting <strong>${listingTitle}</strong>. Unfortunately, our curation team was unable to approve your listing at this time.</p>
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <strong style="color: #991b1b;">Reason:</strong>
          <p style="margin: 5px 0 0 0; color: #7f1d1d;">${rejectionReason}</p>
        </div>
        <p>If you have any questions or feel this was in error, please feel free to reach out to our team.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 13px; color: #64748b;">City Discovery Platform &bull; Exploring the best around you</p>
      </div>
    `;
    return this.sendEmail({ to: toEmail, subject, html });
  }

  static async sendChangesRequestedEmail(
    toEmail: string,
    submitterName: string,
    listingTitle: string,
    adminNotes: string,
    listingId: string,
    editToken: string
  ) {
    const editUrl = `${env.FRONTEND_URL}/submit?listingId=${listingId}&token=${encodeURIComponent(editToken)}`;
    const subject = `Action Required: Changes requested for "${listingTitle}"`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
        <h2 style="color: #d97706;">Changes Requested for Your Listing ✏️</h2>
        <p>Hi ${submitterName},</p>
        <p>Our curation team reviewed your submission for <strong>${listingTitle}</strong> and noted a few adjustments needed before we can publish it:</p>
        <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <strong style="color: #92400e;">Admin Feedback:</strong>
          <p style="margin: 5px 0 0 0; color: #78350f;">${adminNotes}</p>
        </div>
        <p>You can easily update your listing details and resubmit by clicking the button below:</p>
        <div style="margin: 25px 0;">
          <a href="${editUrl}" style="background-color: #d97706; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Update & Resubmit Listing
          </a>
        </div>
        <p style="font-size: 12px; color: #64748b;">Or paste this link into your browser: <br/><code>${editUrl}</code></p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 13px; color: #64748b;">City Discovery Platform &bull; Exploring the best around you</p>
      </div>
    `;
    return this.sendEmail({ to: toEmail, subject, html });
  }
}
