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
    broadcast(eventName="default", message){
        const stringMessage = typeof(message) === 'object' ? JSON.stringify(message) : message;
        this.clients.forEach(clientRes => {
            clientRes.write(`event: ${eventName}\n`);
            clientRes.write(`data: ${stringMessage}\n\n`);
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
        const allEventWaiters = this.getEvents(ALL_EVENTS);
        const allOtherEventWaiters = this.getAllOtherEvents();
        const specificEventWaiters = this.getEvents(eventName);
        const targetWaiters = eventName === undefined ? 
                              [...allEventWaiters, ...allOtherEventWaiters]: 
                              [...allEventWaiters, ...specificEventWaiters];
        const result = targetWaiters.map(target => {
            const count = target.broadcast(target.eventName, message);
            return {event: target.eventName, numOfWaiters: count}
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
        res.charSet('utf-8');
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