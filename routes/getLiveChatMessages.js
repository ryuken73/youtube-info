const {google} = require('googleapis');
const getApiKey = require('../lib/getApiKey');
const apiKey = getApiKey('anne');
const ytService = google.youtube({
    version: 'v3',
    auth: apiKey
})
const isInvalidVideoId = channelId => {
    return false;
}

const getLiveBroadcast = async () => {
    return new Promise((resolve, reject) => {
        ytService.liveBroadcasts.list({
            part: 'id, snippet, contentDetails, status',
            broadcastStatus: 'all',
            maxResults: 50
        }, (err, response) => {
            if(err){
                reject(err)
                return
            }
            const result = response.data.items;
            console.log(result);
            resolve(result)
        }
        )
    })
}

const getLiveChatMessages = async (req, res, next) => {
    const liveBroadcasts = await getLiveBroadcast();
    res.json({success:true, data:'done'})
}

module.exports = getLiveChatMessages;