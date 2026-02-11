export interface FeeInput {
    amountCents: number;
    percentBps: number;
    fixedFeeCents: number;
}
export interface FeeOutput {
    grossAmountCents: number;
    feeCents: number;
    netPayoutCents: number;
}
export declare function calculateFee(input: FeeInput): FeeOutput;
