const handleFeed = (req, res, next) => {
    const body = req.body;
    console.log(body)
    res.send(204);
}

module.exports = handleFeed;