var test = require('tape')
var mstorage = require('multifeed-storage')
var ram = require('random-access-memory')
var replicate = require('../')
var Protocol = require('hypercore-protocol')

test('sync', function (t) {
  t.plan(5)
  var s0 = mstorage(ram)
  var s1 = mstorage(ram)
  s0.createLocal(function (err, feed0) {
    t.ifError(err)
    s1.getOrCreateRemote(feed0.key, function (err, feed1) {
      t.ifError(err)
      feed0.append('hi', function (err) {
        t.ifError(err)
        sync(feed0, feed1)
      })
    })
  })
  function sync (feed0, feed1) {
    var p0 = new Protocol(true)
    var p1 = new Protocol(false)
    var r0 = replicate(s0, p0)
    var r1 = replicate(s1, p1)
    p0.pipe(p1).pipe(p0)
    feed1.update(1, function () {
      feed1.get(0, function (err, buf) {
        t.ifError(err)
        t.deepEqual(buf, Buffer.from('hi'))
      })
    })
    r1.open(feed0.key, { live: true, sparse: true })
  }
})
