module.exports = {
  Client: require('./src/Client'),
  Expr: require('./src/Expr'),
  PageHelper: require('./src/PageHelper'),
  RequestResult: require('./src/RequestResult'),
  FaunaJSON: require('./src/json').FaunaJSON,

  clientLogger: require('./src/clientLogger'),
  errors: require('./src/errors'),
  values: require('./src/values'),
  query: require('./src/query'),
}
