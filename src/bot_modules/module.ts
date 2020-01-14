import { Command } from "../objects/command"
export interface ICallback{
    <T>(err : Error, res : T ) : T | void
    <T>(res: T): void | T
}
interface ICommands {
    [index : string] : {desc:string, key:string}
}

interface IFunctions {
    [index : string] : IFunction
}

export interface IFunction {
    (cmd:Command, cb?:ICallback):ICallback|void
}

export interface Module {
    name:string
    desc:string
    functions:IFunctions
    commands:ICommands
}