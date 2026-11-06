import QRCode from "qrcode";
import { EmailService, TicketEmailItem } from "./email.service";
import { prisma } from "../config/prisma";
import crypto from "crypto";
import { paystackProvider } from "./payment/PaystackProvider";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { env } from "../config/env";

import { validateAndNormalizeEmail } from "../utils/emailValidator";

export interface InitializeTicketOrderDto {
    listingId: string;
    tierId: string;
    quantity: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    callbackUrl?: string;
    attendees?: AttendeeDto[];
}

export interface CheckInRequestDto {
    /** The QR token or ticket code scanned from the attendee's phone */
    tokenOrCode: string;
    /** Optional event ID to lock scanning specifically to this event */
    eventId?: string;
    /** Optional gate PIN configured for this event */
    pin?: string;
}

export interface AttendeeDto {
    name: string;
    email?: string;
    phone?: string;
}

export class TicketPaymentService {
    /**
     * 1. Validates ticket availability
     * 2. Validates buyer and attendee email formats & catches typos (e.g. gmil.com)
     * 3. Calculates custom commission (Flat vs Percentage)
     * 4. Creates PENDING order in DB with normalized attendee records
     * 5. Initializes Paystack split checkout
     */
    public static async initializeOrder(dto: InitializeTicketOrderDto) {
        // Validate Buyer Email & Catch domain typos
        const buyerEmail = await validateAndNormalizeEmail(dto.customerEmail, "Buyer email");
        const buyerName = dto.customerName?.trim() || "Valued Customer";
        const buyerPhone = dto.customerPhone?.trim() || "";

        const listing = await prisma.listing.findUnique({
            where: { id: dto.listingId },
            include: { eventDetails: true, ticketTiers: true },
        });

        if (!listing || !listing.eventDetails) {
            throw new NotFoundError("Event listing not found");
        }

        const tier = listing.ticketTiers.find((t) => t.id === dto.tierId);
        if (!tier) throw new NotFoundError("Ticket tier not found");

        if (tier.soldCount + dto.quantity > tier.totalCapacity) {
            throw new BadRequestError("Not enough tickets available for this tier");
        }

        // Smart Attendee Resolution (Handles Buyer + Extra Guests)
        let attendeeList: AttendeeDto[] = [];

        if (dto.quantity === 1) {
            if (dto.attendees && dto.attendees.length > 1) {
                throw new BadRequestError("You cannot provide more than 1 attendee for a single ticket purchase");
            }
            attendeeList =
                dto.attendees && dto.attendees.length === 1
                    ? dto.attendees
                    : [{ name: buyerName, email: buyerEmail, phone: buyerPhone }];
        } else {
            // For 2 or more tickets:
            const providedCount = dto.attendees ? dto.attendees.length : 0;

            if (providedCount === dto.quantity) {
                // Scenario A: Buyer explicitly listed all attendees
                attendeeList = dto.attendees!;
            } else if (providedCount === dto.quantity - 1) {
                // Scenario B: Buyer is Ticket #1, and provided the other (N - 1) guests!
                attendeeList = [
                    { name: buyerName, email: buyerEmail, phone: buyerPhone },
                    ...dto.attendees!,
                ];
            } else {
                throw new BadRequestError(
                    `For ${dto.quantity} tickets, please provide attendee details for all ${dto.quantity} tickets (or ${dto.quantity - 1} extra guests if Ticket #1 is for you)`
                );
            }
        }

        // Validate that every attendee has a valid name and a verified email address (no typos)
        for (let i = 0; i < attendeeList.length; i++) {
            const att = attendeeList[i];
            if (!att?.name?.trim()) {
                throw new BadRequestError(`Full name is required for attendee on ticket #${i + 1}`);
            }
            att.name = att.name.trim();
            att.email = await validateAndNormalizeEmail(
                att.email,
                `Attendee #${i + 1} (${att.name}) email`
            );
            if (att.phone) {
                att.phone = att.phone.trim();
            }
        }

        // 1. Calculate financials in Naira
        const totalAmount = tier.price * dto.quantity;
        let commission = 0;

        if (listing.eventDetails.commissionType === "FLAT_FEE") {
            commission = listing.eventDetails.commissionValue * dto.quantity;
        } else {
            // e.g. 1000 = 10.00%
            commission = Math.round((totalAmount * listing.eventDetails.commissionValue) / 100);
        }
        const organizerAmount = totalAmount - commission;

        // 2. Generate unique order reference
        const reference = `CBZ-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

        // 3. Create Pending Order & Line Item
        const order = await prisma.ticketOrder.create({
            data: {
                reference,
                listingId: listing.id,
                customerName: buyerName,
                customerEmail: buyerEmail,
                customerPhone: buyerPhone,
                attendeeDetails: attendeeList as any,
                totalAmount,
                commission,
                organizerAmount,
                status: "PENDING",
                items: {
                    create: {
                        ticketTierId: tier.id,
                        quantity: dto.quantity,
                        unitPrice: tier.price,
                        subtotal: totalAmount,
                    },
                },
            },
        });
        const safeCallbackUrl = dto.callbackUrl || `${env.FRONTEND_URL}/tickets/confirmation`;

        // 4. Initialize Paystack transaction with Subaccount split
        const paystackResult = await paystackProvider.initializePayment({
            email: dto.customerEmail,
            amountInNaira: totalAmount,
            reference: order.reference,
            callbackUrl: safeCallbackUrl,
            subaccountCode: listing.eventDetails.subaccountCode || undefined,
            platformCommissionInNaira: commission,
            metadata: {
                orderId: order.id,
                listingTitle: listing.title,
            },
        });

        return {
            orderId: order.id,
            reference: order.reference,
            authorizationUrl: paystackResult.authorizationUrl,
        };
    }

    /**
     * Dual Verification & Fulfillment:
     * Called by BOTH the Webhook AND the GET /verify/:reference endpoint
     */
    public static async verifyAndFulfill(reference: string) {
        const order = await prisma.ticketOrder.findUnique({
            where: { reference },
            include: { items: { include: { tier: true } }, listing: { include: { eventDetails: true } } },
        });

        if (!order) throw new Error("Order not found");
        if (order.status === "PAID") {
            const existingTickets = await prisma.ticket.findMany({
                where: { orderId: order.id },
                include: { tier: true },
            });
            const mapped: TicketEmailItem[] = existingTickets.map((t) => ({
                ticketCode: t.ticketCode,
                tierName: t.tier.name,
                attendeeName: t.attendeeName || order.customerName,
                attendeeEmail: t.attendeeEmail || undefined,
                qrDataUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(t.qrToken)}`,
            }));
            return { isSuccess: true, message: "Order already fulfilled", order, tickets: mapped };
        }

        // Verify with Paystack
        const verification = await paystackProvider.verifyPayment(reference);
        if (verification.status !== "success") {
            await prisma.ticketOrder.update({
                where: { id: order.id },
                data: { status: "FAILED" },
            });
            return { isSuccess: false, message: "Payment verification failed" };
        }

        const generatedTickets: TicketEmailItem[] = [];

        // Atomic Fulfillment
        await prisma.$transaction(async (tx) => {
            // 1. Mark Order as PAID
            await tx.ticketOrder.update({
                where: { id: order.id },
                data: { status: "PAID", paidAt: verification.paidAt || new Date() },
            });

            const savedAttendees = (order.attendeeDetails as AttendeeDto[] | null) || [];
            let attendeeIndex = 0;

            // 2. Issue Tickets & Decrement Capacity
            for (const item of order.items) {
                await tx.ticketTier.update({
                    where: { id: item.ticketTierId },
                    data: { soldCount: { increment: item.quantity } },
                });

                for (let i = 0; i < item.quantity; i++) {
                    const ticketCode = `CBZ-TKT-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
                    const qrToken = crypto.randomUUID();

                    // Match each ticket to its specific attendee!
                    const attendee = savedAttendees[attendeeIndex] || {
                        name: order.customerName,
                        email: order.customerEmail,
                        phone: order.customerPhone,
                    };
                    attendeeIndex++;

                    await tx.ticket.create({
                        data: {
                            orderId: order.id,
                            ticketTierId: item.ticketTierId,
                            ticketCode,
                            qrToken,
                            attendeeName: attendee.name,
                            attendeeEmail: attendee.email || null,
                            attendeePhone: attendee.phone || null,
                        },
                    });

                    // Generate Base64 QR code image on the fly!
                    const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrToken)}`;
                    generatedTickets.push({
                        ticketCode,
                        tierName: item.tier.name,
                        attendeeName: attendee.name,
                        attendeeEmail: attendee.email || undefined,
                        qrDataUrl,
                    });
                }
            }
        });

        // 3. Dispatch Emails: Individual Ticket Passes to each attendee & Master Receipt to buyer
        const eventDetails = await prisma.eventDetails.findUnique({
            where: { listingId: order.listingId },
        });

        // A. Send Individual Ticket Pass with unique QR code directly to each attendee's email address
        for (const ticket of generatedTickets) {
            if (ticket.attendeeEmail) {
                EmailService.sendAttendeeTicketEmail({
                    toEmail: ticket.attendeeEmail,
                    attendeeName: ticket.attendeeName,
                    buyerName: order.customerName,
                    eventTitle: order.listing.title,
                    eventDate: eventDetails?.startDateTime || null,
                    eventAddress: order.listing.address || null,
                    ticket,
                }).catch((err) => console.error(`[Attendee Ticket Email Error - ${ticket.attendeeEmail}]:`, err));
            }
        }

        // B. Send Official Order Confirmation Receipt to the Buyer
        EmailService.sendBuyerOrderReceiptEmail({
            toEmail: order.customerEmail,
            buyerName: order.customerName,
            eventTitle: order.listing.title,
            eventDate: eventDetails?.startDateTime || null,
            eventAddress: order.listing.address || null,
            orderReference: order.reference,
            totalAmountInNaira: order.totalAmount,
            tickets: generatedTickets,
        }).catch((err) => console.error(`[Buyer Receipt Email Error - ${order.customerEmail}]:`, err));

        // C. Send Sale Notification to Organizer (if preference is per_sale, which is default)
        if (order.listing.submitterEmail) {
            prisma.organizerSettings.findUnique({
                where: { email: order.listing.submitterEmail },
            }).then((settings) => {
                const preference = settings?.notificationPreference || 'per_sale';
                if (preference === 'per_sale') {
                    return EmailService.sendOrganizerSaleNotificationEmail({
                        organizerEmail: order.listing.submitterEmail,
                        organizerName: order.listing.submitterName,
                        eventTitle: order.listing.title,
                        customerName: order.customerName,
                        ticketsCount: generatedTickets.length,
                        totalAmount: order.totalAmount,
                        commission: order.commission,
                        organizerAmount: order.organizerAmount,
                        reference: order.reference,
                    });
                }
            }).catch((err) => console.error(`[Organizer Sale Notification Email Error - ${order.listing.submitterEmail}]:`, err));
        }

        return { isSuccess: true, message: "Tickets generated and emailed successfully", order, tickets: generatedTickets };
    }

    /**
     * Gate Check-in: Scans QR code token or human-readable ticket code.
     * Prevents reuse, validates event match, verifies Gate PIN, and returns attendee details.
     */
    public static async checkInTicket(dto: CheckInRequestDto | string) {
        const identifier = typeof dto === "string" ? dto : dto.tokenOrCode;
        const eventId = typeof dto === "string" ? undefined : dto.eventId;
        const pin = typeof dto === "string" ? undefined : dto.pin;

        // 1. If eventId and pin are supplied, verify PIN matches
        if (eventId && pin) {
            const event = await prisma.eventDetails.findUnique({
                where: { listingId: eventId },
            });
            if (event && event.checkInPin && event.checkInPin !== pin) {
                return {
                    status: "INVALID_PIN",
                    message: "Invalid Gate PIN for this event.",
                };
            }
        }

        // 2. Allows scanning via QR token OR typing the 8-character ticketCode (e.g. CBZ-TKT-66223A7A)
        const ticket = await prisma.ticket.findFirst({
            where: {
                OR: [{ qrToken: identifier }, { ticketCode: identifier }],
            },
            include: {
                tier: true,
                order: {
                    include: {
                        listing: true,
                    },
                },
            },
        });

        if (!ticket) {
            return {
                status: "INVALID",
                message: "Ticket not found. Invalid QR code.",
            };
        }

        // 3. Strict Event Isolation Check: Prevent checking in tickets for different events!
        if (eventId && ticket.order.listingId !== eventId) {
            return {
                status: "WRONG_EVENT",
                message: "WRONG EVENT: This ticket is not valid for this event.",
                ticketCode: ticket.ticketCode,
            };
        }

        // 4. Check if already used!
        if (ticket.isUsed) {
            return {
                status: "ALREADY_USED",
                message: `This ticket was already checked in on ${ticket.checkedInAt?.toLocaleTimeString()}`,
                ticketCode: ticket.ticketCode,
                attendeeName: ticket.attendeeName || ticket.order.customerName,
                tierName: ticket.tier.name,
                checkedInAt: ticket.checkedInAt,
            };
        }

        // 5. Mark as USED atomically
        const updated = await prisma.ticket.update({
            where: { id: ticket.id },
            data: {
                isUsed: true,
                checkedInAt: new Date(),
            },
        });

        // 6. Return verified attendee details for the usher's screen
        return {
            status: "ADMITTED",
            message: `Check-in successful! Admit ${ticket.attendeeName || ticket.order.customerName}`,
            ticketCode: ticket.ticketCode,
            attendeeName: ticket.attendeeName || ticket.order.customerName,
            attendeeEmail: ticket.attendeeEmail || ticket.order.customerEmail,
            attendeePhone: ticket.attendeePhone || ticket.order.customerPhone,
            tierName: ticket.tier.name,
            eventTitle: ticket.order.listing.title,
            checkedInAt: updated.checkedInAt,
        };
    }

    /**
     * Resend an individual ticket email pass (supports updating email in case of typos)
     */
    public static async resendTicket(ticketCode: string, newEmail?: string) {
        const ticket = await prisma.ticket.findFirst({
            where: { ticketCode },
            include: {
                order: {
                    include: {
                        listing: { include: { eventDetails: true } },
                    },
                },
                tier: true,
            },
        });

        if (!ticket) {
            throw new NotFoundError(`Ticket "${ticketCode}" not found.`);
        }

        let targetEmail = ticket.attendeeEmail || ticket.order.customerEmail;
        if (newEmail) {
            targetEmail = await validateAndNormalizeEmail(newEmail, "New ticket recipient email");
            await prisma.ticket.update({
                where: { id: ticket.id },
                data: { attendeeEmail: targetEmail },
            });
        }

        const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticket.qrToken)}`;
        await EmailService.sendAttendeeTicketEmail({
            toEmail: targetEmail,
            attendeeName: ticket.attendeeName || ticket.order.customerName,
            buyerName: ticket.order.customerName,
            eventTitle: ticket.order.listing.title,
            eventDate: ticket.order.listing.eventDetails?.startDateTime || null,
            eventAddress: ticket.order.listing.address || null,
            ticket: {
                ticketCode: ticket.ticketCode,
                tierName: ticket.tier.name,
                attendeeName: ticket.attendeeName || ticket.order.customerName,
                attendeeEmail: targetEmail,
                qrDataUrl,
            },
        });

        return {
            success: true,
            message: `Ticket pass resent successfully to ${targetEmail}`,
            ticketCode: ticket.ticketCode,
            attendeeName: ticket.attendeeName,
            recipientEmail: targetEmail,
        };
    }
}
