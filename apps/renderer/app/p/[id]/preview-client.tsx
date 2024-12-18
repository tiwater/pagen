'use client';

import React from 'react';

export function PreviewClient({ code }: { code: string }) {
  const [error, setError] = React.useState<string | null>(null);
  const [Component, setComponent] = React.useState<React.ComponentType | null>(null);

  React.useEffect(() => {
    try {
      // Create a new Function from the code string
      const ComponentFunction = new Function('React', `return ${code}`);
      const PreviewComponent = ComponentFunction(React);
      setComponent(() => PreviewComponent);
    } catch (error) {
      console.error('Error rendering preview:', error);
      setError('Error rendering preview');
    }
  }, [code]);

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!Component) {
    return <div className="p-4">Loading...</div>;
  }

  return <Component />;
}
