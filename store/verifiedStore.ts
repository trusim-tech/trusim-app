/**
 * Simple in-memory store to track whether the user has already completed
 * the verification flow. If true, the scanner skips the checking animation
 * and navigates directly to the confirmed screen.
 */

let _verified = false;
let _startTime: number | null = null;

export function isVerified(): boolean {
  return _verified;
}

export function setVerified(value: boolean): void {
  _verified = value;
  if (value && _startTime === null) {
    _startTime = Date.now();
  }
  if (!value) {
    _startTime = null;
  }
}

/** Returns the timestamp (ms) when verification was first confirmed. */
export function getStartTime(): number {
  return _startTime ?? Date.now();
}
