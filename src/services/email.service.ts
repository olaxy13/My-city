import { resend } from '../config/resend';
import { env } from '../config/env';

export interface EmailParams {
  to: string;
  subject: string;
  html: string;
}
export interface TicketEmailItem {
  ticketCode: string;
  tierName: string;
  attendeeName: string;
  attendeeEmail?: string;
  qrDataUrl: string;
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

  /**
   * Sends personalized digital ticket pass directly to the specific attendee's email
   */
  static async sendAttendeeTicketEmail({
    toEmail,
    attendeeName,
    buyerName,
    eventTitle,
    eventDate,
    eventAddress,
    ticket,
  }: {
    toEmail: string;
    attendeeName: string;
    buyerName: string;
    eventTitle: string;
    eventDate: Date | null;
    eventAddress: string | null;
    ticket: TicketEmailItem;
  }) {
    const subject = `Your Ticket for ${eventTitle} 🎟️ (${ticket.ticketCode})`;
    const formattedDate = eventDate
      ? new Date(eventDate).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })
      : "See event page";
    const purchasedByNotice =
      buyerName && buyerName.trim().toLowerCase() !== attendeeName.trim().toLowerCase()
        ? `<p style="font-size: 13px; color: #64748b; margin: 0 0 16px;">Gifted / Purchased by <strong>${buyerName}</strong></p>`
        : "";

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff;">
      <h2 style="color: #0f172a; margin-top: 0;">You're Going to ${eventTitle}! 🎉</h2>
      <p>Hi ${attendeeName},</p>
      ${purchasedByNotice}
      <p>Here is your official digital entry pass. Present this QR code on your phone at the entrance gate for check-in.</p>
      
      <div style="background-color: #f1f5f9; padding: 14px 18px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 4px 0;"><strong>📅 Date & Time:</strong> ${formattedDate}</p>
        <p style="margin: 4px 0;"><strong>📍 Venue:</strong> ${eventAddress || "Venue provided by organizer"}</p>
      </div>

      <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
        <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin: 0 0 4px;">TICKET HOLDER</p>
        <h3 style="margin: 0 0 6px; color: #0f172a; font-size: 20px;">${attendeeName}</h3>
        <p style="display: inline-block; background-color: #e0e7ff; color: #3730a3; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: bold; margin: 0 0 16px;">
          ${ticket.tierName}
        </p>

        <img src="${ticket.qrDataUrl}" width="180" height="180" alt="Ticket QR Code" style="display: block; margin: 0 auto 12px; border: 1px solid #e2e8f0; padding: 8px; background: #ffffff; border-radius: 8px;" />

        <p style="font-family: monospace; font-size: 18px; font-weight: bold; letter-spacing: 3px; color: #2563eb; margin: 8px 0 4px;">
          ${ticket.ticketCode}
        </p>
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">Scan at entry gate &bull; Single admission</p>
      </div>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">Citybuzz &bull; Abeokuta City Discovery & Events</p>
    </div>
    `;

    return this.sendEmail({ to: toEmail, subject, html });
  }

  /**
   * Sends the official payment confirmation and order receipt to the buyer
   */
  static async sendBuyerOrderReceiptEmail({
    toEmail,
    buyerName,
    eventTitle,
    eventDate,
    eventAddress,
    orderReference,
    totalAmountInNaira,
    tickets,
  }: {
    toEmail: string;
    buyerName: string;
    eventTitle: string;
    eventDate: Date | null;
    eventAddress: string | null;
    orderReference: string;
    totalAmountInNaira: number;
    tickets: TicketEmailItem[];
  }) {
    const subject = `Order Confirmed: ${eventTitle} (Ref: ${orderReference}) 🧾`;
    const formattedDate = eventDate
      ? new Date(eventDate).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })
      : "See event page";

    const ticketListHtml = tickets
      .map(
        (t, idx) => `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <p style="margin: 0; font-weight: bold; color: #0f172a;">#${idx + 1}: ${t.attendeeName} (${t.tierName})</p>
            <p style="margin: 0; font-family: monospace; font-size: 13px; color: #2563eb; font-weight: bold;">${t.ticketCode}</p>
          </div>
          ${t.attendeeEmail ? `<p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">Ticket pass emailed to: <strong>${t.attendeeEmail}</strong></p>` : ''}
        </div>
      `
      )
      .join("");

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff;">
      <h2 style="color: #0f172a; margin-top: 0;">Order Confirmed! 🎉</h2>
      <p>Hi ${buyerName},</p>
      <p>Thank you for your purchase! We have confirmed payment of <strong>₦${totalAmountInNaira.toLocaleString()}</strong> for your order (<strong>${orderReference}</strong>).</p>

      <div style="background-color: #f1f5f9; padding: 14px 18px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 4px 0;"><strong>🎉 Event:</strong> ${eventTitle}</p>
        <p style="margin: 4px 0;"><strong>📅 Date & Time:</strong> ${formattedDate}</p>
        <p style="margin: 4px 0;"><strong>📍 Venue:</strong> ${eventAddress || "Venue provided by organizer"}</p>
        <p style="margin: 4px 0;"><strong>🎟️ Total Tickets:</strong> ${tickets.length}</p>
      </div>

      <h3 style="color: #0f172a; margin: 24px 0 10px;">Issued Tickets</h3>
      <p style="font-size: 13px; color: #64748b; margin-top: 0;">Individual digital ticket passes with unique QR codes have been emailed to each attendee below:</p>
      ${ticketListHtml}

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">Citybuzz &bull; Abeokuta City Discovery & Events</p>
    </div>
    `;

    return this.sendEmail({ to: toEmail, subject, html });
  }

  static async sendTicketConfirmationEmail(
    toEmail: string,
    customerName: string,
    eventTitle: string,
    eventDate: Date | null,
    eventAddress: string | null,
    tickets: TicketEmailItem[]
  ) {
    const subject = `Your Tickets for ${eventTitle} 🎟️`;
    const ticketRowsHtml = tickets
      .map(
        (t) => `
      <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 16px; margin-bottom: 16px; text-align: center;">
        <p style="font-size: 14px; color: #64748b; margin: 0;">ATTENDEE</p>
        <h3 style="margin: 4px 0 12px; color: #0f172a;">${t.attendeeName}</h3>
       <p style="font-size: 13px; color: #3b82f6; margin: 0 0 12px; font-weight: bold;">${t.tierName}</p>
        <img src="${t.qrDataUrl}" width="160" height="160" alt="Ticket QR Code" style="display: block; margin: 0 auto;" />
        <p style="font-family: monospace; font-size: 16px; font-weight: bold; letter-spacing: 2px; color: #3b82f6; margin: 12px 0 0;">
          ${t.ticketCode}
        </p>
      </div>
    `
      )
      .join("");
    const formattedDate = eventDate ? new Date(eventDate).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" }) : "See event page";
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff;">
      <h2 style="color: #0f172a; margin-top: 0;">You're Going to ${eventTitle}! 🎉</h2>
      <p>Hi ${customerName},</p>
      <p>Your payment was successful and your tickets are ready. Present the QR code(s) below at the entrance for admission.</p>
      
      <div style="background-color: #f1f5f9; padding: 12px 16px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 4px 0;"><strong>📅 Date:</strong> ${formattedDate}</p>
        <p style="margin: 4px 0;"><strong>📍 Venue:</strong> ${eventAddress || "Venue provided by organizer"}</p>
      </div>
      <h3 style="color: #0f172a; margin-bottom: 12px;">Your Tickets (${tickets.length})</h3>
      ${ticketRowsHtml}
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">Citybuzz &bull; Abeokuta City Discovery & Events</p>
    </div>
  `;
    return this.sendEmail({ to: toEmail, subject, html });
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
    listingId: string,
    listingType?: string,
    checkInPin?: string | null
  ) {
    const publicUrl = `${env.FRONTEND_URL}/listings/${listingId}`;
    const scannerUrl = `${env.FRONTEND_URL}/organizer/check-in?eventId=${listingId}`;
    const subject = `Congratulations! "${listingTitle}" is now live! 🎉`;

    // Build the event-specific gate PIN section
    const pinSectionHtml = (listingType?.toLowerCase() === 'event' && checkInPin) ? `
        <div style="background-color: #f0fdf4; border: 2px solid #22c55e; border-radius: 12px; padding: 22px; margin: 24px 0; text-align: center;">
          <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #16a34a; margin: 0 0 8px; font-weight: bold;">🔐 Gate Check-In PIN</p>
          <p style="font-family: monospace; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #15803d; margin: 0 0 8px;">${checkInPin}</p>
          <p style="font-size: 13px; color: #166534; margin: 0; font-weight: 500;">Share this 6-digit PIN with your event ushers / door staff only</p>
          <p style="font-size: 12px; color: #15803d; margin: 8px 0 14px;">Your gate team will enter this PIN on the check-in scanner to verify tickets and admit attendees.</p>
          <div>
            <a href="${scannerUrl}" style="background-color: #16a34a; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: bold; display: inline-block;">
              Open Gate Scanner &rarr;
            </a>
          </div>
        </div>
    ` : '';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff;">
        <h2 style="color: #15803d; margin-top: 0;">Your Listing is Approved! 🎉</h2>
        <p>Hi ${submitterName},</p>
        <p>Great news! Your listing <strong>${listingTitle}</strong> has been reviewed and approved by our team.</p>
        <p>It is now live on our city discovery platform for attendees to discover and purchase tickets.</p>
        ${pinSectionHtml}
        <div style="margin: 25px 0;">
          <a href="${publicUrl}" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            View Your Live Listing
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">Citybuzz &bull; Abeokuta City Discovery & Events</p>
      </div>
    `;
    return this.sendEmail({ to: toEmail, subject, html });
  }

  /**
   * Sent to the organizer when their 6-digit gate check-in PIN is regenerated and saved
   */
  static async sendGatePinUpdatedEmail(
    toEmail: string,
    submitterName: string,
    listingTitle: string,
    listingId: string,
    newCheckInPin: string
  ) {
    const scannerUrl = `${env.FRONTEND_URL}/organizer/check-in?eventId=${listingId}`;
    const publicUrl = `${env.FRONTEND_URL}/listings/${listingId}`;
    const subject = `Updated Gate Check-In PIN for "${listingTitle}" 🔐`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff;">
        <h2 style="color: #0f172a; margin-top: 0;">Gate PIN Updated 🔐</h2>
        <p>Hi ${submitterName},</p>
        <p>The 6-digit gate check-in PIN for your event <strong>${listingTitle}</strong> has been updated and saved.</p>
        <p>Please use the updated PIN below. Any previous check-in PIN for this event is now inactive.</p>

        <div style="background-color: #f0fdf4; border: 2px solid #22c55e; border-radius: 12px; padding: 22px; margin: 24px 0; text-align: center;">
          <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #16a34a; margin: 0 0 8px; font-weight: bold;">🔐 New Gate Check-In PIN</p>
          <p style="font-family: monospace; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #15803d; margin: 0 0 8px;">${newCheckInPin}</p>
          <p style="font-size: 13px; color: #166534; margin: 0; font-weight: 500;">Share this new PIN with your event ushers / gate staff only</p>
          <p style="font-size: 12px; color: #15803d; margin: 8px 0 14px;">They will enter this PIN on the check-in scanner to verify tickets and attendees.</p>
          <div>
            <a href="${scannerUrl}" style="background-color: #16a34a; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: bold; display: inline-block;">
              Open Gate Scanner &rarr;
            </a>
          </div>
        </div>

        <div style="margin: 25px 0;">
          <a href="${publicUrl}" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            View Your Event Listing
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">Citybuzz &bull; Abeokuta City Discovery & Events</p>
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
