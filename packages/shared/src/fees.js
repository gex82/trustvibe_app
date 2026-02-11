"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateFee = calculateFee;
function calculateFee(input) {
    if (input.amountCents <= 0) {
        throw new Error('amountCents must be positive');
    }
    if (input.percentBps < 0 || input.fixedFeeCents < 0) {
        throw new Error('Fee config values must be non-negative');
    }
    const percentFee = Math.floor((input.amountCents * input.percentBps) / 10000);
    const feeCents = percentFee + input.fixedFeeCents;
    const netPayoutCents = Math.max(0, input.amountCents - feeCents);
    return {
        grossAmountCents: input.amountCents,
        feeCents,
        netPayoutCents,
    };
}
