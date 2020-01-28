import { Command } from "../objects/command"
export interface IFunction {
    (...args: any[]): any | void;
}

export interface ModuleCommand {
    (cmd:Command, cb?:IFunction):void
}

export interface ICommands {
    [index: string]: { desc: string, key: ModuleCommand }
}

export abstract class Module {
    name: string = ""
    desc: string = ""
    abstract commands: ICommands
}