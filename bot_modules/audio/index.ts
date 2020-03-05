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
        this.getInfo()
    }
    getInfo = async () => {
        this.info = await ytdl.getBasicInfo(this.id)
        console.log(await this.info)
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
        console.log(track.info.title, track.info.author)
        connection.play(await ytdl(track.id), { type: 'opus' })

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
        this.queue[command.server.id].forEach(async (val: Track) => {
            console.log(val.id)
            if (await val.info) {
                command.reply(await val.info.title)
            }
            else {
                await val.getInfo()
                const info = await val.info
                command.reply(await info.title)
            }
        })
    }

    play = (command: Command): void => {
        this.addQueue(command)
        const next = this.queue[command.server.id].pop()
        if (next instanceof Track) this._play(this.queue[command.server.id].connection, next)
        command.reply(`Now playing: ${next?.info.title}`)

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
        else {
            command.reply("Sorry -- you have to join a voice channel first.")
        }
    }
    pause = (command: Command): void => {
        let disp = this.queue[command.server.id].connection.dispatcher
        if (disp.paused){
            disp.resume()
        }
        else{
            disp.pause(false)
        }
    }
    skip = async (command: Command) => {
        var currQ = this.queue[command.server.id]
        command.reply("Skipping...")
        currQ.connection.dispatcher.end()
    }
    commands = {
        join: { key: this.join, desc: "" },
        play: { key: this.play, desc: "" },
        add: {key: this.addQueue, desc:""},
        stop: { key: this.stop, desc: "" },
        queue: { key: this.listQueue, desc: "" },
        pause: { key: this.pause, desc: "" },
        skip: {key:this.skip, desc:""}
    }
}

export default new audio()