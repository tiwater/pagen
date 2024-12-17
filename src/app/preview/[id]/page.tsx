'use client'

import { Suspense, use, useEffect } from 'react'
import { usePageStore } from '@/store/page'
import dynamic from 'next/dynamic'

// Dynamically import the preview component to prevent it from affecting the main bundle
const PreviewComponent = dynamic(
  () => import('./preview-component').then(mod => mod.PreviewComponent),
  {
    ssr: false,
    loading: () => <div className="p-4">Loading preview component...</div>
  }
)

export default function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { page } = usePageStore()

  useEffect(() => {
    // No need to rehydrate here since it's done in providers
    if (!page?.content) {
      console.warn('No page content available in store')
    }
  }, [page])

  return (
    <div className="min-h-screen">
      <Suspense fallback={<div className="p-4">Loading preview...</div>}>
        <PreviewComponent id={id} />
      </Suspense>
    </div>
  )
}
