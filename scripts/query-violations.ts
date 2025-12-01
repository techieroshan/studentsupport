#!/usr/bin/env tsx
/**
 * Query violations from accesstool database for a given scan ID
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { Pool } from 'pg';

// Load .env.local from accesstool project
const accesstoolEnvPath = resolve('/Users/roshanshah/Projects/accesstool/.env.local');
config({ path: accesstoolEnvPath });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in accesstool .env.local');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

interface Violation {
  id: string;
  criterion_id: string;
  element_selector: string | null;
  element_html: string | null;
  severity: string;
  message: string;
  description: string;
  solution: string;
  code_snippet: string | null;
  page_url: string;
  page_title: string | null;
}

async function getViolations(scanId: string): Promise<Violation[]> {
  const result = await pool.query<Violation>(
    `SELECT 
      v.id,
      v.criterion_id,
      v.element_selector,
      v.element_html,
      v.severity,
      v.message,
      v.description,
      v.solution,
      v.code_snippet,
      sr.page_url,
      sr.page_title
    FROM violations v
    JOIN scan_results sr ON v.scan_result_id = sr.id
    WHERE sr.scan_id = $1
    ORDER BY 
      CASE v.severity 
        WHEN 'error' THEN 1 
        WHEN 'warning' THEN 2 
        ELSE 3 
      END,
      v.criterion_id
    LIMIT 200`,
    [scanId]
  );
  return result.rows;
}

async function main() {
  const scanId = process.argv[2] || '47844fd2-d082-40b1-8b00-eea918810169';
  
  console.log(`🔍 Querying violations for scan: ${scanId}\n`);
  
  try {
    const violations = await getViolations(scanId);
    
    if (violations.length === 0) {
      console.log('✅ No violations found!');
      process.exit(0);
    }
    
    console.log(`📊 Found ${violations.length} violation(s):\n`);
    console.log('='.repeat(80));
    
    // Group by criterion
    const byCriterion = new Map<string, Violation[]>();
    violations.forEach(v => {
      const key = v.criterion_id || 'UNKNOWN';
      if (!byCriterion.has(key)) {
        byCriterion.set(key, []);
      }
      byCriterion.get(key)!.push(v);
    });
    
    // Group by page
    const byPage = new Map<string, Violation[]>();
    violations.forEach(v => {
      const key = v.page_url || 'UNKNOWN';
      if (!byPage.has(key)) {
        byPage.set(key, []);
      }
      byPage.get(key)!.push(v);
    });
    
    console.log('\n📄 Violations by Page:');
    console.log('-'.repeat(80));
    byPage.forEach((viols, page) => {
      console.log(`\n${page} (${viols.length} violations)`);
      viols.forEach((v, i) => {
        console.log(`  ${i + 1}. [${v.severity.toUpperCase()}] ${v.criterion_id || 'N/A'}`);
        console.log(`     ${v.message}`);
        if (v.element_selector) {
          console.log(`     Element: ${v.element_selector.substring(0, 100)}`);
        }
        if (v.solution) {
          console.log(`     Fix: ${v.solution.substring(0, 200)}`);
        }
        console.log('');
      });
    });
    
    console.log('\n📋 Violations by WCAG Criterion:');
    console.log('-'.repeat(80));
    byCriterion.forEach((viols, criterion) => {
      console.log(`\n${criterion}: ${viols.length} occurrence(s)`);
      const errors = viols.filter(v => v.severity === 'error').length;
      const warnings = viols.filter(v => v.severity === 'warning').length;
      console.log(`  Errors: ${errors}, Warnings: ${warnings}`);
      
      // Show first violation as example
      if (viols.length > 0) {
        const v = viols[0];
        console.log(`  Example: ${v.message}`);
        if (v.solution) {
          console.log(`  Fix: ${v.solution.substring(0, 150)}`);
        }
      }
    });
    
    console.log('\n' + '='.repeat(80));
    console.log(`\n✅ Total: ${violations.length} violations`);
    console.log(`   Errors: ${violations.filter(v => v.severity === 'error').length}`);
    console.log(`   Warnings: ${violations.filter(v => v.severity === 'warning').length}`);
    
  } catch (error) {
    console.error('❌ Error querying database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);

