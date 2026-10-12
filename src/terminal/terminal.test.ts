import { describe, expect, it } from 'vitest';
import { parse } from './parser';
import { levenshtein, suggest } from './suggest';

describe('parse', () => {
  it('splits a command and its arguments', () => {
    expect(parse('cd helpdesk-api')).toEqual({ name: 'cd', args: ['helpdesk-api'] });
  });

  it('keeps quoted text as one argument', () => {
    expect(parse('ask "what is your stack"')).toEqual({ name: 'ask', args: ['what is your stack'] });
  });

  it('lowercases the command name and handles empty input', () => {
    expect(parse('  HELP  ')).toEqual({ name: 'help', args: [] });
    expect(parse('')).toEqual({ name: '', args: [] });
  });
});

describe('suggest', () => {
  it('suggests the closest command for a typo', () => {
    expect(suggest('skils', ['skills', 'help', 'about'])).toBe('skills');
  });

  it('returns null when nothing is close', () => {
    expect(suggest('zzzzzz', ['skills', 'help'])).toBeNull();
  });

  it('computes edit distance', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3);
    expect(levenshtein('abc', 'abc')).toBe(0);
  });
});
