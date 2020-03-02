import { Module, Command } from '../module'
import { client } from '../../elbie'

interface QueueObject {
    [index:string]:Queue
}

interface Queue extends Array<string>{
    [index:number]:string
}

class audio extends Module {
    name = 'audio'
    desc = ''
    queue:QueueObject = {}
    constructor(){
        super()
    }
   _play(string):void {

               
    }
    addQueue(command:Command):void{
        if (this.queue[command.server.id]){
            this.queue[command.server.id].push(command.argument)
        }
        else{
            this.queue[command.server.id] = [command.argument]
        }
    }
    stop(command:Command):void{

    }
    listQueue(command:Command):void{

    }
    play(command:Command):void{

    }
    commands = {
    }
}

export default new audio ()