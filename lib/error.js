class ExtendableError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

class ValueNotFoundError extends ExtendableError {
    constructor(value){
        super(`${value} not found!`);
        this.value = value
    }
}


class InvalidYoutubeIdError extends ExtendableError {
    constructor(youtubeId){
        super(`Invalud Youtube id : ${youtubeId}`);
        this.youtubeId = youtubeId
    }
}

module.exports = {
    ValueNotFoundError,
    InvalidYoutubeIdError
}