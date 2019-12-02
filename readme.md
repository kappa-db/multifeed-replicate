# multifeed-replicate

replicate feeds contained in a [multifeed-storage][]

[multifeed-storage]: https://github.com/kappa-db/multifeed-storage

# example

``` js
var mstorage = require('multifeed-storage')
var ram = require('random-access-memory')
var Protocol = require('hypercore-protocol')
var replicate = require('multifeed-replicate')

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
```

# api

``` js
var replicate = require('multifeed-replicate')
```

## var r = replicate(storage, protocol, opts)

Create a new replicate instance `r` from a [multifeed-storage][] instance,
a [hypercore-protocol][] instance, and `opts` which are forwarded to the
[hypercore][] replication method.

[hypercore-protocol]: https://github.com/mafintosh/hypercore-protocol
[hypercore]: https://github.com/mafintosh/hypercore

## r.open(key, opts)

Open a channel to replicate a feed by its `key`. The feed must have been created
(locally or remotely) first.

## r.on('error', function (err) {})

Catch internal error events.

# install

npm install multifeed-replicate

# license

BSD
