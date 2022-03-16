const parseFeed = require('../lib/parseYoutubeAtom');
const CONSTANTS = require('../config.json');

const {EVENTS} = CONSTANTS;
console.log(CONSTANTS, EVENTS);

const getEventName = channelId => {
    const channel = EVENTS.find(event => event.id === channelId)
    console.log(channelId, EVENTS, channel)
    const {eventName} = channel 
    return eventName;
}

const handleFeed = async (req, res, next) => {
    const body = req.body;
    const stringifiedXML = body.toString();
    const parsed = await parseFeed(stringifiedXML);
    const {channelId} = parsed;
    // send SSE
    const eventName = getEventName(channelId);
    console.log(`eventName[${eventName}, channelId[${channelId}]]`);
    const parsedWithEventName = {...parsed, eventName};
    const sendCount = req.broadcast(eventName, JSON.stringify(parsedWithEventName));
    //
    console.log(parsed);
    console.log(sendCount);
    res.send(204);
}

module.exports = handleFeed;