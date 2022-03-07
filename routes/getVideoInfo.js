const yt = require('youtube-info-streams');
const {ValueNotFoundError, InvalidYoutubeIdError} = require('../lib/error');

const HLS_MANIFEST_URL = 'hlsManifestUrl';
const getYoutubeHlsUrl = ytInfo => {
    // console.log(ytInfo.playerResponse.streamingData)
    return ytInfo.playerResponse?.streamingData?.hlsManifestUrl
}
const findValuleByKey = (jsonObj, findKey, path='top') => {
   console.log(`searching ${path}...${Object.keys(jsonObj)}...${findKey}`);
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

const getVideoInfo = async (req, res, next) => {
    const videoId = req.params.videoId;
    const queryKey = req.query.jsonKey || HLS_MANIFEST_URL;
    try {
        const videoInfo = await yt.info(videoId);
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
        console.error(error)
        if(error.name = 'ValueNotFoundError'){
            res.send({success:false, error:`requested key not found: ${queryKey}`})
        } else if(error.name = 'Error'){
            res.send({success:false, error:'invalid youtube id. please check id.'})
        }
    }
}

module.exports = getVideoInfo;