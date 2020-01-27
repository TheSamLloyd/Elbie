import { Command } from "../objects/command"
export interface IFunction{
    (...args:any[] ) : any | void;
}
interface ICommands {
    [index : string] : {desc:string, key:IFunction}
}

export interface Module {
    name:string
    desc:string
    commands:ICommands
}