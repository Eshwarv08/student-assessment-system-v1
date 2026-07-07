const fs = require('fs');
const path = require('path');

const dir = '/home/ganapathi/Pictures/clone/frontend/src/components/';

for (let i = 2; i <= 15; i++) {
  const filePath = path.join(dir, `Q${i}Booklet.tsx`);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');

  // Remove duplicate media query blocks if they appear more than once consecutively
  const css = `
      @media screen and (max-width: 800px) {
        .q${i}-booklet-view { padding: 10px; overflow-x: hidden; width: 100%; max-width: 100vw; box-sizing: border-box; }
        .q${i}-booklet-view .page {
          width: 100% !important;
          max-width: 100% !important;
          min-height: auto !important;
          margin: 0 auto 15px auto !important;
          padding: 10px !important;
          box-sizing: border-box !important;
          overflow: hidden;
        }
        .q${i}-booklet-view table {
          display: block !important;
          width: 100% !important;
          overflow-x: auto !important;
          -webkit-overflow-scrolling: touch;
        }
        .q${i}-booklet-view .flex, .q${i}-booklet-view div[style*="display: flex"] {
          flex-wrap: wrap;
        }
        .q${i}-booklet-view .cover-title {
          font-size: 22pt !important;
          word-break: break-word !important;
          hyphens: auto !important;
        }
        .q${i}-booklet-view .cover-subtitle {
          font-size: 14pt !important;
          word-break: break-word !important;
        }
        .q${i}-booklet-view img {
          max-width: 100%;
          height: auto;
        }
        .q${i}-booklet-view .cover-outer-border { 
          min-height: auto !important; 
          padding: 4px !important; 
          width: 100% !important; 
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        .q${i}-booklet-view .cover-inner-border { 
          padding: 15px 10px !important; 
          width: 100% !important; 
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        .q${i}-booklet-view .cover-student-name-container { 
          padding: 0 !important; 
          flex-direction: column !important; 
          align-items: flex-start !important; 
          width: 100% !important;
        }
      }`;

  // Easy fix: just split by the exact media query block and join it back up
  // Since there are multiple white spaces, let's use a regex to remove anything between the first and last instance
  let occurrences = content.split('@media screen and (max-width: 800px) {');
  if (occurrences.length > 2) {
    // Reconstruct with only 1 instance
    let firstPart = occurrences[0];
    // Find the end of the last instance.
    // The last instance is occurrences[occurrences.length-1]
    let lastPart = occurrences[occurrences.length - 1];
    
    content = firstPart + '@media screen and (max-width: 800px) {' + lastPart;
    fs.writeFileSync(filePath, content);
    console.log(`Fixed duplicates in Q${i}Booklet.tsx`);
  }
}
