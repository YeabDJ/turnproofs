'use strict';

export const dynamic = 'force-dynamic';

import ReportClient from './ReportClient';

interface PageProps {
  params: Promise<{ reportId: string }>;
}

export default async function ReportPage({ params }: PageProps) {
  const { reportId } = await params;
  return <ReportClient reportId={reportId} />;
}
