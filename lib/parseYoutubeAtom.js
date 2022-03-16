const feed = require('feed-read-parser');
const convert = require('xml-js');

const toReadableDate = date => {
    const options = {dateStyle: 'full', hour12:false, timeStyle: 'medium'};
    return new Intl.DateTimeFormat('en-US', options).format(date)
}

const parseAtom = async (atomString) => {
    const xml = JSON.parse(convert.xml2json(atomString, {compact:true}));
    const entry = xml['feed']['entry'];
    const entries = Array.isArray(entry) ? entry:[...entry];
    return new Promise((resolve, reject) => {
        feed.atom(atomString, (err, articles) => {
            if(err){
                reject(err);
                return;
            }
            const parsed = articles.map((article, index) => {
                const publishedLocal = toReadableDate(new Date(article.published));
                const entryInXML = entries[index];
                const videoId = entryInXML['yt:videoId']['_text'];
                const updatedLocal = toReadableDate(new Date(entryInXML['updated']['_text']));
                return {...article, publishedLocal, videoId, updatedLocal};
            })
            resolve(parsed)
        })
    })
}

module.exports = parseAtom;