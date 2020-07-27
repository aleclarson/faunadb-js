import { values } from './values'

export type Json =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray
  | values.Value

export interface JsonObject {
  readonly [property: string]: Json | undefined
}

export interface JsonArray extends ReadonlyArray<Json> {}

export const FaunaJSON: {
  stringify: (input: any, pretty?: boolean) => string
  parse: (input: string) => any
}
