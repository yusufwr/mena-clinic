/** Clinic calendar date is independent of the browser or server time zone. */
export function clinicDate(date = new Date()): string {
  return date.toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
}
