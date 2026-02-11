"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_FEATURE_FLAGS = void 0;
exports.isPhase2Enabled = isPhase2Enabled;
exports.DEFAULT_FEATURE_FLAGS = {
    stripeConnectEnabled: false,
    milestonePaymentsEnabled: false,
    changeOrdersEnabled: false,
    credentialVerificationEnabled: false,
    schedulingEnabled: false,
    recommendationsEnabled: false,
    growthEnabled: false,
    updatedAt: new Date(0).toISOString(),
    updatedBy: 'system',
};
function isPhase2Enabled(flags) {
    return (flags.stripeConnectEnabled ||
        flags.milestonePaymentsEnabled ||
        flags.changeOrdersEnabled ||
        flags.credentialVerificationEnabled ||
        flags.schedulingEnabled ||
        flags.recommendationsEnabled ||
        flags.growthEnabled);
}
