const parseFeed = require('../lib/parseYoutubeAtom');
const CONSTANTS = require('../config.json');

const {EVENTS} = CONSTANTS;
console.log(CONSTANTS, EVENTS);

const getEventName = channelId => {
    const channel = EVENTS.find(event => event.id === channelId)
    const eventName = channel ? channel.eventName : 'NOT-DEFINED-EVENT';
    return eventName;
}

const handleFeed = async (req, res, next) => {
    const body = req.body;
    const stringifiedXML = body.toString();
    const parsed = await parseFeed(stringifiedXML);
    const {channelId} = parsed;
    // send SSE
    const eventName = getEventName(channelId);
    const sendCount = req.broadcast(eventName, JSON.stringify(parsed));
    //
    console.log(parsed);
    console.log(sendCount);
    res.send(204);
}

module.exports = handleFeed;