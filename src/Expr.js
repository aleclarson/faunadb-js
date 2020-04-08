'use strict'

var util = require('./_util')

/**
 * A representation of a FaunaDB Query Expression. Generally, you shouldn't need
 * to use this class directly; use the Query helpers defined in {@link module:query}.
 *
 * @param {Object} obj The object that represents a Query to be treated as an Expression.
 * @constructor
 */
function Expr(obj) {
  this.raw = obj
}

Expr.prototype._isFaunaExpr = true

Expr.prototype.toJSON = function() {
  return this.raw
}

var varArgsFunctions = [
  'Do',
  'Call',
  'Union',
  'Intersection',
  'Difference',
  'Equals',
  'Add',
  'BitAnd',
  'BitOr',
  'BitXor',
  'Divide',
  'Max',
  'Min',
  'Modulo',
  'Multiply',
  'Subtract',
  'LT',
  'LTE',
  'GT',
  'GTE',
  'And',
  'Or',
]

// FQL function names come across the wire as all lowercase letters
// (like the key of this object). Not all are properly snake-cased
// on the Core side, which causes improper capitalizations.
//
// JS Driver patch: https://faunadb.atlassian.net/browse/FE-540
// Core update: https://faunadb.atlassian.net/browse/ENG-2110

var specialCases = {
  containsstr: 'ContainsStr',
  containsstrregex: 'ContainsStrRegex',
  endswith: 'EndsWith',
  findstr: 'FindStr',
  findstrregex: 'FindStrRegex',
  gt: 'GT',
  gte: 'GTE',
  is_nonempty: 'IsNonEmpty',
  lowercase: 'LowerCase',
  lt: 'LT',
  lte: 'LTE',
  ltrim: 'LTrim',
  rtrim: 'RTrim',
  regexescape: 'RegexEscape',
  replacestr: 'ReplaceStr',
  replacestrregex: 'ReplaceStrRegex',
  startswith: 'StartsWith',
  substring: 'SubString',
  titlecase: 'TitleCase',
  uppercase: 'UpperCase',
}

var keyPath = []
var compact = false
var printDepth = 0

var indent = function(input) {
  if (typeof input === 'function') {
    printDepth += 1
    var output = input()
    printDepth -= 1
    return output
  }
  if (compact) {
    return input
  }
  let indent = ''
  for (let i = 0; i < 2 * printDepth; i++) {
    indent += i % 2 ? '' : '・'
  }
  return indent + input
}

var eol = function(input) {
  return input + (compact ? '' : '\n')
}

var isCompact = function(expr) {
  return !(expr instanceof Expr)
}

var printExpr = function(expr, options) {
  if (util.checkInstanceHasProperty(expr, '_isFaunaExpr')) {
    if ('value' in expr) {
      return expr.toString()
    }
    expr = expr.raw
  }

  if (expr == null) {
    return String(expr)
  }

  switch (typeof expr) {
    case 'string':
      return JSON.stringify(expr)
    case 'boolean':
    case 'number':
    case 'symbol':
      return String(expr)
  }

  if (!options) {
    options = {}
  } else if (options === true) {
    options = { compact: true }
  }

  var map =
    options.map ||
    function(str) {
      return str
    }

  var printArgs = function(args, toStr) {
    var length = args.length
    return args
      .map(function(arg, i) {
        keyPath.push(i)
        arg = map(toStr(arg), keyPath)
        keyPath.pop()
        if (i < length - 1) {
          arg += eol(',')
        }
        return i > 0 ? indent(arg) : arg
      })
      .join('')
  }

  var printArray = function(array, toStr) {
    if (!array.length) {
      return '[]'
    }
    var wasCompact = compact
    if (!wasCompact) {
      compact = array.every(isCompact)
    }
    var str =
      eol('[') +
      indent(function() {
        var length = array.length
        return array
          .map(function(value, i) {
            keyPath.push(i)
            value = map(toStr(value), keyPath)
            keyPath.pop()
            return indent(value) + (compact && i === length - 1 ? '' : eol(','))
          })
          .join('')
      }) +
      indent(']')
    compact = wasCompact
    return str
  }

  if (Array.isArray(expr)) {
    return printArray(expr, function(item) {
      return printExpr(item, options)
    })
  }

  var printObject = function(obj) {
    if (obj instanceof Expr) {
      obj = obj.raw
    }
    var keys = Object.keys(obj)
    var length = keys.length
    if (!length) {
      return '{}'
    }
    return (
      eol('{') +
      indent(function() {
        return keys
          .map(function(key, i) {
            keyPath.push(key)
            var value = map(printExpr(obj[key], options), keyPath)
            keyPath.pop()
            return (
              indent(key + ':' + (compact ? '' : ' ') + value) +
              (compact && i === length - 1 ? '' : eol(','))
            )
          })
          .join('')
      }) +
      indent('}')
    )
  }

  if ('object' in expr) {
    return printObject(expr['object'])
  }

  // Versioned queries/lambdas will have an api_version field.
  // We want to prevent it from being parsed and displayed as:
  // Query(ApiVersion("3", "X", Var("X")))
  var keys = Object.keys(expr).filter(
    expression => expression !== 'api_version'
  )
  var fn =
    specialCases[keys[0]] ||
    keys[0]
      .split('_')
      .map(function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1)
      })
      .join('')

  var wasCompact = compact
  if (!wasCompact) {
    compact = options.compact || keys.every(key => isCompact(expr[key]))
  }

  var args = indent(function() {
    var length = keys.length
    return keys.map(function(key, i) {
      keyPath.push(key)
      var arg = expr[key]
      var value = map(
        fn + key === 'Dodo'
          ? printArgs(arg.raw, printExpr)
          : fn + key === 'Letlet'
          ? Array.isArray(arg)
            ? printArray(arg, printObject)
            : printObject(arg)
          : printExpr(arg, options),
        keyPath
      )
      keyPath.pop()
      return indent(value) + (compact && i === length - 1 ? '' : eol(','))
    })
  })

  var shouldReverseArgs = ['Filter', 'Map', 'Foreach'].indexOf(fn) != -1
  if (shouldReverseArgs) {
    args.reverse()
  }

  var out = eol(fn + '(') + args.join('') + indent(')')
  compact = wasCompact
  return out
}

Expr.toString = printExpr

module.exports = Expr
