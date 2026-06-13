/**
 * Shim minimo di cheerio per mjml-browser.
 *
 * mjml-browser è la build browser di MJML: non usa cheerio internamente,
 * ma il suo wrapper UMD lo riceve come parametro. Questo modulo soddisfa
 * il require() che Vite incontra a bundle-time senza portare cheerio
 * (Node.js) nel bundle del browser.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cheerio: any = {};
export default cheerio;
export const load = () => ({});
