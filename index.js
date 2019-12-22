var { EventEmitter } = require('events')

module.exports = Replicate

function Replicate (storage, protocol, opts) {
  var self = this
  if (!(self instanceof Replicate)) {
    return new Replicate(storage, protocol, opts)
  }
  self._protocol = protocol
  self._storage = storage
  protocol.on('discovery-key', function (dkey) {
    storage.fromDiscoveryKey(dkey, function (err, key) {
      if (err) return self.emit('error', err)
      if (!key) return
      storage.get(key, function (err, feed) {
        if (err) self.emit('error', err)
        else feed.replicate(self._protocol, opts)
      })
    })
  })
}
Replicate.prototype = Object.create(EventEmitter.prototype)

Replicate.prototype.open = function (key, opts) {
  var self = this
  if (!opts) opts = {}
  self._storage.getOrCreateRemote(key, function (err, feed) {
    if (err) return self.emit('error', err)
    feed.replicate(self._protocol, opts)
  })
}
