'use client';

import { useEffect, useState } from 'react';
import { getPreview } from '../../store';
import React from 'react';

export default function PreviewPage({ params }: { params: { id: string } }) {
  const [error, setError] = useState<string | null>(null);
  const [Component, setComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    try {
      const code = getPreview(params.id);
      if (!code) {
        setError('Preview not found');
        return;
      }

      // Create a new Function from the code string
      const ComponentFunction = new Function('React', `return ${code}`)
      const PreviewComponent = ComponentFunction(React);
      setComponent(() => PreviewComponent);
    } catch (error) {
      console.error('Error rendering preview:', error);
      setError('Error rendering preview');
    }
  }, [params.id]);

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!Component) {
    return <div className="p-4">Loading...</div>;
  }

  return <Component />;
}
