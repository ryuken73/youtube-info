const searchLiveVideos = (req, res, next) => {
    const challenge = req.query['hub.challenge'];
    if(challenge) {
        console.log(challenge);
        res.status(200);
        res.sendRaw(challenge);
        return;
    }
    const body = req.body;
    console.log(body)
    res.send(204);
}

module.exports = searchLiveVideos;