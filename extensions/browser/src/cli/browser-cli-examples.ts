/**
 * Help examples shown by the Browser CLI root command.
 */
/** Core Browser CLI examples for lifecycle and inspection commands. */
export const browserCoreExamples = [
  "nodoassist browser status",
  "nodoassist browser start",
  "nodoassist browser start --headless",
  "nodoassist browser stop",
  "nodoassist browser tabs",
  "nodoassist browser open https://example.com",
  "nodoassist browser focus abcd1234",
  "nodoassist browser close abcd1234",
  "nodoassist browser screenshot",
  "nodoassist browser screenshot --full-page",
  "nodoassist browser screenshot --ref 12",
  "nodoassist browser snapshot",
  "nodoassist browser snapshot --format aria --limit 200",
  "nodoassist browser snapshot --efficient",
  "nodoassist browser snapshot --labels",
];

/** Browser CLI examples for interaction/action commands. */
export const browserActionExamples = [
  "nodoassist browser navigate https://example.com",
  "nodoassist browser resize 1280 720",
  "nodoassist browser click 12 --double",
  "nodoassist browser click-coords 120 340",
  'nodoassist browser type 23 "hello" --submit',
  "nodoassist browser press Enter",
  "nodoassist browser hover 44",
  "nodoassist browser drag 10 11",
  "nodoassist browser select 9 OptionA OptionB",
  "nodoassist browser upload /tmp/nodoassist/uploads/file.pdf",
  "nodoassist browser upload media://inbound/file.pdf",
  'nodoassist browser fill --fields \'[{"ref":"1","value":"Ada"}]\'',
  "nodoassist browser dialog --accept",
  'nodoassist browser wait --text "Done"',
  "nodoassist browser evaluate --fn '(el) => el.textContent' --ref 7",
  "nodoassist browser evaluate --fn 'const title = document.title; return title;'",
  "nodoassist browser console --level error",
  "nodoassist browser pdf",
];
