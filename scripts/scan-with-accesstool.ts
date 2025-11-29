#!/usr/bin/env tsx
/**
 * Script to scan studentsupport site using accesstool
 * Uses the accesstool API to create scans and query results
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local from accesstool project
const accesstoolEnvPath = resolve('/Users/roshanshah/Projects/accesstool/.env.local');
config({ path: accesstoolEnvPath });

const ACCESSTOOL_BASE_URL = process.env.ACCESSTOOL_URL || 'http://localhost:3001';
// Studentsupport runs on port 3002 (vite auto-selected when 3000 was taken)
const STUDENTSUPPORT_URL = process.env.STUDENTSUPPORT_URL || 'http://localhost:3002';

// Pages to scan
const PAGES_TO_SCAN = [
  '/#/',
  '/#/how-it-works',
  '/#/donors',
  '/#/browse',
  '/#/terms',
  '/#/privacy',
];

interface ScanResponse {
  scanId: string;
  status?: string;
}

interface ScanResult {
  scanId: string;
  status: string;
  violations?: Array<{
    id: string;
    rule: string;
    description: string;
    impact: string;
    element: string;
    fix?: string;
  }>;
}

async function waitForServer(url: string, maxAttempts = 30): Promise<boolean> {
  console.log(`⏳ Waiting for server at ${url}...`);
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      if (response.status !== undefined) {
        console.log('✅ Server is ready!');
        return true;
      }
    } catch (error) {
      if (i % 5 === 0) process.stdout.write('.');
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log('\n❌ Server not ready');
  return false;
}

async function createScan(url: string): Promise<string | null> {
  try {
    const fullUrl = `${STUDENTSUPPORT_URL}${url}`;
    console.log(`\n📊 Creating scan for: ${fullUrl}`);
    
    const response = await fetch(`${ACCESSTOOL_BASE_URL}/api/scans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
        body: JSON.stringify({
          url: fullUrl,
          maxPages: 10,
          maxConcurrency: 3,
          level: 'AA',
          includeCLITools: true,
          includeCustomIntelligence: true,
        }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`   ❌ Failed: ${JSON.stringify(error)}`);
      return null;
    }

    const data: ScanResponse = await response.json();
    console.log(`   ✅ Scan created: ${data.scanId}`);
    return data.scanId;
  } catch (error) {
    console.error(`   ❌ Error: ${error}`);
    return null;
  }
}

async function waitForScanCompletion(scanId: string, maxWait = 300000): Promise<ScanResult | null> {
  console.log(`\n⏳ Waiting for scan ${scanId} to complete...`);
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWait) {
    try {
      const response = await fetch(`${ACCESSTOOL_BASE_URL}/api/scans/${scanId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        console.error(`   ❌ Failed to get scan status: ${response.status}`);
        return null;
      }

      const data = await response.json();
      const scan = data.scan || data;
      
      if (scan.status === 'completed') {
        console.log(`   ✅ Scan completed!`);
        return scan as ScanResult;
      } else if (scan.status === 'failed' || scan.status === 'cancelled') {
        console.log(`   ⚠️  Scan ${scan.status}`);
        return scan as ScanResult;
      }
      
      process.stdout.write(`\r   Status: ${scan.status}...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`   ❌ Error checking scan: ${error}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n   ⏱️  Timeout waiting for scan');
  return null;
}

async function getViolationsFromDB(scanId: string): Promise<any[]> {
  // This would require direct DB access - for now, we'll use the API
  // The accesstool should have an endpoint to get violations
  try {
    const response = await fetch(`${ACCESSTOOL_BASE_URL}/api/scans/${scanId}/score-breakdown`);
    if (response.ok) {
      const data = await response.json();
      return data.violations || [];
    }
  } catch (error) {
    console.error(`Error fetching violations: ${error}`);
  }
  return [];
}

async function main() {
  console.log('🚀 Starting WCAG scan of studentsupport site\n');
  console.log(`Accesstool URL: ${ACCESSTOOL_BASE_URL}`);
  console.log(`Studentsupport URL: ${STUDENTSUPPORT_URL}\n`);

  // Wait for both servers
  if (!(await waitForServer(ACCESSTOOL_BASE_URL))) {
    console.error('❌ Accesstool server not available');
    process.exit(1);
  }

  if (!(await waitForServer(STUDENTSUPPORT_URL))) {
    console.error('❌ Studentsupport server not available');
    process.exit(1);
  }

  // Create scans for each page
  const scanIds: string[] = [];
  for (const page of PAGES_TO_SCAN) {
    const scanId = await createScan(page);
    if (scanId) {
      scanIds.push(scanId);
    }
  }

  if (scanIds.length === 0) {
    console.error('❌ No scans created');
    process.exit(1);
  }

  console.log(`\n📋 Created ${scanIds.length} scan(s)`);
  console.log(`\nScan IDs: ${scanIds.join(', ')}`);
  console.log(`\nYou can view results at:`);
  scanIds.forEach(id => {
    console.log(`  - ${ACCESSTOOL_BASE_URL}/scan/${id}`);
  });

  // Wait for all scans to complete
  const results: Array<{ scanId: string; result: ScanResult | null }> = [];
  for (const scanId of scanIds) {
    const result = await waitForScanCompletion(scanId);
    results.push({ scanId, result });
  }

  // Get violations for each completed scan
  console.log('\n\n📊 Fetching violations...\n');
  for (const { scanId, result } of results) {
    if (result && result.status === 'completed') {
      const violations = await getViolationsFromDB(scanId);
      console.log(`\n🔍 Scan ${scanId}:`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Violations found: ${violations.length}`);
      
      if (violations.length > 0) {
        console.log('\n   Top violations:');
        violations.slice(0, 10).forEach((v: any, i: number) => {
          console.log(`   ${i + 1}. [${v.rule || 'N/A'}] ${v.description || v.message || 'No description'}`);
          if (v.fix) {
            console.log(`      Fix: ${v.fix}`);
          }
        });
      }
    }
  }

  console.log('\n✅ Scan complete!');
  console.log(`\nView detailed results at: ${ACCESSTOOL_BASE_URL}/scan/${scanIds[0]}`);
}

main().catch(console.error);

