import { Route, Tags, Post, Get, Body, Path, Query, Header, Request, Controller } from "tsoa";
import express from "express";
import { TicketPaymentService, InitializeTicketOrderDto, CheckInRequestDto } from "../../services/ticketPayment.service";
import { paystackProvider } from "../../services/payment/PaystackProvider";

@Route("api/tickets/payment")
@Tags("Ticket Payments")
export class TicketPaymentController extends Controller {
    /**
     * Initialize a ticket purchase and get checkout URL
     */
    @Post("initialize")
    public async initializeOrder(@Body() body: InitializeTicketOrderDto) {
        const result = await TicketPaymentService.initializeOrder(body);
        return { success: true, data: result };
    }

    /**
     * Frontend callback verification (instant redirect verification)
     */
    @Get("verify/{reference}")
    public async verifyOrder(@Path() reference: string) {
        const result = await TicketPaymentService.verifyAndFulfill(reference);
        if (!result.isSuccess) {
            this.setStatus(400);
        }
        return result;
    }

    /**
     * Secure Paystack Webhook Receiver
     */
    @Post("webhook/paystack")
    public async handleWebhook(
        @Body() body: any,
        @Header("x-paystack-signature") signature?: string,
        @Request() req?: express.Request
    ) {
        const rawBody = JSON.stringify(body);
        const isValid = paystackProvider.verifyWebhookSignature(signature, rawBody);

        if (!isValid && paystackProvider.isConfigured()) {
            this.setStatus(401);
            return { success: false, message: "Invalid signature" };
        }

        if (body.event === "charge.success") {
            const reference = body.data?.reference;
            if (reference) {
                await TicketPaymentService.verifyAndFulfill(reference);
            }
        }

        return { success: true };
    }

    /**
     * Gate Scanner Check-in Endpoint
     */
    @Post("check-in")
    public async checkInTicket(@Body() body: CheckInRequestDto) {
        const result = await TicketPaymentService.checkInTicket(body);

        if (result.status === "INVALID") {
            this.setStatus(404);
        } else if (
            result.status === "ALREADY_USED" ||
            result.status === "WRONG_EVENT" ||
            result.status === "INVALID_PIN"
        ) {
            this.setStatus(400);
        }

        return result;
    }

    /**
     * Get list of supported settlement banks in Nigeria
     */
    @Get("payouts/banks")
    public async getBanks() {
        const banks = await paystackProvider.getBanks();
        return { success: true, data: banks };
    }

    /**
     * Resolve and verify Nigerian bank account holder name
     */
    @Get("payouts/resolve-account")
    public async resolveAccount(@Query() accountNumber: string, @Query() bankCode: string) {
        try {
            const accountName = await paystackProvider.resolveAccountNumber(accountNumber, bankCode);
            return { success: true, data: { accountName } };
        } catch (error: any) {
            this.setStatus(400);
            return { success: false, message: error?.message || 'Failed to resolve bank account' };
        }
    }

    /**
     * Create Paystack Subaccount for an organizer
     */
    @Post("payouts/subaccount")
    public async createSubaccount(@Body() body: { businessName: string; bankCode: string; accountNumber: string }) {
        const subaccountCode = await paystackProvider.createSubaccount(body.businessName, body.bankCode, body.accountNumber);
        return { success: true, data: { subaccountCode } };
    }

    /**
     * Resend an individual ticket email pass (allows updating recipient email if a typo occurred)
     */
    @Post("resend")
    public async resendTicket(@Body() body: { ticketCode: string; newEmail?: string }) {
        const result = await TicketPaymentService.resendTicket(body.ticketCode, body.newEmail);
        return { success: true, data: result };
    }
}

@Route("api/tickets")
@Tags("Ticket Payments")
export class TicketsCheckInController extends Controller {
    /**
     * Gate Scanner Check-in Endpoint (Alias Route)
     */
    @Post("check-in")
    public async checkInTicket(@Body() body: CheckInRequestDto) {
        const result = await TicketPaymentService.checkInTicket(body);

        if (result.status === "INVALID") {
            this.setStatus(404);
        } else if (
            result.status === "ALREADY_USED" ||
            result.status === "WRONG_EVENT" ||
            result.status === "INVALID_PIN"
        ) {
            this.setStatus(400);
        }

        return result;
    }
}

