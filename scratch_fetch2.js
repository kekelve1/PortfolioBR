const https = require('https');
const fs = require('fs');

const missing = {
  'Advocacia': '1uNKTzhlZNOZ-fpzrQcUsljsy9IEHLgFm',
  'Clinica': '190Dg5trPvRqNwQtWKFmuf_M7EYKJdSj_',
  'Podcast': '14T1OapKEf7eNG9um7R5r-LVqJwoLBZOR',
  'Churrasco': '1sR9lI0zVyFvTt3R9Bw3Q9E6sTqND89e9'
};

function fetchFolder(folderId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'drive.google.com',
      path: '/embeddedfolderview?id=' + folderId,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    };
    https.get(options, function(res) {
      let data = '';
      res.on('data', function(chunk) { data += chunk; });
      res.on('end', function() { resolve(data); });
    }).on('error', reject);
  });
}

function parseFilesFromHtml(html) {
  const results = [];
  // Simple string parsing to find file IDs and names
  const parts = html.split('flip-entry-title');
  for (let i = 1; i < parts.length; i++) {
    const titleEnd = parts[i].indexOf('</div>');
    let title = parts[i].substring(1, titleEnd).replace(/>/g, '').replace(/</g, '').trim();
    // Find the nearest file ID before this title
    const before = (parts[i-1] || '');
    const fileMatch = before.match(/\/file\/d\/([a-zA-Z0-9_-]+)\/view/);
    if (fileMatch) {
      results.push({ id: fileMatch[1], title: title });
    }
  }
  return results;
}

async function main() {
  const allData = JSON.parse(fs.readFileSync('scratch_files.json', 'utf8'));
  
  for (const cat of Object.keys(missing)) {
    const folderId = missing[cat];
    console.log('Fetching ' + cat + '...');
    const html = await fetchFolder(folderId);
    const files = parseFilesFromHtml(html);
    allData[cat] = files;
    console.log(cat + ': ' + files.length + ' files');
    files.forEach(function(f) { console.log('  - ' + f.title + ' | ' + f.id); });
  }
  
  fs.writeFileSync('scratch_files.json', JSON.stringify(allData, null, 2));
  console.log('\nAll done! Full results in scratch_files.json');
}

main().catch(function(e) { console.error(e); });
