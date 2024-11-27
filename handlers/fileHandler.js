const FS = require('fs');
const PATH = require('path');
const JSONFolder = PATH.join(__dirname,'..','data','/JSON')

/**
 * This function looks in the JSON folder in the data directory and creates an
 * array containing the absolute paths to all the files found there.
 * @returns an array with a list of absolute paths to all the files in the JSON
 * folder
 */
const getJsonDocs = () => {
    const dirEnts = FS.readdirSync(JSONFolder,{withFileTypes:true});
    const json = [];
    dirEnts.forEach(dirEnt => {
        const path = PATH.join(dirEnt.parentPath,dirEnt.name);
        const obj = JSON.parse(FS.readFileSync(path, {encoding:'utf-8'}))
        json.push(obj);
    });
    return json || null;
}

module.exports={
    getJsonDocs
}