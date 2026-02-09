import { assertTransition, canTransition, nextStates } from '../stateMachine';

describe('escrow state machine', () => {
  it('allows valid transition', () => {
    expect(canTransition('AGREEMENT_ACCEPTED', 'FUNDED_HELD')).toBe(true);
    expect(() => assertTransition('AGREEMENT_ACCEPTED', 'FUNDED_HELD')).not.toThrow();
  });

  it('blocks invalid transition', () => {
    expect(canTransition('DRAFT', 'FUNDED_HELD')).toBe(false);
    expect(() => assertTransition('DRAFT', 'FUNDED_HELD')).toThrow('Invalid transition');
  });

  it('exposes terminal states with no transitions', () => {
    expect(nextStates('CLOSED')).toEqual([]);
    expect(nextStates('CANCELLED')).toEqual([]);
  });
});
