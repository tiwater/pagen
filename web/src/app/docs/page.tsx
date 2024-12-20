'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

// Dynamically import SwaggerUI to avoid hydration issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-pulse text-muted-foreground">Loading API documentation...</div>
    </div>
  ),
});

export default function DocsPage() {
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-destructive">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <SwaggerUI
        url="/openapi.yaml"
        docExpansion="full"
        defaultModelsExpandDepth={-1}
        supportedSubmitMethods={['post']}
        displayOperationId={false}
        displayRequestDuration={false}
        persistAuthorization={true}
      />

      <style jsx global>{`
        /* Modern styling overrides for Swagger UI */
        .swagger-ui {
          font-family: var(--font-sans);
        }

        /* Hide unnecessary elements */
        .swagger-ui .information-container .info__contact,
        .swagger-ui .information-container .info__termsOfService,
        .swagger-ui .information-container .info__version,
        .swagger-ui .information-container .info__license,
        .swagger-ui .information-container .info__tos {
          display: none !important;
        }

        /* Show server selection */
        .swagger-ui .servers-title,
        .swagger-ui .servers > label {
          display: block !important;
          margin-bottom: 1.5rem;
          color: #64748b;
        }

        .swagger-ui .servers > label select {
          background-color: white;
          display: block !important;
          width: 100%;
          max-width: 340px;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          line-height: 1.25rem;
          color: #1e293b;
        }

        [data-theme="dark"] .swagger-ui .servers > label select {
          background-color: #1e293b;
          border-color: #334155;
          color: #e2e8f0;
        }

        .swagger-ui .servers > label select:focus {
          outline: none;
          border-color: #0091EA;
          ring: 2px;
          ring-color: #0091EA;
        }

        /* Headers */
        .swagger-ui .info .title {
          font-family: var(--font-sans);
          font-size: 2.5rem;
          font-weight: 600;
        }

        .swagger-ui .opblock-tag {
          font-family: var(--font-sans);
          font-size: 1.5rem;
          border: none;
        }

        /* Operation blocks */
        .swagger-ui .opblock {
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
          border: none;
          margin: 0 0 1rem;
        }

        .swagger-ui .opblock .opblock-summary {
          padding: 1rem;
        }

        .swagger-ui .opblock .opblock-summary-method {
          border-radius: 0.25rem;
          min-width: 80px;
        }

        /* Buttons */
        .swagger-ui .btn {
          border-radius: 0.25rem;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        }

        .swagger-ui .btn.execute {
          background-color: #0091EA;
        }

        .swagger-ui .btn.execute:hover {
          background-color: #0277BD;
        }

        /* Inputs */
        .swagger-ui input[type=text],
        .swagger-ui textarea {
          border-radius: 0.25rem;
          border-color: #e2e8f0;
        }

        .swagger-ui input[type=text]:focus,
        .swagger-ui textarea:focus {
          border-color: #0091EA;
          outline: none;
        }

        /* Tables */
        .swagger-ui table tbody tr td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e2e8f0;
        }

        /* Models */
        .swagger-ui section.models {
          display: none !important;
        }

        /* Dark mode support */
        [data-theme="dark"] .swagger-ui,
        [data-theme="dark"] .swagger-ui .markdown p,
        [data-theme="dark"] .swagger-ui .model {
          color: #e2e8f0;
        }

        [data-theme="dark"] .swagger-ui .opblock {
          background-color: #1e293b;
          border-color: #334155;
        }

        [data-theme="dark"] .swagger-ui input[type=text],
        [data-theme="dark"] .swagger-ui textarea {
          background-color: #1e293b;
          border-color: #334155;
          color: #e2e8f0;
        }

        [data-theme="dark"] .swagger-ui .opblock-tag {
          border-color: #334155;
        }

        /* Loading state */
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .5;
          }
        }
      `}</style>
    </div>
  );
}
