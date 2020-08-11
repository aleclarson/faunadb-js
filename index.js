module.exports = {
  ...require('fauna-lite'),
  ...require('./src/values'),
  Client: require('./src/Client'),
  Expr: require('./src/Expr'),
  PageHelper: require('./src/PageHelper'),
  RequestResult: require('./src/RequestResult'),
  errors: require('./src/errors'),
  query: require('./src/query'),
}
