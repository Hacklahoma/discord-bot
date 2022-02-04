import { object } from 'badwords-list';

/**
 * Leet speek alternatives to letters.
 */
 const leetLetters = {
  a: "4@Д",
  e: "3£€ë",
  i: "1!|",
  o: "0Ø",
  u: "vµบ",
}

/**
 * Words that will be flagged in discord channel
 */
const flagWords: string[] = [ ...object, 'wtf', 'lmfao' ];

/**
 * Words that will be immediately removed
 */
const explicitWords: string[] = [
  'anal',
  'anus',
  'arse',
  'ass',
  'ballsack',
  'balls',
  'bastard',
  'bitch',
  'biatch',
  'blowjob',
  'blow job',
  'bollock',
  'bollok',
  'boner',
  'boob',
  'butt',
  'buttplug',
  'clitoris',
  'cock',
  'coon',
  'cunt',
  'dick',
  'dildo',
  'dyke',
  'fag',
  'feck',
  'fellate',
  'fellatio',
  'felching',
  'fuck',
  'f u c k',
  'flange',
  'Goddamn',
  'God damn',
  'homo',
  'jizz',
  'knobend',
  'knob end',
  'labia',
  'nigger',
  'nigga',
  'penis',
  'piss',
  'prick',
  'pube',
  'pussy',
  'queer',
  'scrotum',
  'sex',
  'shit',
  'sh1t',
  'slut',
  'smegma',
  'spunk',
  'tit',
  'turd',
  'twat',
  'vagina',
  'wank',
  'whore',
];

/**
 * RegExp for flagged words
 */
export const flag = new RegExp("", "ig");

/**
 * RegExp for explicit words
 */
export const explicit = new RegExp("", "ig");