import { Channel, User, Guild as Server, Message, MessageEmbed, GuildMember } from "discord.js"

interface DiscordObject {
    id: string
}
export class Command {
    constructor(message: Message) {
        let content = message.content.slice(1).split(' ').filter(element => (element || element === '0'))
        this.channel = Command.clean(message.channel)
        this.auth = Command.clean(message.author)
        this.member = message.member || <GuildMember>{}
        this.command = (content[0]).toLowerCase()
        this.argument = content.slice(1).join(' ')
        this.args = content.slice(1)
        this.server = message.guild || <Server>{}
        this.message = message
    }
    public channel: Channel
    public auth: User
    public command: string
    public argument: string
    public server: Server
    public args: string[]
    public member: GuildMember
    private message: Message
    static clean = function <T extends DiscordObject>(str: T): T {
        str.id = str.id.replace(/\W/g, '')
        return str
    }
    reply = async (content: string | MessageEmbed): Promise<Message> => {
        return await this.message.channel.send(content)
    }
}
export interface IFunction {
    (...args: any[]): any | void;
}

export interface ModuleCommand {
    (cmd: Command, cb?: IFunction): void
}

export interface ICommands {
    [index: string]: { desc: string, key: ModuleCommand }
}

export abstract class Module {
    name: string = ""
    desc: string = ""
    abstract commands: ICommands
}