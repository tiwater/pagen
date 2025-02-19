'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

// Create a wrapper component to handle the SwaggerUI updates
function SwaggerUIWrapper(props: any) {
  const [key, setKey] = useState(0);

  // Force re-render when props change instead of using componentWillReceiveProps
  useEffect(() => {
    setKey(prev => prev + 1);
  }, [props.url]);

  return <SwaggerUI key={key} {...props} />;
}

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
      <SwaggerUIWrapper
        url="/openapi.yaml"
        docExpansion="full"
        defaultModelsExpandDepth={-1}
        supportedSubmitMethods={['post']}
        displayOperationId={false}
        displayRequestDuration={false}
        persistAuthorization={true}
      />

      <style jsx global>{`
        /* Base styles */
        .swagger-ui {
          font-family: var(--font-sans);
          background: transparent;
        }

        [data-theme='dark'] {
          color-scheme: dark;
        }

        [data-theme='dark'] .swagger-ui {
          --swagger-bg: #1e293b;
          --swagger-border: #334155;
          --swagger-text: #f8fafc;
          --swagger-muted: #94a3b8;
          --swagger-accent: #14b8a6;
          --swagger-code-bg: #0f172a;

          background: transparent;
          color: var(--swagger-text);
        }

        [data-theme='dark'] .swagger-ui * {
          color: var(--swagger-text);
        }

        [data-theme='dark'] .swagger-ui .info > div,
        [data-theme='dark'] .swagger-ui .info p,
        [data-theme='dark'] .swagger-ui .info li,
        [data-theme='dark'] .swagger-ui .opblock .opblock-summary-description,
        [data-theme='dark'] .swagger-ui .opblock .opblock-section-header h4,
        [data-theme='dark'] .swagger-ui .opblock .opblock-section-header > label,
        [data-theme='dark'] .swagger-ui .opblock-description-wrapper p,
        [data-theme='dark'] .swagger-ui .opblock-external-docs-wrapper p,
        [data-theme='dark'] .swagger-ui .opblock-title_normal p,
        [data-theme='dark'] .swagger-ui .opblock-summary-path,
        [data-theme='dark'] .swagger-ui .opblock-summary-description,
        [data-theme='dark'] .swagger-ui .parameter__name,
        [data-theme='dark'] .swagger-ui table thead tr td,
        [data-theme='dark'] .swagger-ui table thead tr th,
        [data-theme='dark'] .swagger-ui .response-col_status,
        [data-theme='dark'] .swagger-ui .response-col_description,
        [data-theme='dark'] .swagger-ui .response-col_description *,
        [data-theme='dark'] .swagger-ui .servers-title,
        [data-theme='dark'] .swagger-ui .servers > label,
        [data-theme='dark'] .swagger-ui .opblock-tag {
          color: var(--swagger-text) !important;
        }

        [data-theme='dark'] .swagger-ui .parameter__type,
        [data-theme='dark'] .swagger-ui .parameter__deprecated,
        [data-theme='dark'] .swagger-ui .opblock-tag small {
          color: var(--swagger-muted) !important;
        }

        [data-theme='dark'] .swagger-ui .opblock {
          background: var(--swagger-bg);
          border: 1px solid var(--swagger-border);
        }

        [data-theme='dark'] .swagger-ui .opblock.opblock-post {
          background: rgba(var(--swagger-accent), 0.1);
          border-color: var(--swagger-accent);
        }

        [data-theme='dark'] .swagger-ui .opblock.opblock-post .opblock-summary {
          border-color: var(--swagger-accent);
        }

        [data-theme='dark'] .swagger-ui .opblock.opblock-post .opblock-summary-method {
          background: var(--swagger-accent);
        }

        [data-theme='dark'] .swagger-ui .responses-inner {
          background: var(--swagger-bg) !important;
        }

        [data-theme='dark'] .swagger-ui select,
        [data-theme='dark'] .swagger-ui .servers > label select {
          background: var(--swagger-bg);
          border: 1px solid var(--swagger-border);
          color: var(--swagger-text);
        }

        [data-theme='dark'] .swagger-ui .btn {
          background: var(--swagger-bg);
          border: 1px solid var(--swagger-border);
          color: var(--swagger-text);
        }

        [data-theme='dark'] .swagger-ui .btn.execute {
          background: var(--swagger-accent);
          border: none;
          color: var(--swagger-text);
        }

        [data-theme='dark'] .swagger-ui .btn.execute:hover {
          background: color-mix(in srgb, var(--swagger-accent) 90%, black);
        }

        [data-theme='dark'] .swagger-ui .highlight-code {
          background: var(--swagger-code-bg) !important;
        }

        [data-theme='dark'] .swagger-ui .highlight-code * {
          color: var(--swagger-text) !important;
        }

        /* Hide unnecessary elements */
        .swagger-ui .information-container .info__contact,
        .swagger-ui .information-container .info__termsOfService,
        .swagger-ui .information-container .info__version,
        .swagger-ui .information-container .info__license,
        .swagger-ui .information-container .info__tos {
          display: none !important;
        }

        /* Models */
        .swagger-ui section.models {
          display: none !important;
        }

        /* Loading state */
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
