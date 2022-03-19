const restify = require('restify');
const corsMiddleware = require('restify-cors-middleware')
const getVideoInfo = require('./routes/getVideoInfo');
const searchLiveVideos = require('./routes/searchLiveVideos');
const subscribeCallback = require('./routes/subscribeCallback');
const handleFeed = require('./routes/handleFeed');
const {useWaitEvent, useBroadcast} = require('./lib/sseClass');

const cors = corsMiddleware({
  origins: ['*']
})

const server = restify.createServer();
server.pre(cors.preflight)
server.use(cors.actual)
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());
server.pre(restify.plugins.pre.context());
server.get('/ytinfo/getHlsUrl/:videoId', getVideoInfo);
server.get('/ytinfo/searchLiveVideos/:channelId', searchLiveVideos);
server.get('/youtube/subscribe/callback', subscribeCallback);
server.post('/youtube/subscribe/callback', useBroadcast, handleFeed);
server.get('/youtube/pushMessage', useBroadcast, (req, res) => {
    const {event, message="hello \n\n"} = req.query;
    const sendCount = req.broadcast(event, message);
    res.send({success: true, result: sendCount});
})
server.get('/youtube/waitEvent', useWaitEvent, (req, res) => {
    const {event} = req.query;
    req.waitEvent(event, res)
})
server.listen(8000, () => console.log(`listening ${server.name}: ${server.url}`))