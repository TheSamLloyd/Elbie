class Queue {
  constructor (conn) {
    this.conn = conn
    this.queue = []
  }
  pop () {
    return this.queue.pop()
  }
  push (song) {
    return this.queue.push(song)
  }
  shift () {
    return this.queue.shift()
  }
  clear () {
    this.queue = []
  }
  q () {
    return this.queue.map((item, index) => `${index + 1}. ${item.song} requested by ${item.name}`).join('\n')
  }
  connection () {
    return this.conn
  }
  length () {
    return this.queue.length
  }
}

const commands = {
  togglePause: (dispatcher) => {
    dispatcher.paused ? dispatcher.resume() : dispatcher.pause()
  },
  kill: (connection) => {
    connection.disconnect()
  },
  queueAdd: (song, queue) => {
    queue.push(song)
  },
  queue: (queue) => {
    return queue.q()
  },
  queueClear: (queue) => {
    queue.clear()
  },
  skip: (queue, playCommand) => {
    playCommand(queue.connection(), queue.shift()['song'])
  },
  forcePlay: (newSong, queue, playCommand) => {
    queue.push(newSong)
    playCommand(queue.connection(), queue.pop()['song'])
  }
}
module.exports = {commands, Queue}
