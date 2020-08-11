'use strict'

var { tagFaunaType } = require('fauna-lite')

var base64 = require('base64-js')
var deprecate = require('util-deprecate')
var errors = require('./errors')
var Expr = require('./Expr')

class SetRef {
  constructor(value) {
    this.set = value
  }
}

tagFaunaType(SetRef)

class Bytes {
  constructor(value) {
    if (value instanceof ArrayBuffer) {
      value = new Uint8Array(value)
    }
    if (value instanceof Uint8Array) {
      value = base64.fromByteArray(value)
    }
    this.bytes = value
  }
}

tagFaunaType(Bytes)

class Query {
  constructor(value) {
    this.query = value
  }
}

tagFaunaType(Query)

module.exports = {
  SetRef: SetRef,
  Bytes: Bytes,
  Query: Query,
}
