const https = require('https');
const fs = require('fs');

// Subfolder IDs extracted from main folder HTML
const subfolders = {
  'Educacao': '19lQBn3KecT0cA2gQ2G5lGgHVbWDykHld',
  'Estetica': '1CmJ7HfImQrK6o69sxSLd7IIlerwShI-Q',
  'Experts': '1oc-DcJUQtPKcRVPSahbntP-MaIb4DJOP',
  'Grafica': '1ifSsMEfB0f2QhWuFOueVh_QKtkW9BQXW',
  'IA': '15-Zky5Ns64umFEBrVB6a4r52vjHsUHo4',
  'Imoveis': '1O2twdFQWdACbLm5K_itThCySCaqJD0xg',
  'Marketing': '1GK1FTGj_fLaz-9jOHK2u_Qc4f3dHk67V',
  'Marmitas': '12SqMZ-Y_h0wjv6j1xUW1ara_eT3SLmL2',
  'Outros': '13kE2Xl1aj01U8YTmIVH1kskxkeshgqqO',
  'Personal': '1Ic_vsXtIIm6CAZ7KoGIlgQ34W-c2qN-M',
  'Restaurante': '1TSMC5rpArmHGiqdClhMi68Lrfp6Q9KxJ'
};

// Need to find: Advocacia, Churrasco, Clinica, Podcast
// First let's also fetch the main folder to find those
const MAIN_FOLDER_ID = '1iep2QWq-b2aTxz8ZNxvosv93V7aD3eGJ';

function fetchFolder(folderId) {
  return new Promise((resolve, reject) => {
    const url = 'https://drive.google.com/embeddedfolderview?id=' + folderId + '#list';
    const options = {
      hostname: 'drive.google.com',
      path: '/embeddedfolderview?id=' + folderId + '#list',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseFilesFromHtml(html, category) {
  const results = [];
  // Match file entries: each has a /file/d/ID/view link and a title
  const entryRegex = /flip-entry[^>]*id="entry-([^"]+)"[^>]*>.*?flip-entry-title[^>]*>([^<]+)<\/div>/gs;
  let match;
  while ((match = entryRegex.exec(html)) !== null) {
    const id = match[1];
    const title = match[2].replace(/[^\x20-\x7E\u00C0-\u024F]/g, '?').trim();
    // Only include if it looks like a file ID (not a folder - folders have longer IDs that start with 1 and are 33 chars)
    // Actually all IDs are similar length. Check if it appears in a file link
    const isFile = html.includes('/file/d/' + id + '/view');
    if (isFile) {
      results.push({ id, title, category });
    }
  }
  return results;
}

function parseFolderIdsFromHtml(html) {
  const results = {};
  const folderRegex = /href="https:\/\/drive\.google\.com\/drive\/folders\/([a-zA-Z0-9_-]+)"[^>]*>.*?flip-entry-title[^>]*>([^<]+)<\/div>/gs;
  let match;
  while ((match = folderRegex.exec(html)) !== null) {
    const folderId = match[1];
    const name = match[2].replace(/[^\x20-\x7E\u00C0-\u024F]/g, '?').trim();
    results[name] = folderId;
  }
  return results;
}

async function main() {
  console.log('Fetching main folder to find missing subfolder IDs...');
  const mainHtml = await fetchFolder(MAIN_FOLDER_ID);
  const extraFolders = parseFolderIdsFromHtml(mainHtml);
  console.log('Folders found in main:', JSON.stringify(extraFolders));
  
  // Save main HTML for inspection
  fs.writeFileSync('scratch_main.html', mainHtml);
  
  const allFiles = {};
  
  // Fetch all known subfolders
  for (const [cat, folderId] of Object.entries(subfolders)) {
    console.log('Fetching ' + cat + '...');
    const html = await fetchFolder(folderId);
    const files = parseFilesFromHtml(html, cat);
    allFiles[cat] = files;
    console.log(cat + ': found ' + files.length + ' files');
    files.forEach(f => console.log('  - ' + f.title + ' | ' + f.id));
  }
  
  fs.writeFileSync('scratch_files.json', JSON.stringify(allFiles, null, 2));
  console.log('\nDone! Results saved to scratch_files.json');
}

main().catch(console.error);
