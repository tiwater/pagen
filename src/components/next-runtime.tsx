'use client'

import { useEffect, useState } from 'react'
import { Button } from './ui/button';

interface NextRuntimeProps {
  files: Array<{ path: string; content: string }>
  chatId: string
}

const NEXT_RUNTIME_URL = '/api/page'

export function NextRuntime({ files, chatId }: NextRuntimeProps) {
  const [runtimeUrl, setRuntimeUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const updatePage = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: files,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        let errorMessage = '';
      
        switch (data.error) {
          case "Invalid TypeScript/React component":
            errorMessage = [
              "TypeScript/React Validation Errors:",
              "",
              ...(Array.isArray(data.details) ? data.details : [data.details]).map((err: string) => `• ${err}`)
            ].join('\n');
            break;
          
          case "Content array is required":
            errorMessage = "No content provided for p`review.";
            break;
            
          case "Invalid file path":
            errorMessage = "Invalid file path. File must be a .tsx file.";
            break;
              
          case "Failed to update page":
            errorMessage = `Failed to update page: ${data.details || 'Unknown error'}`;
            break;
              
          default:
            errorMessage = data.error || 'Failed to update page';
        }
      
        setError(errorMessage);
        return;
      }

      // Use relative URL to ensure same origin
      setRuntimeUrl('/api/page')
    } catch (err) {
      console.error('Failed to update page:', err)
      setError(err instanceof Error ? err.message : 'Failed to update page')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (files) {
      updatePage()
    }
  }, [files, chatId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div>Loading preview...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 space-y-4">
        <div className="flex flex-col items-center space-y-2 max-w-2xl w-full">
          <div className="text-red-500 text-xl font-semibold mb-2">Failed to load preview</div>
          <div className="w-full bg-red-500/10 border border-red-500/20 rounded-lg p-6">
            <pre className="text-red-700 whitespace-pre-wrap break-words text-left text-sm font-mono">
              {error}
            </pre>
            {error.includes("TypeScript/React Validation Errors:") && (
              <div className="mt-4 text-sm text-gray-600">
                <p className="font-medium">Common fixes:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Ensure your component has an 'export default function'</li>
                  <li>Check for proper JSX syntax in the return statement</li>
                  <li>Verify all curly braces are properly matched</li>
                  <li>Make sure variable and function names are valid</li>
                </ul>
              </div>
            )}
          </div>
          {files && (
            <Button
              variant={"outline"}
              onClick={() => {
                setError(null);
                setLoading(true);
                updatePage();
              }}
            >
              Retry Preview
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!runtimeUrl) {
    return (
      <div className="flex items-center justify-center h-full text-yellow-500">
        No preview available
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <iframe
        key={runtimeUrl} // Force iframe reload when URL changes
        src={window.location.origin + runtimeUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        referrerPolicy="same-origin"
        onLoad={(e) => {
          const iframe = e.currentTarget;
          try {
            // Try to access iframe content to check if it loaded successfully
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (!iframeDoc) {
              throw new Error('Could not access iframe content');
            }
            // Check if the page has an error message
            const errorElement = iframeDoc.querySelector('[data-nextjs-error]');
            if (errorElement) {
              const errorMessage = errorElement.textContent || 'Unknown Next.js error';
              setError(`Runtime Error: ${errorMessage}`);
            } else {
              console.log('Runtime frame loaded successfully');
            }
          } catch (err) {
            console.error('Error checking iframe content:', err);
            setError('Failed to load preview content. Please check the console for more details.');
          }
        }}
        onError={(e) => {
          console.error('Failed to load runtime frame:', e);
          setError('Failed to load preview frame. This might be due to network issues or runtime server problems.');
        }}
      />
    </div>
  )
}
