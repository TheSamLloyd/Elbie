export class Module {
    public name:string
    public desc:string
    public functions:object
    public commands:object
    constructor(public obj:{
        name: string,
        desc: string,
        functions: object,
        commands: object}) { 
            this.name = obj.name
            this.desc = obj.desc
            this.functions = obj.functions
            this.commands = obj.commands
        }
    }
