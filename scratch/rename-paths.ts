import fs from 'fs';
import path from 'path';

const FILES_TO_UPDATE = [
  'src/app/api/cron/route.ts',
  'src/app/api/reports/route.ts',
  'src/app/api/stripe/route.ts',
  'src/app/clean/[propertyId]/CleanerClient.tsx',
  'src/app/dashboard/DashboardClient.tsx',
  'src/app/docs/page.tsx',
  'src/app/login/page.tsx',
  'src/app/login/LoginClient.tsx',
  'src/app/report/[reportId]/page.tsx',
  'src/app/report/[reportId]/ReportClient.tsx',
  'src/app/faq/page.tsx',
  'src/app/features/page.tsx',
  'src/app/page.tsx',
  'src/app/privacy/page.tsx',
  'src/app/terms/page.tsx'
];

function performReplacements(content: string): string {
  let updated = content;

  // 1. Replace API prefix
  updated = updated.replace(/\/api\/airbnb\//g, '/api/');

  // 2. Replace absolute URLs
  updated = updated.replace(/https:\/\/turnproofs\.com\/airbnb\/dashboard/g, 'https://turnproofs.com/dashboard');
  updated = updated.replace(/https:\/\/turnproofs\.com\/airbnb\/report\//g, 'https://turnproofs.com/report/');
  updated = updated.replace(/https:\/\/turnproofs\.com\/airbnb\/clean\//g, 'https://turnproofs.com/clean/');
  updated = updated.replace(/https:\/\/turnproofs\.com\/airbnb/g, 'https://turnproofs.com');

  // 3. Replace relative paths
  updated = updated.replace(/\/airbnb\/clean\//g, '/clean/');
  updated = updated.replace(/\/airbnb\/dashboard/g, '/dashboard');
  updated = updated.replace(/\/airbnb\/docs/g, '/docs');
  updated = updated.replace(/\/airbnb\/login/g, '/login');
  updated = updated.replace(/\/airbnb\/report\//g, '/report/');
  updated = updated.replace(/\/airbnb\/faq/g, '/faq');
  updated = updated.replace(/\/airbnb\/features/g, '/features');

  // 4. Root homepage redirects or references
  updated = updated.replace(/redirect\('\/airbnb'\)/g, "redirect('/')");
  updated = updated.replace(/redirect\("\/airbnb"\)/g, 'redirect("/")');
  updated = updated.replace(/href="\/airbnb"/g, 'href="/"');
  updated = updated.replace(/href='\/airbnb'/g, "href='/'");

  return updated;
}

function run() {
  console.log('Starting URL path renaming script...');
  
  for (const relPath of FILES_TO_UPDATE) {
    const fullPath = path.resolve(relPath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`File not found: ${relPath}`);
      continue;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    const updatedContent = performReplacements(content);
    
    if (content !== updatedContent) {
      fs.writeFileSync(fullPath, updatedContent, 'utf8');
      console.log(`Successfully updated paths in: ${relPath}`);
    } else {
      console.log(`No changes needed in: ${relPath}`);
    }
  }

  console.log('Path renaming completed!');
}

run();
