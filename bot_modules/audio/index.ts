import { Module, Command } from '../module'
import ytdl from 'ytdl-core-discord'
import { User, VoiceConnection, StreamDispatcher } from 'discord.js'

interface QueueObject {
    [index: string]: Queue
}

interface IQueue extends Array<Track | VoiceConnection> {
    [index: number]: Track
    connection: VoiceConnection
}

class Queue extends Array<Track> implements IQueue {
    [index: number]: Track
    connection: VoiceConnection
    constructor(connection: VoiceConnection) {
        super()
        this.connection = connection
    }
}

class Track {
    rqdBy?: User
    id: string
    info?: any
    options: {} = {}
    ready: boolean = false
    stream?: any
    constructor({ rqdBy, id, options }: { rqdBy: User; id: string, options?: {} }) {
        if (options == {}) {
            options = { type: 'opus', filter: 'audioonly' }
        }
        this.rqdBy = rqdBy
        this.id = id
    }
    get = async () => {
        this.info = await ytdl.getBasicInfo(this.id)
        this.stream = await ytdl(this.id, {filter:'audioonly', highWaterMark:1<<25})
    }
}

class audio extends Module {
    name = 'audio'
    desc = ''
    queue: QueueObject
    args: string[] = []
    options = {}
    constructor() {
        super()
        this.queue = {}
    }
    private _play = async (currQ: Queue) => {
        let track = currQ[0]
        currQ.connection.play(track.stream, { type: 'opus' })
        console.log(`Now playing *${track.info.title}*, requested by ${track.rqdBy?.username}`)
        let dispatcher = currQ.connection.dispatcher
        dispatcher.on('finish', () => {
            dispatcher.destroy()
            let t = currQ.shift()
            if (currQ.length >= 1) {
                if (t !== undefined) {
                    this._play(currQ)
                }
            }
        })
        dispatcher.on('debug', (info)=>{
            console.warn(info)
        })
        dispatcher.on('error', (info) => {
            console.error(info)
            dispatcher.emit('finish')
        })
        // currQ.connection.on('debug', (info)=>{
        //     console.warn(info)
        // })
    }
    addQueue = async (command: Command): Promise<void> => {
        let currQ = this.queue[command.server.id]
        if (currQ) {
            let t = new Track({ rqdBy: command.auth, id: command.argument })
            await t.get()
            currQ.push(t)
            await this.listQueue(command)
            if (currQ.length == 1) {
                this._play(currQ)
            }
        }
    }
    stop = async (command: Command): Promise<void> => {
        this.queue[command.server.id].connection.disconnect()
        await command.reply("Closing connection!")
    }
    listQueue = async (command: Command) => {
        await command.reply(this.queue[command.server.id].map((t: Track) => `•**${t.info.title}** requested by ${t.rqdBy?.username}`).join("\n"))
    }
    join = async (command: Command) => {
        if (command.member.voice.channel) {
            const connection = await command.member.voice.channel.join()
            const nQ = new Queue(connection)
            this.queue[command.server.id] = nQ
        }
        else {
            await command.reply("Sorry -- you have to join a voice channel first.")
        }
    }
    pause = async (command: Command): Promise<void> => {
        let disp = this.queue[command.server.id].connection.dispatcher
        if (disp.paused) {
            disp.resume()
            await command.reply("Playing...")
        }
        else {
            disp.pause(false)
            await command.reply("Pausing...")
        }
    }
    skip = async (command: Command) => {
        var currQ = this.queue[command.server.id]
        command.reply("Skipping...")
        currQ.connection.dispatcher.end()
    }
    commands = {
        join: { key: this.join, desc: "" },
        play: { key: this.addQueue, desc: "" },
        add: { key: this.addQueue, desc: "" },
        stop: { key: this.stop, desc: "" },
        queue: { key: this.listQueue, desc: "" },
        pause: { key: this.pause, desc: "" },
        skip: { key: this.skip, desc: "" }
    }
}

export default new audio()