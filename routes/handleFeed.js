const parseFeed = require('../lib/parseYoutubeAtom');

const handleFeed = async (req, res, next) => {
    const body = req.body;
    // const contentType = req.header('Content-Type');
    // console.log(contentType)
    // console.log(body)
    const stringifiedXML = body.toString();
    const parsed = await parseFeed(stringifiedXML);
    console.log(parsed);
    res.send(204);
}

module.exports = handleFeed;