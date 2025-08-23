// Simple test to check Maps component syntax
const fs = require('fs');
const path = require('path');

try {
  const mapsContent = fs.readFileSync(path.join(__dirname, 'src/pages/Maps.tsx'), 'utf8');
  
  // Basic syntax checks
  const openTags = (mapsContent.match(/<[^/][^>]*>/g) || []).length;
  const closeTags = (mapsContent.match(/<\/[^>]*>/g) || []).length;
  const selfClosingTags = (mapsContent.match(/<[^>]*\/>/g) || []).length;
  
  console.log('Maps.tsx Syntax Check:');
  console.log(`Open tags: ${openTags}`);
  console.log(`Close tags: ${closeTags}`);
  console.log(`Self-closing tags: ${selfClosingTags}`);
  console.log(`Balance check: ${openTags - selfClosingTags === closeTags ? 'PASS' : 'FAIL'}`);
  
  // Check for common JSX issues
  const issues = [];
  if (mapsContent.includes('motion.div>')) issues.push('Unclosed motion.div found');
  if (mapsContent.includes('</div')) issues.push('Incomplete closing div tag found');
  if (mapsContent.includes('}>')) issues.push('Potential JSX expression issue');
  
  if (issues.length === 0) {
    console.log('✅ No obvious syntax issues found');
  } else {
    console.log('⚠️ Potential issues:', issues);
  }
  
} catch (error) {
  console.error('Error reading Maps.tsx:', error.message);
}
