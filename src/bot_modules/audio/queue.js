// queuing class
var Queue = class Queue {
  constructor () {
    this.array = []
  }
  add (track) {
    this.array.unshift(track)
  }
  getNext (track) {
    return this.array.pop()
  }
  clear () {
    this.array = []
  }
  display () {
    var output = []
    this.array.reverse().forEach((val, index) => {
      output.push([index + 1, val.info, val.requestor])
    })
    return output
  }
  length () {
    return this.array.length
  }
}
var Track = class Track {
  constructor (info, object, requestor) {
    this.info = info
    this.object = object
    this.requestor = requestor
  }
}
module.exports = { Queue, Track }
