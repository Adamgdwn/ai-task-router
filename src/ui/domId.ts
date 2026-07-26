/**
 * Turns a human heading into an id that `aria-labelledby` can point at.
 *
 * Three screens each kept their own copy. They agreed, but a fourth copy would eventually not, and a
 * silently mismatched id breaks the accessible name of a section without breaking anything visible.
 */
export function domIdFor(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
