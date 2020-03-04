import { Module, Command } from '../module'
import { client } from '../../elbie'
import { User } from 'discord.js'

interface QueueObject {
    [index: string]: Queue
}

interface Queue extends Array<Track> {
    [index: number]: Track
}

class Track {
    name: string = ""
    rqdBy?: User
    data: any
    constructor({ rqdBy, info }: { rqdBy: User; info: string }) {
        //do whatever youtube interaction stuff is needed
    }
}

class audio extends Module {
    name = 'audio'
    desc = ''
    queue: QueueObject = {}
    constructor() {
        super()
    }
    private _play(str: string): void {


    }
    addQueue(command: Command): void {
        if (this.queue[command.server.id]) {
            this.queue[command.server.id].push(new Track({ rqdBy: command.auth, info: command.argument }))
        }
        else {
            this.queue[command.server.id] = [new Track({ rqdBy: command.auth, info: command.argument })]
        }
    }
    stop(command: Command): void {

    }
    listQueue(command: Command): void {
        if (this.queue[command.server.id]) {
            this.queue[command.server.id].map((val) => { `-${val.name}` })
        }
    }
    play(command: Command): void {
        //nothing yet

    }
    commands = {
    }
}

export default new audio()