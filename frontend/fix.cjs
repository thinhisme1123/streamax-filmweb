const fs = require('fs');
let code = fs.readFileSync('src/pages/WatchMovie.tsx', 'utf-8');

// 1. Remove everything before `import { useState, useEffect, useRef, useCallback, useMemo } from 'react';`
const importStmt = "import { useState, useEffect, useRef, useCallback, useMemo } from 'react';";
const startIdx = code.indexOf(importStmt);
if (startIdx !== -1) {
    code = code.substring(startIdx);
}

// 2. The code still has standard merge conflict markers for the rest.
// It looks like:
// <<<<<<< HEAD
// ... content from HEAD
// =======
// ... content from branch
// >>>>>>> ...

// We want to KEEP the content from the incoming branch (the bottom part) 
// and REMOVE the content from HEAD.
// We can use a regex to replace `<<<<<<< HEAD[\s\S]*?=======\r?\n` with empty string.
code = code.replace(/<<<<<<< HEAD[\s\S]*?=======\r?\n/g, '');

// 3. Remove `>>>>>>> 85ccd1d...`
code = code.replace(/>>>>>>>.*/g, '');

fs.writeFileSync('src/pages/WatchMovie.tsx', code, 'utf-8');
console.log('Fixed conflicts!');
