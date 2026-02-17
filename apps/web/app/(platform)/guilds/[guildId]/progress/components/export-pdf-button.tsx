'use client';

import React, { useCallback } from 'react';
import { Button, Icon } from '@hool/design-system';

interface ExportPdfButtonProps {
  characterName?: string;
  guildName?: string;
}

export function ExportPdfButton({ characterName, guildName }: ExportPdfButtonProps) {
  const handleExport = useCallback(() => {
    // Create a print-specific style sheet
    const printStyles = document.createElement('style');
    printStyles.id = 'progress-print-styles';
    printStyles.textContent = `
      @media print {
        /* Hide navigation, sidebars, and non-essential UI */
        nav, header, aside, footer,
        [data-no-print],
        button:not([data-print-include]) {
          display: none !important;
        }

        /* Reset background for printing */
        body {
          background: white !important;
          color: black !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        /* Make progress content full width */
        [data-print-area] {
          width: 100% !important;
          max-width: none !important;
          padding: 20px !important;
          margin: 0 !important;
        }

        /* Ensure progress bars show colors */
        [class*="ProgressBar"],
        [class*="progressBar"],
        [class*="barFill"] {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        /* Add print header */
        [data-print-area]::before {
          content: '${guildName ? `${guildName} - ` : ''}${characterName ? `${characterName} - ` : ''}Progress Report';
          display: block;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #333;
        }

        /* Page settings */
        @page {
          size: A4 portrait;
          margin: 20mm;
        }
      }
    `;

    document.head.appendChild(printStyles);

    // Trigger print
    window.print();

    // Cleanup after print dialog closes
    const cleanup = () => {
      const styleEl = document.getElementById('progress-print-styles');
      if (styleEl) {
        styleEl.remove();
      }
      window.removeEventListener('afterprint', cleanup);
    };

    window.addEventListener('afterprint', cleanup);

    // Fallback cleanup after timeout
    setTimeout(cleanup, 60000);
  }, [characterName, guildName]);

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleExport}
      icon={<Icon name="arrow-down" size={14} />}
      data-no-print
    >
      Export PDF
    </Button>
  );
}
