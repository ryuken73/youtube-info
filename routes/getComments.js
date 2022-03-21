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

const getComments = async (req, res, next) => {
    const videoId = req.params.videoId;
    if(isInvalidVideoId(videoId)) {
        res.send({success:false, error: 'invalid youtube video id'})
        return;
    }
    console.log(videoId)
    ytService.commentThreads.list({
        part: 'id,snippet',
        fields: 'items(id, snippet(topLevelComment, totalReplyCount, isPublic), replies(comments)) ',
        videoId: videoId
    }, (err, response) => {
        if(err){
            console.error('The API returned an error : ', err);
            res.json({success:false, error:err})
            return
        }
        const result = response.data.items;
        if(result.length === 0) {
            console.log('items not found');
            res.json({success:true, msg:'items not found'});
            return
        }
        console.log(response.data.items);
        // const dataWithLocalDate = response.data.items.map(item => {
        //     const newItemSnippet = {...item.snippet};            
        //     const localPublishTime = (new Date(item.snippet.publishTime)).toLocaleString();           
        //     newItemSnippet.publishTime = localPublishTime;
        //     console.log(newItemSnippet)
        //     return {
        //         id: {...item.id},
        //         snippet: {...newItemSnippet}
        //     }
        // })
        res.json({success:true, data:result})
    })
}

module.exports = getComments;