import { contact } from "../content";

/** The company facts the legal pages rest on: change them here and they change everywhere. */
export const company = {
  name: "MeshRun Technologies Inc.",
  /** Where it's incorporated: sets the governing law in the terms. */
  province: "British Columbia",
  /**
   * Where privacy and legal questions go. The privacy officer (PIPEDA, BC
   * PIPA, Québec Law 25) is a role reached at this address, not a named person.
   */
  email: "legal@meshrun.co",
  /** Everything else: support, accessibility feedback. */
  contact,
};

export function Email({ to = company.email }: { to?: string }) {
  return <a href={`mailto:${to}`}>{to}</a>;
}
