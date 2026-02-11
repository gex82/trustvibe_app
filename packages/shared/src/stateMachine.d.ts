import type { EscrowState } from './types';
export declare function canTransition(from: EscrowState, to: EscrowState): boolean;
export declare function assertTransition(from: EscrowState, to: EscrowState): void;
export declare function nextStates(from: EscrowState): EscrowState[];
