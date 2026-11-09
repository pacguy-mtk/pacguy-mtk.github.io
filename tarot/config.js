/**
 * Tarot Divination — Site Configuration
 * -----------------------------------------------------------------------
 * The only file you need to edit to change the Oracle's model, the daily
 * token allowance, the house (owner) API access, or to remove the debug menu.
 * Loaded FIRST (before every other script).
 */
window.TAROT_CONFIG = Object.freeze({

  // --- Oracle model ------------------------------------------------------
  // Same model is used for visitors' own keys and for the house Oracle.
  MODEL: 'gemini-3.5-flash-lite',
  API_BASE: 'https://generativelanguage.googleapis.com/v1beta',
  MAX_OUTPUT_TOKENS: 700,          // thinking + answer budget for one reading

  // --- Daily tokens (house Oracle only) ----------------------------------
  // One reading (3 cards + the Oracle's narration) costs 1 token.
  // Visitors who paste their own Google key are never limited.
  DAILY_TOKENS: 3,
  // Tokens refill at local midnight in this UTC offset (8 = Malaysia / UTC+8).
  RESET_UTC_OFFSET_HOURS: 8,

  // --- House Oracle (YOUR key, used when a visitor presses "Skip") -------
  // Option A (recommended for a public site): deploy owner-proxy/worker.js
  //   and put its URL here. Your key then lives on the server, and the
  //   3-a-day limit is enforced there, not just in the visitor's browser.
  OWNER_PROXY_URL: '',
  // Option B (testing only): paste your key here. Anyone who opens
  //   "View source" can read and copy it, and can bypass the 3/3 counter.
  OWNER_API_KEY: '',

  // --- The Seeker's question (asked once, after the first card is turned) -
  // Every question is routed into one of these lenses. Rename, reword or swap
  // one freely: `label`/`hint` are shown to the player, `lens` tells the Oracle
  // how to read through it. Keep exactly 3 for the layout.
  QUESTION_MAX_CHARS: 200,
  QUESTION_CATEGORIES: [
    { id: 'love', icon: '♥', label: 'Love & Connection',
      hint: 'Relationships, loneliness, belonging — with a person, or with anything that keeps you from feeling alone.',
      lens: 'companionship and belonging: romantic love, family, friendship, a pet, or a cherished passion or object; the need not to be alone, attachment, trust, distance and closeness' },
    { id: 'path', icon: '◈', label: 'Work, Money & Purpose',
      hint: 'Your job, income and place in the world — whether you are employed, struggling or comfortable.',
      lens: 'the Seeker\'s role in the world: work or the lack of it, money and security (rich, poor or in between), effort and reward, ambition, calling, and what makes their days feel worthwhile' },
    { id: 'self', icon: '☾', label: 'Self & Inner Growth',
      hint: 'Mood, habits, identity, meaning — who you are and who you are becoming.',
      lens: 'the inner life: identity, emotional state, habits, fears, healing, meaning, and the next step of personal growth' }
  ],

  // --- Reading language --------------------------------------------------
  // The player picks one in the question pop-up (remembered in their browser).
  // `name` is what the Oracle is told. `disabled: true` shows a greyed "coming soon" line.
  // The first entry is the default. (Basic no-AI readings stay English.)
  LANGUAGES: [
    { id: 'en',      label: 'English',               name: 'English' },
    { id: 'zh-Hans', label: '中文（简体）',             name: 'Simplified Chinese (简体中文)' },
    { id: 'ms',      label: 'Bahasa Malaysia',       name: 'Malay (Bahasa Malaysia)' },
    { id: 'soon',    label: 'More languages — coming soon', name: null, disabled: true }
  ],

  // --- Revelation text ---------------------------------------------------
  // Speed of the full-screen revelation as a fraction of normal typing speed (1 = same as the side dialogue).
  REVEAL_SPEED: 0.7,

  // --- Debug menu --------------------------------------------------------
  // To remove the debug menu later: delete the <script src="debug-menu.js">
  // line in index.html (and the file). Or just set this to false.
  DEBUG_MENU: true
});
