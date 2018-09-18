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
      if (Command.member.voiceChannel) {
        console.log(`Connecting to voice in ${Command.server.name} in channel ${Command.channel.name}`)
        Command.member.voiceChannel.join()
          .then(connection => {
            console.log('Successfully connected to voice channel.')
            let stream = ytdl(Command.argument)
            ytdl.getInfo(Command.argument, (err, info) => {
              if (err) console.log(err)
              else {
                Command.channel.send(`Playing ${info.title}`)
                const dispatcher = connection.playStream(stream, {audioonly: true})
                dispatcher.on('end', () => {
                  Command.member.voiceChannel.leave()
                })
              }
            })
          })
      }
    }
  },
  stop: (Command) => {
    if (Command.member.voiceChannel) {
      try {
        Command.member.voiceChannel.leave()
      } catch (err) {
        console.log(err)
        Command.channel.send("I can't stop if I'm not playing anything")
      }
    }
  }
}

const commands = {
  play: audio.play,
  stop: audio.stop
}
module.exports = { audio, commands, name, desc }
