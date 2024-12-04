const fileHandler = require('../handlers/fileHandler')

const index = (req, res)=> {
    const files = fileHandler.getJsonDocs();
    res.render('index',{files});
}

module.exports={
    index
}