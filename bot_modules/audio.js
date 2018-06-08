// dependencies
const ytdl = require('ytdl-core')
const Track = require('./audio/track')
const utils = require('./audio/playerCommands').commands
const Queue = require('./audio/playerCommands').Queue

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
            const queue = new Queue(connection)
            const collector = Command.channel.createMessageCollector(m => m.content.startsWith('+'))
            connection.parent = Command.channel
            if (connection.dispatcher) connection.dispatcher.on('end', () => { console.log('song over!!'); utils.skip(queue, audio.playFromUrl) })
            collector.on('collect', m => {
              console.log(m.content)
              console.log(queue.queue)
              switch (m.content.split(' ')[0].slice(1)) {
                case 'p':
                  m.channel.send(':play_pause:')
                  utils.togglePause(connection.dispatcher)
                  break
                case '!kill':
                  m.channel.send('terminating connection...')
                  utils.kill(connection)
                  break
                case 'q':
                  m.channel.send(utils.queue(queue))
                  break
                case '!qc':
                  utils.queueClear(queue)
                  m.channel.send('Clearing queue...')
                  break
                case 'skip':
                  utils.skip(queue, audio.playFromUrl)
                  m.channel.send('added to queue.')
                  break
                case 'play':
                case 'add':
                  var start = !connection.dispatcher || connection.dispatcher.destroyed
                  utils.queueAdd({ song: m.content.split(' ')[1], name: m.author.username }, queue)
                  if (start) {
                    utils.skip(queue, audio.playFromUrl)
                  }
                  break
                case '!play':
                  utils.forcePlay({ song: m.content.split(' ')[1], name: m.author.username }, queue, audio.playFromUrl)
                  break
                default:
                  break
              }
            })
          })
      } else {
        Command.channel.send('Join a voice channel first!')
      }
    }
  },
  getVideoFromUrl: (url) => {
    return new Promise(function (resolve, reject) {
      ytdl.getInfo(url, (err, info) => {
        if (err || !info) reject(err)
        resolve(new Track({video: info,
          url: url.replace(' ', ''),
          title: info.title || info.snippet.title}))
      })
    })
  },
  playFromUrl: (voiceConnection, url, playtext) => {
    const channel = voiceConnection.parent
    audio.getVideoFromUrl(url)
      .then(song => {
        if (voiceConnection) {
          channel.send(playtext || `Now playing ${song.title}...`)
          voiceConnection.playStream(ytdl(song.url, { quality: 'highestaudio', filter: 'audioonly' }), { passes: audio.passes, volume: audio.volume })
        } else {
          channel.send('Use `+join` to bring me into a voice channel first.')
        }
      })
  }
}
const commands = {
  join: audio.join
}
module.exports = {audio, commands, name, desc}
