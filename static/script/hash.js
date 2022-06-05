function hash(inp){
    const crypto = require('crypto');
    var res = crypto.createHash('md5').update(inp).digest('hex');
    return res;
}
console.log(hash("28633435320781293"))