const restify = require('restify');
const getVideoInfo = require('./routes/getVideoInfo');
const searchLiveVideos = require('./routes/searchLiveVideos');
const subscribeCallback = require('./routes/subscribeCallback');
const handleFeed = require('./routes/handleFeed');
const createSSEServer = require('./lib/sseClass');
const useSSE = createSSEServer();

const server = restify.createServer();
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());
server.pre(restify.plugins.pre.context());
server.get('/ytinfo/getHlsUrl/:videoId', getVideoInfo);
server.get('/ytinfo/searchLiveVideos/:channelId', searchLiveVideos);
server.get('/youtube/subscribe/callback', subscribeCallback);
server.post('/youtube/subscribe/callback', useSSE, handleFeed);
server.get('/pushMessage', useSSE, (req, res) => {
    const {event='ALL', message="hello"} = req.query;
    const sse = req.get('sse');
    sse.broadcast(event, message)
    res.send('ok');
})
server.get('/waitEvent', useSSE, (req, res) => {
    const {event='ALL'} = req.query
    const sse = req.get('sse');

    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    };
    res.set(headers);
    res.write('wait event...\n\n');
    req.on('close', () => {
        sse.unWaitEvent(event, res)
    })
    sse.waitEvent(event, res);
})
server.listen(8000, () => console.log(`listening ${server.name}: ${server.url}`))