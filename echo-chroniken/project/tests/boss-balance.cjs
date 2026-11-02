// Repeatable 2700-duel balance regression across 9 opponent/ally archetypes and 3 level gaps.
process.env.ECHO_BOSS_TEST='1';
require('../qa/boss-balance.cjs');
