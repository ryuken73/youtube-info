const DEFAULT_EVENT = 'message';

class EVENT_WAITERS {
    constructor(waitEvent){
        this.event = waitEvent;
        this.eventWaiters = [];
    }
    addWEventWaiter(res){
        this.eventWaiters.push(res);
    }
    delEventWaiter(res){
        this.eventWaiters = this.eventWaiters.filter(client => client !== res);
    }
    notifyEvent(message){
        const stringMessage = typeof(message) === 'object' ? JSON.stringify(message) : message;
        this.eventWaiters.forEach(res => {
            res.write(`event: ${this.event}\n`);
            res.write(`data: ${stringMessage}\n\n`);
        })
        return this.eventWaiters.length;
    }
}

class SSE {
    constructor(){
        this.waitersMap = new Map();
    }
    isEventExists(waitEvent){
        return this.waitersMap.has(waitEvent);
    }
    createEvent(waitEvent){
        console.log('create new waitEvent:', waitEvent)
        this.waitersMap.set(waitEvent, new EVENT_WAITERS(waitEvent));
    }
    getWaiter(event){
        const waitEvent = event === undefined ? DEFAULT_EVENT : event;
        if(!this.isEventExists(waitEvent)){
            this.createEvent(waitEvent, new EVENT_WAITERS(waitEvent));
        }
        return this.waitersMap.get(waitEvent);
    }
    getAllWaiters(){
        return [...this.waitersMap.values()];
    }
    getDefaultWaiter(){
        return this.waitersMap.get(DEFAULT_EVENT)
    }
    getAllWaitEventName(){
        return [...this.waitersMap.keys()];
    }
    subscribeEvent(waitEvent, res){
        console.log('subscribeEvent: ', waitEvent);
        const target = this.getWaiter(waitEvent);
        target.addWEventWaiter(res);
    }
    unsubscribeEvent(waitEvent, res){
        console.log('unsubscribeEvent: ', waitEvent);
        const target = this.getWaiter(waitEvent);
        target.delEventWaiter(res);
    }
    sendToAll(targets, message){
        return targets.map(target => {
            const count = target.notifyEvent(message);
            return {event: target.event, numOfWaiters: count}
        })
    }
    sendToOne(target, message){
        const count = target.notifyEvent(message);
        return {event: target.event, numOfWaiters: 1}
    }
    broadcast(message, waitEvent=DEFAULT_EVENT){
        console.log(`broadcast event: ${waitEvent}`)
        const targets = waitEvent === DEFAULT_EVENT ? 
                        this.getAllWaiters() :
                        [this.getWaiter(waitEvent), this.getDefaultWaiter()];
        // const result = Array.isArray(targets) ? this.sendToAll(targets, message) : this.sendToOne(targets, message);
        const result = this.sendToAll(targets, message);
        return result;
    }
}


const sse = new SSE();

module.exports = {
    useBroadcast: (req, res, next) => {
        req.broadcast = sse.broadcast.bind(sse);
        return next();
    },
    useWaitEvent: (req, res, next) => {
        const headers = {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        };
        
        res.set(headers);
        res.status(200);
        res.write('wait event...\n\n');            
        req.waitEvent = (event, res) => {
            sse.subscribeEvent(event, res);
            req.on('close', () => {
                sse.unsubscribeEvent(event, res)
            })
        }
        return next();
    }
}