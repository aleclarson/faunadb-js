'use strict'

var { FaunaJSON, toFaunaType } = require('fauna-lite')

var { SetRef, Query, Bytes } = require('./values')
var Expr = require('./Expr')

var setKey = '@set'
var bytesKey = '@bytes'
var queryKey = '@query'

var faunaParser = FaunaJSON.parser
FaunaJSON.parser = function(key, value) {
  if (value && typeof value === 'object') {
    if (setKey in value) {
      return new SetRef(value[setKey])
    }
    if (bytesKey in value) {
      return new Bytes(value[bytesKey])
    }
    if (queryKey in value) {
      return new Query(value[queryKey])
    }
    return faunaParser(key, value)
  }
  return value
}

var faunaReplacer = FaunaJSON.replacer
FaunaJSON.replacer = function(key, value) {
  if (!value) {
    return value
  }
  if (value.constructor === Expr) {
    return value.raw
  }
  switch (toFaunaType(value)) {
    case SetRef:
      return { [setKey]: value.set }
    case Bytes:
      return { [bytesKey]: value.bytes }
    case Query:
      return { [queryKey]: value.query }
  }
  return faunaReplacer(key, value)
}

function toJSON(object, pretty) {
  return JSON.stringify(object, FaunaJSON.replacer, pretty ? '  ' : undefined)
}

module.exports = {
  toJSON: toJSON,
  parseJSON: FaunaJSON.parse,
}
