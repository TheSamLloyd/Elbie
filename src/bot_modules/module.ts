import { Command } from "../objects/command"
export interface IFunction{
    (cmd:Command, ...args:any[] ) : any | void;
}
interface ICommands {
    [index : string] : {desc:string, key:string}
}

interface IFunctions {
    [index : string] : IFunction
}

export interface Module {
    name:string
    desc:string
    functions:IFunctions
    commands:ICommands
}