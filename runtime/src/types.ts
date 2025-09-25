import { Normalize } from "./utils";

export type GlobalBase = {
  types: Record<string, AnyValueType>;
  flows: Record<string, AnyFlow>;
};

export type ValueTypes<
  Global extends GlobalBase,
  Arguments extends Record<string, keyof Global["types"]>
> = Normalize<{
  [K in keyof Arguments]: Global["types"][Arguments[K]] extends ValueType<
    string,
    infer T
  >
    ? T
    : never;
}>;

export interface Flow<
  FlowName extends string,
  Inputs extends Record<string, string>,
  Outputs extends Record<string, string>
> {
  name: FlowName;
  inputs: Inputs;
  outputs: Outputs;

  processor<Global extends GlobalBase>(
    props: ValueTypes<Global, Inputs>
  ): Promise<ValueTypes<Global, Outputs>>;
}

export interface ValueType<TypeName extends string, T> {
  validator(value: unknown): value is T;
  typeName: TypeName;
}

export type AnyFlow = Flow<
  string,
  Record<string, string>,
  Record<string, string>
>;

export type AnyValueType = ValueType<string, any>;
