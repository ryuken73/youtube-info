const restify = require('restify');
const getVideoInfo = require('./routes/getVideoInfo');
const searchLiveVideos = require('./routes/searchLiveVideos');
const subscribeCallback = require('./routes/subscribeCallback');

const server = restify.createServer();
server.use(restify.plugins.queryParser());
server.get('/ytinfo/getHlsUrl/:videoId', getVideoInfo);
server.get('/ytinfo/searchLiveVideos/:channelId', searchLiveVideos);
server.get('/youtube/subscribe/callback', subscribeCallback);

server.listen(8000, () => console.log(`listening ${server.name}: ${server.url}`))