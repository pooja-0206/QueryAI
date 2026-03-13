'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

// Move all your actual page content into this inner component
function AuthCompleteContent() {
  const searchParams = useSearchParams()
  
  // paste your existing page content/logic here
  // anything that uses searchParams goes here
  
  return (
    <div>
      {/* your existing JSX here */}
    </div>
  )
}

// This is the main export — it WRAPS the content in Suspense
export default function AuthCompletePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthCompleteContent />
    </Suspense>
  )
}