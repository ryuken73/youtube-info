let apiKeys;
const keyFileName = 'apiKeys.json'
try {
    apiKeys = require(`../${keyFileName}`);
} catch (err) {
    console.error(`error to load api key file.[${keyFileName}]`)
    apiKeys = {};
}
module.exports = (key='anne') => {
    return apiKeys[key];
}