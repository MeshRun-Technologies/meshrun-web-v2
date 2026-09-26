// Structure: one content column with rails; every section ends on a rule that
// bleeds past the column and crosses the rails at two registration marks.
// Rails and marks are hidden on phones, where the gutter is the edge.
export const column = "mx-auto max-w-6xl px-5 sm:px-10 sm:rails";

export function Crosses({ all = false }: { all?: boolean }) {
  return (
    <>
      {all && (
        <>
          <span aria-hidden className="cross -top-1 -left-1 hidden sm:block" />
          <span aria-hidden className="cross -top-1 -right-1 hidden sm:block" />
        </>
      )}
      <span aria-hidden className="cross -bottom-1 -left-1 hidden sm:block" />
      <span aria-hidden className="cross -right-1 -bottom-1 hidden sm:block" />
    </>
  );
}
