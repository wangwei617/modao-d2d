const fs = require('fs');
const file = '/Users/modao/Documents/GitHub/modao-d2d/modao-d2d-app/src/components/chat/ChatPage.tsx';
let data = fs.readFileSync(file, 'utf8');

// The last replace somehow deleted lines 1121 to 1150 leaving unclosed divs
// I will use git checkout to restore the file to a clean state 
