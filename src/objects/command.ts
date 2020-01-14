import { Channel, User, GuildMember, Guild as Server, Message, RichEmbed, GuildMemberEditData } from "discord.js"

export class Command {
    constructor(message: Message){
        let content = message['content'].slice(1).split(' ').filter(element => (element || element === '0'))
        this.channel = Command.clean(message['channel'])
        this.auth = Command.clean(message['author'])
        this.member = message['member']
        this.command = (content[0]).toLowerCase(),
        this.argument = content.slice(1).join(' ')
        this.args = content.slice(1)
        this.server = message['guild']
        this.message = message
    }
    public channel:Channel
    public auth:User
    public command:string
    public argument:string
    public server:Server
    public args:string[]
    public member:GuildMember
    private message:Message
    static clean = function<T>(str:T):T {
        str['id'] = str['id'].replace(/\W/g, '')
        return str
      }
    reply = (content:string|RichEmbed):void => {
        this.message.channel.send(content)
    }
}