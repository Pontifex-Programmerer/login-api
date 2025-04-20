const {execSync} = require('child_process');

const {platform} = process;

let clearScreen;
let operatingSystem;

switch(platform){
    case 'win32':
        operatingSystem='Windows'
        clearScreen='cls';
        break;
    case 'linux':
        operatingSystem='Linux'
        clearScreen='clear';
        break;
    default:
        operatingSystem=platform;
        break;
}
execSync(clearScreen, {stdio:"inherit"});
console.info(`${operatingSystem} startupscript running!`);
console.info(`----------------------------------------\n`);

require('./apiserver.js');