import { SetRef, Page, JsonObject, FaunaVal } from './values'

export default Expr

export class Expr<T = any> {
  constructor(obj: JsonObject)

  static toString(expr: Expr, compact?: boolean): string
  static toString(
    expr: Expr,
    options?: {
      compact?: boolean
      map?: (str: string, keyPath: string[]) => string
    }
  ): string

  /** This enforces type nominality. */
  private _type: T
}

/** Useful for recursive mapped types */
type Keys<T> = Extract<keyof T, string>

/** Use `[T] extends [Any]` to know if a type parameter is `any` */
declare class Any {
  private _: never
}

/** Materialize an `Expr` type into its result type. */
export type Materialize<T> = [T] extends [Any | Expr<Any>]
  ? any
  : T extends ExprVal<Lambda>
  ? never
  : T extends FaunaVal
  ? T
  : T extends Expr<infer U>
  ? { [P in Keys<U>]: Materialize<U> }[Keys<U>]
  : T extends object
  ? { [P in keyof T]: Materialize<T[P]> }
  : T

/**
 * Evaluate the given type as an expression. Since nominal subtypes
 * of `Expr` (like `Ref`) are handled by `ToExpr`, they are omitted.
 * Use `Materialize` if you need them too.
 */
type Eval<T> = T extends Expr<infer U>
  ? (Expr extends T ? U : never)
  : T extends Lambda | FaunaVal
  ? T
  : T extends object
  ? { [P in keyof T]: Eval<T[P]> }
  : T

/** Convert all non-`Expr` types into `Expr` types */
export type ToExpr<T> = [T] extends [Any | Expr<Any>]
  ? Expr
  :
      | Extract<T, Expr>
      // Merge plain `Expr` types with primitive types
      | (Eval<T> extends infer U
          ? ([U] extends [void] ? never : Expr<U>)
          : never)

/** Add support for `Expr` types to any type. */
export type ExprVal<T = unknown> =
  | ToExpr<T>
  | (T extends Expr
      ? never
      : T extends Lambda | FaunaVal
      ? T
      : T extends object
      ? { [P in keyof T]: ExprVal<T[P]> }
      : T)

export type Lambda<In extends any[] = any[], Out = any> = (
  ...args: { [P in keyof In]: ToExpr<In[P]> }
) => ToExpr<Out>

export namespace Expr {
  /** The expression type for the `path` argument of `q.Select` */
  export type KeyPath = ExprVal<string | number | (number | string)[]>

  /** The expression type for the `lambda` argument of `q.Filter` */
  export type Filter<T> = ExprVal<Lambda<[T], boolean>>

  /** The expression type that can be mapped with `q.Map` */
  export type Mappable<T = any> = ExprVal<T[]> | Expr<Page<T>>

  /** The expression type returned by `q.Map` */
  export type MapResult<T extends Mappable, Out> = T extends Page
    ? Page<Out>
    : Expr<Out[]>

  /** The expression type for an iterable collection of values */
  export type Iterable<T = any> = ExprVal<SetRef<T>> | Mappable<T>

  /** The expression type for a single value from an iterable */
  export type IterableVal<T extends Iterable> = T extends Iterable<infer U>
    ? ToExpr<U>
    : unknown
}
