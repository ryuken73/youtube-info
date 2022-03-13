const yt = require('youtube-info-streams');
const {ValueNotFoundError, InvalidYoutubeIdError} = require('../lib/error');

const HLS_MANIFEST_URL = 'hlsManifestUrl';
const getYoutubeHlsUrl = ytInfo => {
    // console.log(ytInfo.playerResponse.streamingData)
    return ytInfo.playerResponse?.streamingData?.hlsManifestUrl
}
const findValuleByKey = (jsonObj, findKey, path='top') => {
   printLog(`searching ${path}...${Object.keys(jsonObj)}...${findKey}`);
   const keys = Object.keys(jsonObj);
   if(keys.includes(findKey)){
       return jsonObj[findKey];
   } else {
        for (const childKey of keys){
           if(typeof(jsonObj[childKey]) === 'object') {
                const value = findValuleByKey(jsonObj[childKey], findKey, `${path}->${childKey}`);
                if(value !== undefined) return value
           } else {
               continue;
           }
        }
   }
}
const isDevMode = process.env.MODE === 'dev'
const printLog = message => {
    isDevMode && console.log(message);
}

const getVideoInfo = async (req, res, next) => {
    const videoId = req.params.videoId;
    const queryKey = req.query.jsonKey || HLS_MANIFEST_URL;
    const debug = req.query.debug || false;
    let videoInfo;
    try {
        videoInfo = await yt.info(videoId);
        printLog(videoInfo);
        let result;
        if(queryKey === HLS_MANIFEST_URL){
            result = getYoutubeHlsUrl(videoInfo) || findValuleByKey(videoInfo, HLS_MANIFEST_URL);
        } else {
            result = findValuleByKey(videoInfo, queryKey);
        }
        if(result === undefined) {
            throw new ValueNotFoundError(queryKey);
        }
        res.send({success:true, result})
    } catch(error) {
        console.error(error, queryKey, videoId)
        if(debug){
            res.send({success:false, error, videoInfo})
            return
        }
        if(error.name = 'ValueNotFoundError'){
            res.send({success:false, error:`video shoud be youtube live contents. cannot get hls url: queryKey = ${queryKey} : videoId = ${videoId}`})
        } else if(error.name = 'Error'){
            res.send({success:false, error:'invalid youtube id. please check id.'})
        }
    }
}

module.exports = getVideoInfo;