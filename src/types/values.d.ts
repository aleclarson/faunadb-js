import { Ref, FaunaTime, FaunaDate } from 'fauna-lite'
import Expr from './Expr'

export type Json =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray
  | FaunaVal
  | Expr

export type JsonObject = {
  [key: string]: Json | undefined
}

export interface JsonArray extends ReadonlyArray<Json> {}

export type FaunaVal = Ref | SetRef | FaunaTime | FaunaDate | Bytes | Query

export class SetRef<T = any> {
  constructor(value: string)

  set: Expr

  /** This enforces type nominality. */
  protected _ref: { type: 'Set'; data: T }
}

export class Bytes {
  constructor(value: string)
  constructor(value: ArrayBuffer)
  constructor(value: Uint8Array)

  bytes: string

  /** This enforces type nominality. */
  protected _type: 'Bytes'
}

export class Query {
  constructor(value: object)

  query: Expr

  /** This enforces type nominality. */
  protected _type: 'Query'
}

/** The materialized data of a page. */
export interface Page<T = any> {
  data: T[]
  after?: Expr
  before?: Expr
}

/** The materialized data of a collection. */
export interface Collection<T extends object = any, Meta extends object = any> {
  ref: CollectionRef<T, Meta>
  ts: number
  name: string
  data: Meta
  permissions?: JsonObject
  history_days: number | null
  ttl_days?: number
}

/** The materialized data of a document. */
export interface Document<T extends object = any> {
  data: T
  ref: DocumentRef<T>
  ts: number
}

/** The materialized data of an index. */
export interface Index<T extends object = any, Meta extends object = any> {
  ref: IndexRef<T, Meta>
  ts: number
  name: string
  data: Meta
  source: CollectionRef | any[]
  partitions: number
  active: boolean
  serialized?: boolean
  unique?: boolean
  terms?: any[]
  values?: any[]
  permissions?: JsonObject
}

/** The materialized data of a function. */
export interface Function<Return = any, Meta extends object = any> {
  ref: FunctionRef<Return, Meta>
  ts: number
  name: string
  data: Meta
  body: JsonObject
  role?: any
}

/** The ref to a collection. */
export abstract class CollectionRef<
  T extends object = any,
  Meta extends object = any
> extends Ref<Collection<T, Meta>> {
  /** This enforces type nominality. */
  protected _ref: { type: 'Collection'; data: Collection<T, Meta> }
}

/** The ref to a document. */
export abstract class DocumentRef<T extends object = any> extends Ref<
  Document<T>
> {
  /** This enforces type nominality. */
  protected _ref: { type: 'Document'; data: Document<T> }
}

/** The ref to an index. */
export abstract class IndexRef<
  T extends object = any,
  Meta extends object = any
> extends Ref<Index<T, Meta>> {
  /** This enforces type nominality. */
  protected _ref: { type: 'Index'; data: Index<T, Meta> }
}

/** The ref to a function. */
export abstract class FunctionRef<
  Return = any,
  Meta extends object = any
> extends Ref<Function<Return, Meta>> {
  /** This enforces type nominality. */
  protected _ref: { type: 'Function'; data: Function<Return, Meta> }
}
