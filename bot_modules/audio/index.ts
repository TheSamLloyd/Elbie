import { Module, Command } from '../module'
import ytdl from 'ytdl-core-discord'
import { User, VoiceConnection, Message, MessageEmbed } from 'discord.js'

interface QueueObject {
    [index: string]: Queue
}

interface IQueue extends Array<Track | VoiceConnection> {
    [index: number]: Track
    connection: VoiceConnection
    reply: (content: string | MessageEmbed) => Promise<Message>
}

class Queue extends Array<Track> implements IQueue {
    [index: number]: Track
    connection: VoiceConnection
    reply: (content: string | MessageEmbed) => Promise<Message>
    constructor(connection: VoiceConnection, reply: (content: string | MessageEmbed) => Promise<Message>) {
        super()
        this.connection = connection
        this.reply = reply
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
        this.stream = await ytdl(this.id, { filter: 'audioonly', highWaterMark: 1 << 25 })
    }
}

class audio extends Module {
    name = 'audio'
    desc = 'Commands to allow Elbie to play audio from youtube'
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
        await currQ.reply(`Now playing **${track.info.title}** requested by ${track.rqdBy?.username}`)
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
        dispatcher.on('debug', (info) => {
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
            if (currQ.length == 1) {
                this._play(currQ)
            }
            else {
                command.reply(`Queued **${t.info.title}** requested by ${t.rqdBy?.username}`)
            }
        } else {
            await command.reply("Sorry -- you have to join a voice channel first.")
        }
    }
    stop = async (command: Command): Promise<void> => {
        if (this.queue[command.server.id]) {
            this.queue[command.server.id].connection.disconnect()
            await command.reply("Closing connection!")
        }
        else {
            await command.reply("Sorry -- you have to join a voice channel first.")
        }
    }
    listQueue = async (command: Command) => {
        if (this.queue[command.server.id]) {
            await command.reply(this.queue[command.server.id].map((t: Track, index: number) => `${index + 1}: **${t.info.title}** requested by ${t.rqdBy?.username}`).join("\n"))
        }
    }
    join = async (command: Command) => {
        if (command.member.voice.channel) {
            const connection = await command.member.voice.channel.join()
            const nQ = new Queue(connection, command.reply)
            this.queue[command.server.id] = nQ
        }
        else {
            await command.reply("Sorry -- you have to join a voice channel first.")
        }
    }
    pause = async (command: Command): Promise<void> => {
        var currQ = this.queue[command.server.id]
        if (currQ) {
            let disp = this.queue[command.server.id].connection.dispatcher
            if (disp.paused) {
                disp.resume()
                await command.reply("Playing...")
            }
            else {
                disp.pause(true)
                await command.reply("Pausing...")
            }
        }
        else {
            command.reply("I can't take voice commands unless I'm in a voice channel. Join one and use `+join` to add me.")
        }

    }
    skip = async (command: Command) => {
        var currQ = this.queue[command.server.id]
        if (currQ) {
            command.reply("Skipping...")
            currQ.connection.dispatcher.end()
        }
        else {
            command.reply("I can't take voice commands unless I'm in a voice channel. Join one and use `+join` to add me.")
        }
    }
    commands = {
        join: { key: this.join, desc: "This must be used before any other voice command -- this will add Elbie to the voice channel you're in." },
        play: { key: this.addQueue, desc: "Providing her a youtube video ID or URL will play it right away if nothing is queued or add it to the bottom of the queue." },
        add: { key: this.addQueue, desc: "Alias of +play" },
        stop: { key: this.stop, desc: "Stops playback and ends connection." },
        queue: { key: this.listQueue, desc: "Shows the current queue by video title and requestor." },
        pause: { key: this.pause, desc: "Pauses/unpauses stream." },
        skip: { key: this.skip, desc: "Ends current song and moves to next." }
    }
}

export default new audio()