// dependencies
const ytdl = require('ytdl-core')

// module information
const name = 'audio'
const desc = 'functions to allow Elbie to stream audio thru a voice channel'
const audio = {
  passes: 3,
  volume: 0.5,
  play: (Command) => {
    if (!Command.server) {
      Command.channel.send('You have to be in a server to use voice!')
    } else {
      if (Command.member.voiceChannel && !Command.member.voiceChannel.connection) {
        console.log(`Connecting to voice in ${Command.server.name} in channel ${Command.channel.name}`)
        Command.member.voiceChannel.join()
          .then(connection => {
            audio.fetchplay(Command, connection)
          })
      } else {
        if (Command.member.voiceChannel.connection) {
          console.log('skip')
          audio.fetchplay(Command, Command.member.voiceChannel.connection)
        }
      }
    }
  },
  stop: (Command) => {
    if (Command.member.voiceChannel.connection.speaking) {
      try {
        Command.member.voiceChannel.leave()
      } catch (err) {
        console.log(err)
        Command.channel.send("I can't stop if I'm not playing anything")
      }
    }
  },
  fetchplay: (Command, connection) => {
    Command.channel.send('preparing song...')
      .then(message => {
        let stream = ytdl(Command.argument)
        ytdl.getInfo(Command.argument, (err, info) => {
          if (err) {
            message.delete()
            console.log(err)
            Command.channel.send(':-/')
          } else {
            if (connection.dispatcher) {
              connection.dispatcher.end(true)
            }
            message.delete()
            Command.channel.send(`Playing ${info.title}`)
            const dispatcher = connection.playStream(stream, { audioonly: true })
            dispatcher.on('end', (reason) => {
              if (!reason) Command.member.voiceChannel.leave()
            })
            connection.on('warn', (warning) => {
              console.warn(warning)
            })
          }
        })
      })
  }
}

const commands = {
  play: audio.play,
  stop: audio.stop
}
module.exports = { audio, commands, name, desc }
