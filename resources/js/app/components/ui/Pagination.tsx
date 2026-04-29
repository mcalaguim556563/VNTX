import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Show item count summary, e.g. "Showing 1–10 of 42" */
  totalItems?: number;
  itemsPerPage?: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  // Build page number list with ellipsis
  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3)             pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  // Item range text
  const from = totalItems && itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : null;
  const to   = totalItems && itemsPerPage ? Math.min(currentPage * itemsPerPage, totalItems) : null;

  const btnBase: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '34px',
    height: '34px',
    padding: '0 10px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 500,
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    border: '1px solid #1E3A5C',
    background: 'transparent',
    color: '#64748B',
    whiteSpace: 'nowrap',
  };

  const activeStyle: React.CSSProperties = {
    ...btnBase,
    background: 'rgba(0,200,248,0.12)',
    borderColor: 'rgba(0,200,248,0.35)',
    color: '#00C8F8',
    fontWeight: 600,
    cursor: 'default',
  };

  const disabledStyle: React.CSSProperties = {
    ...btnBase,
    opacity: 0.3,
    cursor: 'not-allowed',
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        padding: '14px 20px',
        borderTop: '1px solid #1E3A5C',
      }}
    >
      {/* Item count */}
      <span style={{ fontSize: '11px', color: '#475569', fontWeight: 400 }}>
        {from && to && totalItems
          ? `Showing ${from}–${to} of ${totalItems}`
          : `Page ${currentPage} of ${totalPages}`}
      </span>

      {/* Page buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={currentPage === 1 ? disabledStyle : btnBase}
          onMouseEnter={e => { if (currentPage !== 1) { e.currentTarget.style.borderColor = '#00C8F8'; e.currentTarget.style.color = '#00C8F8'; } }}
          onMouseLeave={e => { if (currentPage !== 1) { e.currentTarget.style.borderColor = '#1E3A5C'; e.currentTarget.style.color = '#64748B'; } }}
        >
          <ChevronLeft size={14} />
        </button>

        {/* Page numbers */}
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} style={{ ...btnBase, cursor: 'default', border: 'none', color: '#2A4E7A' }}>
              ···
            </span>
          ) : (
            <button
              key={p}
              onClick={() => p !== currentPage && onPageChange(p as number)}
              style={p === currentPage ? activeStyle : btnBase}
              onMouseEnter={e => { if (p !== currentPage) { e.currentTarget.style.borderColor = '#00C8F8'; e.currentTarget.style.color = '#00C8F8'; } }}
              onMouseLeave={e => { if (p !== currentPage) { e.currentTarget.style.borderColor = '#1E3A5C'; e.currentTarget.style.color = '#64748B'; } }}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={currentPage === totalPages ? disabledStyle : btnBase}
          onMouseEnter={e => { if (currentPage !== totalPages) { e.currentTarget.style.borderColor = '#00C8F8'; e.currentTarget.style.color = '#00C8F8'; } }}
          onMouseLeave={e => { if (currentPage !== totalPages) { e.currentTarget.style.borderColor = '#1E3A5C'; e.currentTarget.style.color = '#64748B'; } }}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

// ── usePagination hook ────────────────────────────────────────────────────────
// Makes paginating any array trivial: const { page, paginated, ... } = usePagination(items, 10)
export function usePagination<T>(items: T[], perPage = 10) {
  const [currentPage, setCurrentPage] = React.useState(1);

  // Reset to page 1 whenever items length changes (e.g. after search/filter)
  React.useEffect(() => { setCurrentPage(1); }, [items.length]);

  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const safePage   = Math.min(currentPage, totalPages);

  const paginated = items.slice((safePage - 1) * perPage, safePage * perPage);

  return {
    currentPage: safePage,
    totalPages,
    totalItems: items.length,
    itemsPerPage: perPage,
    paginated,
    setPage: setCurrentPage,
  };
}
