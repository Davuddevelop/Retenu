const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('.git')) {
                results = results.concat(walk(file));
            }
        } else { 
            if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.md') || file.endsWith('.sql') || file.endsWith('.json')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./');
let count = 0;
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    if (content.includes('OBSIDIAN') || content.includes('Obsidian')) {
        content = content.replace(/OBSIDIAN/g, 'RETENU');
        content = content.replace(/Obsidian/g, 'Retenu');
        fs.writeFileSync(f, content);
        console.log('Updated: ' + f);
        count++;
    }
});
console.log(`Successfully rebranded ${count} files to RETENU.`);
