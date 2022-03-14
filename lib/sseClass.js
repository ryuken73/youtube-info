const ALL_EVENTS = '__ALL__';

class SSE_EVENT {
    constructor(eventName) {
        this.eventName = eventName;
        this.clients = [];
    }
    addWaitClient(res){
        this.clients.push(res);
        console.log(`add client waiting ${this.eventName}.[wait client count=${this.clients.length}]`)
    }
    delWaitClient(res){
        this.clients = this.clients.filter(client => client !== res);
        console.log(`delete client waiting ${this.eventName}.[wait client count=${this.clients.length}]`)
    }
    broadcast(message){
        this.clients.forEach(clientRes => {
            clientRes.write(`${message}\n\n`);
        })
    }
}

class SSE_SERVER {
    constructor(){
        this.events = new Map();
    }
    isExistEvent(eventName){
        return this.events.has(eventName);
    }
    addEvent(eventName){
        this.events.set(eventName, new SSE_EVENT(eventName));
    }
    waitEvent(eventName, res){
        const targetEvent = this.getEvent(eventName);
        targetEvent.addWaitClient(res);
    }
    unWaitEvent(eventName, res){
        const targetEvent = this.getEvent(eventName);
        targetEvent.delWaitClient(res);
    }
    getEvent(eventName){
        if(eventName === ALL_EVENTS){
            return [...this.events.values()]
        }
        if(!this.isExistEvent(eventName)){
            const newEvent = new SSE_EVENT(eventName);
            this.events.set(eventName, newEvent);
        }
        return this.events.get(eventName);
    }
    broadcast(eventName, message){
        const targetEvent = this.getEvent(eventName);
        targetEvent.broadcast(message);
    }
}

// class SSE_SERVER {
//     constructor() {
//         this.clients = new Map();
//         this.eventEmitters = new Map();
//     }
//     isExistGroup(groupString){
//         return this.groups.has(groupString);
//     }
//     setGroup(groupString, clients){
//         if(Array.isArray(clients)){
//             this.groups.set(groupString, clients);
//             return
//         }
//         throw new Error('clients must be array.');
//     }
//     getGroup(groupString, initialValue=[]){
//         if(groupString === ALL_STRING){
//             return [...this.groups.values()].flat();
//         }
//         if(!this.isExistGroup(groupString)){
//             this.groups.set(groupString, initialValue);
//             this.eventEmitters.set(this.groups, new EventEmitter());
//         }
//         return this.groups.get(groupString)
//     }
//     addClient(clientRes, groupString){
//         const group = this.getGroup(groupString);
//         group.push(clientRes);
//     }
//     delClient(clientRes, groupString){
//         const group = this.getGroup(groupString);
//         this.setGroup(groupString, group.filter(client => client !== clientRes))
//     }
//     broadcast(message, groupString = ALL_STRING){
//         const group = this.getGroup(groupString);
//         group.forEach(res => {
//             res.send(200, message);
//         })
//     }
//     sseHandler(req, res, next){

//     }
// }
const sseServer = new SSE_SERVER();
module.exports = () => {
    return (req, res, next) => {
        req.set('sse', sseServer);
        return next();
    }
}