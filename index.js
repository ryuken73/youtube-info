const restify = require('restify');
const getVideoInfo = require('./routes/getVideoInfo');

const server = restify.createServer();
server.use(restify.plugins.queryParser());
server.get('/ytinfo/:videoId', getVideoInfo);

server.listen(8000, () => console.log(`listening ${server.name}: ${server.url}`))