import { IUser } from "./models/userSchema";
import { Document } from 'mongoose'
import { IFunction } from "../module";
import { db } from "./models/schema";
import { User as DiscordUser } from 'discord.js'
import { client } from '../../elbie'

export class User implements IUser {
    id: string
    name: string
    discordInfo: DiscordUser | undefined
    constructor(user: Document) {
        this.id = user.id
        this.name = user.get('name')
        User.getDiscordInfo(this.id, (discordUser: DiscordUser) => {
            this.discordInfo = discordUser
        })
    }
    static get(userID: IUser['id'], cb: IFunction): void {
        db.User.findById(userID).exec((err, user: Document) => {
            if (user === null || err) {
                throw err || new Error(`Could not be retrieved with given UserId ${userID}`)
            } else {
                cb(new User(user))
            }
        })
    }
    static getDiscordInfo(userID: IUser['id'], cb: IFunction): void {
        client.fetchUser(userID).then((discordUser:DiscordUser) => {
            if (discordUser) {
                cb(discordUser)
            }
        })
    }
}