import { Module, Command } from '../module'
import ytdl from 'ytdl-core-discord'
import { User, VoiceConnection } from 'discord.js'

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
    video?: any
    info?: any
    options: {} = {}
    constructor({ rqdBy, id, options }: { rqdBy: User; id: string, options?: {} }) {
        if (options == {}) {
            options = { type: 'opus', filter: 'audioonly' }
        }
        this.rqdBy = rqdBy
        this.id = id
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
    private _play = async (connection: VoiceConnection, track: Track) => {
        console.log(track)
        connection.play(await ytdl(track.id), { type: 'opus' })
        track.info = await ytdl.getBasicInfo(track.id)

    }
    addQueue = (command: Command): void => {
        if (this.queue[command.server.id]) {
            this.queue[command.server.id].push(new Track({ rqdBy: command.auth, id: command.argument }))
        }
    }
    stop = (command: Command): void => {
        this.queue[command.server.id].connection.disconnect()
        command.reply("Closing connection!")
    }
    listQueue = async (command: Command) => {
        const f = async () => {
            return this.queue[command.server.id].map(async (a:Track)=> {
                return await ytdl.getBasicInfo(a.id)
            })
        }
        command.reply((await f()).join("\n"))
    }

    play = (command: Command): void => {
        this.addQueue(command)
        const next = this.queue[command.server.id].pop()
        if (next instanceof Track) this._play(this.queue[command.server.id].connection, next)
    }
    join = async (command: Command) => {
        if (command.member.voice.channel) {
            const connection = await command.member.voice.channel.join()
            const nQ = new Queue(connection)
            this.queue[command.server.id] = nQ
            console.log(this.queue)
            connection.on('finish', () => {
                const next = this.queue[command.server.id].pop()
                if (next instanceof Track) this._play(connection, next)
            })
        }
    }
    commands = {
        join: { key: this.join, desc: "" },
        play: { key: this.play, desc: "" },
        stop: { key: this.stop, desc: "" },
        queue: { key: this.listQueue, desc: "" }
    }
}

export default new audio()