'use strict';

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import CleanerClient from './CleanerClient';

interface PageProps {
  params: Promise<{ propertyId: string }>;
}

export default async function CleanerPage({ params }: PageProps) {
  const { propertyId } = await params;
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center">
        <span className="text-neutral-400 font-medium">Loading Cleaner Terminal...</span>
      </div>
    }>
      <CleanerClient propertyId={propertyId} />
    </Suspense>
  );
}
