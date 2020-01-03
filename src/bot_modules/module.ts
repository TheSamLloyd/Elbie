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
            Object.keys(obj.functions).forEach(func=>{
                this[func]=func
            })
            this.commands = obj.commands
        }
    }
