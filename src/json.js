const { toJSON, parseJSON } = require('./_json')

exports.FaunaJSON = {
  stringify: toJSON,
  parse: parseJSON,
}
