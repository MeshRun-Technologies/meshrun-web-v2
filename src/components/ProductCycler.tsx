import { memo, useEffect, useState, type ReactNode } from "react";

/**
 * The CAD identities the landing cycles through.
 *
 * The marks are our own geometric drawings, in the site's own pen and accent —
 * meshrun ships no vendor logo artwork or brand typefaces. The names are used
 * nominatively, to state what meshrun runs.
 */
type CadProduct = { name: string; mark: ReactNode };

/** Dwell per product. Long enough to read, short enough to notice it move. */
const CYCLE_MS = 3000;

const CAD_PRODUCTS: CadProduct[] = [
  {
    name: "AutoCAD",
    mark: (
      <>
        <path d="M12 2v20M2 12h20" />
        <rect x="9" y="9" width="6" height="6" />
      </>
    ),
  },
  {
    name: "Fusion",
    mark: (
      <>
        <path d="M12 2.6 20.4 7.3v9.4L12 21.4 3.6 16.7V7.3Z" />
        <path d="M3.6 7.3 12 12l8.4-4.7M12 12v9.4" />
      </>
    ),
  },
  {
    name: "Revit",
    mark: (
      <>
        <path d="M4.5 21V8.2L12 3l7.5 5.2V21" />
        <path d="M4.5 13.2h15M9.6 21v-4.6h4.8V21" />
      </>
    ),
  },
  {
    name: "Inventor",
    mark: (
      <>
        <circle cx="12" cy="12" r="3.2" />
        <path d="M12 2.4v3.2M12 18.4v3.2M2.4 12h3.2M18.4 12h3.2M5.2 5.2l2.3 2.3M16.5 16.5l2.3 2.3M18.8 5.2l-2.3 2.3M7.5 16.5l-2.3 2.3" />
      </>
    ),
  },
  {
    name: "Civil 3D",
    mark: (
      <>
        <path d="M2.5 8.5c3.4-3.6 6.8 1.8 10.2-.4s6.4-2.4 8.8.4" />
        <path d="M2.5 14c3.4-3.6 6.8 1.8 10.2-.4s6.4-2.4 8.8.4" />
        <path d="M2.5 19.5c3.4-3.6 6.8 1.8 10.2-.4s6.4-2.4 8.8.4" />
      </>
    ),
  },
  {
    name: "3ds Max",
    mark: (
      <>
        <path d="M12 2.8 21 19.4H3Z" />
        <path d="M12 2.8v9.4M3 19.4l9-7.2 9 7.2" />
      </>
    ),
  },
];

const Mark = ({ children }: { children: ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="square"
    strokeLinejoin="miter"
    aria-hidden
    className="h-[0.82em] w-[0.82em] shrink-0 text-accent"
  >
    {children}
  </svg>
);

/**
 * Cycles the product name inside a fixed-width cell. Every name is stacked in
 * the same grid area, so the cell is already as wide as the longest of them
 * and nothing reflows as they swap — only the contents change, rising and
 * sharpening into place.
 */
export const ProductCycler = memo(function ProductCycler() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % CAD_PRODUCTS.length),
      CYCLE_MS,
    );
    return () => window.clearInterval(id);
  }, []);

  const product = CAD_PRODUCTS[index];

  return (
    <>
      <span className="sr-only">
        Run {CAD_PRODUCTS.map((p) => p.name).join(", ")} on anything.
      </span>

      <span
        aria-hidden
        className="inline-grid shrink-0 items-center rounded-sm border border-hairline-strong bg-raised px-[0.5em] py-[0.16em] align-middle text-[0.82em]"
      >
        {/* Holds the cell at the width of the longest name, whatever it is. */}
        {CAD_PRODUCTS.map((p) => (
          <span
            key={p.name}
            className="invisible col-start-1 row-start-1 flex items-center gap-[0.34em] font-display whitespace-nowrap"
          >
            <span className="h-[0.82em] w-[0.82em]" />
            {p.name}
          </span>
        ))}

        <span
          key={index}
          className="pill-in col-start-1 row-start-1 flex items-center justify-center gap-[0.34em] font-display whitespace-nowrap text-ink"
        >
          <Mark>{product.mark}</Mark>
          {product.name}
        </span>
      </span>
    </>
  );
});
