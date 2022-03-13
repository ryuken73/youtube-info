const handleFeed = (req, res, next) => {
    const body = req.body;
    const contentType = req.header('Content-Type');
    console.log(contentType)
    console.log(body)
    console.log(body.toString())
    res.send(204);
}

module.exports = handleFeed;