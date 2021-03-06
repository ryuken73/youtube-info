const feed = require('feed-read-parser');
const convert = require('xml-js');
const atomString = `
<?xml version='1.0' encoding='UTF-8'?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns="http://www.w3.org/2005/Atom"><link rel="hub" href="https://pubsubhubbub.appspot.com"/><link rel="self" href="https://www.youtube.com/xml/feeds/videos.xml?channel_id=UChlgI3UHCOnwUGzWzbJ3H5w"/><title>YouTube video feed</title><updated>2022-03-15T14:31:08.139437215+00:00</updated>
 <entry>
  <id>yt:video:LYroskqGn3M</id>
  <yt:videoId>LYroskqGn3M</yt:videoId>
  <yt:channelId>UChlgI3UHCOnwUGzWzbJ3H5w</yt:channelId>
  <title>YTN</title>
  <link rel="alternate" href="https://www.youtube.com/watch?v=LYroskqGn3M"/>
  <author>
   <name>YTN news</name>
   <uri>https://www.youtube.com/channel/UChlgI3UHCOnwUGzWzbJ3H5w</uri>
  </author>
  <published>2022-03-15T14:28:46+00:00</published>
  <updated>2022-03-15T14:31:08.139437215+00:00</updated>
 </entry>
 <entry>
  <id>yt:video:LYroskqGn3M</id>
  <yt:videoId>LYroskqGn3M</yt:videoId>
  <yt:channelId>UChlgI3UHCOnwUGzWzbJ3H5w</yt:channelId>
  <title>YTN</title>
  <link rel="alternate" href="https://www.youtube.com/watch?v=LYroskqGn3M"/>
  <author>
   <name>YTN news</name>
   <uri>https://www.youtube.com/channel/UChlgI3UHCOnwUGzWzbJ3H5w</uri>
  </author>
  <published>2022-03-15T14:28:46+00:00</published>
  <updated>2022-03-15T14:31:08.139437215+00:00</updated>
 </entry> 
 </feed>
`
const toReadableDate = date => {
    const options = {dateStyle: 'full', hour12:false, timeStyle: 'medium'};
    return new Intl.DateTimeFormat('en-US', options).format(date)
}

const xml = JSON.parse(convert.xml2json(atomString, {compact:true}));
const entry = xml['feed']['entry'];
const entries = Array.isArray(entry) ? entry:[...entry];

feed.atom(atomString, (err, articles) => {
    if(err){
        console.log(err);
        return;
    }
    const localized = articles.map((article, index) => {
        const publishedLocal = toReadableDate(new Date(article.published));
        const entryInXML = entries[index];
        const videoId = entryInXML['yt:videoId']['_text'];
        const updatedLocal = toReadableDate(new Date(entryInXML['updated']['_text']));
        return {...article, publishedLocal, videoId, updatedLocal};
    })
    console.log(localized)
})


// console.log(xml)
// console.log(xml['feed']['entry'])
// console.log(xml['feed']['entry']['yt:videoId']['_text'])
// console.log(ytId)