const searchLiveVideos = (req, res, next) => {
    const challenge = req.query['hub.challenge'];
    if(challenge) {
        res.send(200, challenge);
        return;
    }
    const body = req.body;
    console.log(body)
    res.send(204);
}

module.exports = searchLiveVideos;