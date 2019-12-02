var mstorage = require('multifeed-storage')
var ram = require('random-access-memory')
var Protocol = require('hypercore-protocol')
var replicate = require('../')

var s0 = mstorage(ram)
var s1 = mstorage(ram)

var localFeed = s0.createLocal()
localFeed.append('hi', function (err) {
  if (err) return console.error(err)
  s1.getOrCreateRemote(localFeed.key, function (err, remoteFeed) {
    if (err) return console.error(err)
    sync(localFeed, remoteFeed)
  })
})

function sync (localFeed, remoteFeed) {
  var p0 = new Protocol(true)
  var p1 = new Protocol(false)
  var r0 = replicate(s0, p0)
  var r1 = replicate(s1, p1)
  p0.pipe(p1).pipe(p0)
  remoteFeed.update(1, function () {
    remoteFeed.get(0, function (err, buf) {
      if (err) return console.error(err)
      console.log('message 0 replicated to remote log:', buf)
    })
  })
  r1.open(remoteFeed.key, { live: true, sparse: true })
}
