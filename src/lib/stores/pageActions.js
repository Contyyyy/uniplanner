import { writable } from 'svelte/store';

/**
 * @typedef {Object} PageAction
 * @property {string} label
 * @property {function(): void} onClick
 * @property {string} [icon] - SVG path data
 * @property {string} [variant] - 'primary' | 'secondary'
 */

/** @type {import('svelte/store').Writable<PageAction[]>} */
export const pageActions = writable([]);
