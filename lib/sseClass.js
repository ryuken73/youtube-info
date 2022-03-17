const ALL_EVENTS = '__ALL__';

class SSE_EVENT {
    constructor(eventName) {
        this.eventName = eventName;
        this.clients = [];
    }
    addWaitClient(res){
        this.clients.push(res);
        console.log(`put client waiting for ${this.eventName}.[count=${this.clients.length}]`)
    }
    delWaitClient(res){
        this.clients = this.clients.filter(client => client !== res);
        console.log(`del client waiting for ${this.eventName}.[count=${this.clients.length}]`)
    }
    broadcast(message){
        this.clients.forEach(clientRes => {
            clientRes.write(`data: ${message}\n\n`);
        })
        return this.clients.length;
    }
}

class SSE_SERVER {
    constructor(){
        this.events = new Map();
        this.events.set(ALL_EVENTS, new SSE_EVENT(ALL_EVENTS));
    }
    isExistEvent(eventName){
        return this.events.has(eventName);
    }
    addEvent(eventName){
        this.events.set(eventName, new SSE_EVENT(eventName));
    }
    waitEvent(eventName, res){
        const targetEvents = this.getEvents(eventName);
        targetEvents.forEach(target => target.addWaitClient(res));
    }
    unWaitEvent(eventName, res){
        const targetEvents = this.getEvents(eventName);
        targetEvents.forEach(target => target.delWaitClient(res));
    }
    getEvents(event){
        const eventName = event === undefined ? ALL_EVENTS : event;

        if(!this.isExistEvent(eventName)){
            const newEvent = new SSE_EVENT(eventName);
            this.events.set(eventName, newEvent);
        }
        return [this.events.get(eventName)];
    }
    getAllOtherEvents(){
        const newMap = new Map(this.events);
        newMap.delete(ALL_EVENTS);
        return [...newMap.values()];
    }
    broadcast(eventName, message){
        const allEvents = this.getEvents(ALL_EVENTS);
        const allOtherEvents = this.getAllOtherEvents();
        const specificEvents = this.getEvents(eventName);
        const targetDeduped = eventName === undefined ? 
                              [...allEvents, ...allOtherEvents]: 
                              [...allEvents, ...specificEvents];
        const result = targetDeduped.map(target => {
            const count = target.broadcast(message);
            return {event: target.eventName, waitClientsNum: count}
        })
        return result;
    }
}

const sseServer = new SSE_SERVER();

module.exports = {
    useBroadcast: (req, res, next) => {
        req.broadcast = sseServer.broadcast.bind(sseServer);
        return next();
    },
    useWaitEvent: (req, res, next) => {
        const headers = {
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        };
        
        res.set(headers);
        res.write('wait event...\n\n');            
        req.waitEvent = (event, res) => {
            sseServer.waitEvent(event, res);
            req.on('close', () => {
                sseServer.unWaitEvent(event, res)
            })
        }
        return next();
    }
}