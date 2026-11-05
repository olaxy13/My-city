import axios, { AxiosInstance } from "axios";
import crypto from "crypto";

export interface InitializePaystackParams {
    email: string;
    amountInNaira: number;
    reference: string;
    callbackUrl?: string;
    subaccountCode?: string;            // Friend's Subaccount Code
    platformCommissionInNaira?: number; // Citybuzz Commission
    metadata?: Record<string, unknown>;
}

export interface InitializePaystackResult {
    authorizationUrl: string;
    accessCode: string;
    reference: string;
}

export interface VerifyPaystackResult {
    reference: string;
    status: "success" | "failed" | "abandoned";
    amountInNaira: number;
    paidAt?: Date;
    metadata?: Record<string, unknown>;
    rawResponse: Record<string, unknown>;
}

export class PaystackProvider {
    private httpClient: AxiosInstance;
    private secretKey: string;

    constructor() {
        this.secretKey = process.env.PAYSTACK_SECRET_KEY || "";
        this.httpClient = axios.create({
            baseURL: "https://api.paystack.co",
            headers: {
                Authorization: `Bearer ${this.secretKey}`,
                "Content-Type": "application/json",
            },
            timeout: 10000,
        });
    }

    public isConfigured(): boolean {
        return Boolean(this.secretKey && !this.secretKey.includes("placeholder") && this.secretKey.startsWith("sk_"));
    }
    public async getBanks(): Promise<{ name: string; code: string }[]> {
        const response = await this.httpClient.get("/bank?country=nigeria");
        return response.data?.data.map((b: any) => ({ name: b.name, code: b.code })) || [];
    }
    public async resolveAccountNumber(accountNumber: string, bankCode: string): Promise<string> {
        try {
            const response = await this.httpClient.get(
                `/bank/resolve?account_number=${encodeURIComponent(accountNumber)}&bank_code=${encodeURIComponent(bankCode)}`
            );
            return response.data?.data?.account_name; // Returns the verified account holder name
        } catch (error: any) {
            const paystackMessage = error?.response?.data?.message;
            const statusCode = error?.response?.status;

            // In Paystack Test Mode (sk_test_...), Paystack strictly caps live account resolves to 3/day.
            // When that limit is reached during local testing, fall back to a mock account name
            // so testing is never blocked.
            if (
                this.secretKey.startsWith("sk_test_") &&
                (statusCode === 429 || paystackMessage?.toLowerCase().includes("daily limit"))
            ) {
                console.warn(
                    `[PaystackProvider] Test mode daily limit reached for ${accountNumber}. Returning test mock account name to allow development testing.`
                );
                return "TEST ACCOUNT HOLDER";
            }

            if (statusCode === 429) {
                throw new Error(paystackMessage || 'Bank account resolve rate limit exceeded. Please try again tomorrow or use test bank codes.');
            }
            throw new Error(paystackMessage || error?.message || 'Failed to resolve bank account');
        }
    }
    public async createSubaccount(name: string, bankCode: string, accountNumber: string): Promise<string> {
        const response = await this.httpClient.post("/subaccount", {
            business_name: name,
            settlement_bank: bankCode,
            account_number: accountNumber,
            percentage_charge: 0, // Allows dynamic split per transaction
        });
        return response.data?.data?.subaccount_code;
    }


    public async initializePayment(params: InitializePaystackParams): Promise<InitializePaystackResult> {
        if (!this.isConfigured()) {
            return {
                authorizationUrl: `https://checkout.paystack.com/mock-demo-${params.reference}`,
                accessCode: `pstk_mock_${params.reference}`,
                reference: params.reference,
            };
        }

        const amountInKobo = Math.round(params.amountInNaira * 100);
        const commissionInKobo = Math.round((params.platformCommissionInNaira || 0) * 100);

        const payload: Record<string, unknown> = {
            email: params.email,
            amount: amountInKobo,
            reference: params.reference,
            callback_url: params.callbackUrl,
            metadata: params.metadata ?? {},
        };

        // CITYBUZZ SPLIT PAYMENT LOGIC
        if (params.subaccountCode) {
            payload.subaccount = params.subaccountCode;
            if (commissionInKobo > 0) {
                payload.transaction_charge = commissionInKobo; // Platform fee retained by Citybuzz
            }
            payload.bearer = "subaccount"; // Organizer pays gateway fees
        }

        const response = await this.httpClient.post("/transaction/initialize", payload);

        if (!response.data?.status || !response.data?.data) {
            throw new Error(`Paystack Init Error: ${response.data?.message || "Unknown error"}`);
        }

        return {
            authorizationUrl: response.data.data.authorization_url,
            accessCode: response.data.data.access_code,
            reference: response.data.data.reference,
        };
    }

    public async verifyPayment(reference: string): Promise<VerifyPaystackResult> {
        if (!this.isConfigured()) {
            return {
                reference,
                status: "success",
                amountInNaira: 5000,
                paidAt: new Date(),
                rawResponse: { mock: true },
            };
        }

        try {
            const response = await this.httpClient.get(`/transaction/verify/${encodeURIComponent(reference)}`);
            const data = response.data?.data;

            return {
                reference: data.reference,
                status: data.status === "success" ? "success" : "failed",
                amountInNaira: Number(data.amount) / 100,
                paidAt: data.paid_at ? new Date(data.paid_at) : undefined,
                metadata: data.metadata,
                rawResponse: data,
            };
        } catch (error: any) {
            console.log("Error caught in payment", error)
            return {
                reference,
                status: "failed",
                amountInNaira: 0,
                rawResponse: error.response?.data || { error: error.message },
            };
        }
    }


    public verifyWebhookSignature(signature: string | undefined, rawBody: string): boolean {
        if (!signature || !this.secretKey) return false;
        const hash = crypto.createHmac("sha512", this.secretKey).update(rawBody).digest("hex");
        return hash === signature;
    }
}

export const paystackProvider = new PaystackProvider();
