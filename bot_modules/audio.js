// dependencies
const ytdl = require('ytdl-core')
const Track = require('./audio/track')

// module information
const name = 'audio'
const desc = 'functions to allow Elbie to stream audio thru a voice channel'
const audio = {
  passes: 3,
  volume: 0.5,
  join: (Command) => {
    if (!Command.server) {
      Command.channel.send('You have to be in a server to use voice!')
    } else {
      if (Command.member.voiceChannel) {
        console.log(`Connecting to voice in ${Command.server.name} in channel ${Command.channel.name}`)
        Command.member.voiceChannel.join()
          .then(connection => {
            Command.channel.send('Successfully connected to voice channel.')
          })
      } else {
        Command.channel.send('Join a voice channel first!')
      }
    }
  },
  getVideoFromUrl: (Command) => {
    const url = Command.argument
    return new Promise(function (resolve, reject) {
      ytdl.getInfo(url, (err, info) => {
        if (err || !info) reject(err)
        resolve(new Track({video: info,
          url: url.replace(' ', ''),
          title: info.title || info.snippet.title}))
      })
    })
  },
  playFromUrl: (Command, playtext) => {
    audio.getVideoFromUrl(Command)
      .then(song => {
        Command.channel.send(playtext || `Now playing ${song.title}...`)
        const player = Command.server.voiceConnection.playStream(ytdl(song.url, { quality: 'highestaudio', filter: 'audioonly' }), { passes: audio.passes, volume: audio.volume })
        player.on('error', (err) => {
          console.log(err)
          Command.channel.send('I ran into some kind of error...')
        })
        return player
      })
  }
}
const commands = {
  join: audio.join,
  play: audio.playFromUrl
}
module.exports = {audio, commands, name, desc}
