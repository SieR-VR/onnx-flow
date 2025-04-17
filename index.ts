type GlobalBase = {
  types: Record<string, AnyValueType>;
};

type ValueTypes<
  Global extends GlobalBase,
  Arguments extends Record<string, keyof Global["types"]>
> = {
  [K in keyof Arguments]: Global["types"][Arguments[K]] extends ValueType<
    string,
    infer T
  >
    ? T
    : never;
};

interface Flow<
  Global extends GlobalBase,
  Inputs extends Record<string, keyof Global["types"]>,
  Outputs extends Record<string, keyof Global["types"]>
> {
  inputs: Inputs;
  outputs: Outputs;

  processor: (
    props: ValueTypes<Global, Inputs>
  ) => Promise<ValueTypes<Global, Outputs>>;
}

interface ValueType<TypeName extends string, T> {
  validator(value: unknown): value is T;
  typeName: TypeName;
}

type AnyValueType = ValueType<string, any>;

type RegisterValueType<
  Global extends GlobalBase,
  TargetValueType extends AnyValueType
> = TargetValueType extends ValueType<infer TypeName, infer T>
  ? {
      [K in keyof Global]: K extends "types"
        ? Global["types"] & {
            [K2 in TypeName]: ValueType<K2, T>;
          }
        : Global[K];
    }
  : Global;

class App<Global extends GlobalBase> {
  state: Global;
  flows: Record<
    string,
    Flow<Global, Record<string, string>, Record<string, string>>
  >;

  constructor(state: Global) {
    this.state = state;
  }

  static create<Global extends GlobalBase>(state: Global): App<Global> {
    return new App<Global>(state);
  }

  registerType<TypeName extends string, T>(
    typeName: TypeName,
    validator: (value: unknown) => value is T
  ): App<RegisterValueType<Global, ValueType<TypeName, T>>> {
    this.state.types[typeName] = { validator, typeName };
    return this as App<RegisterValueType<Global, ValueType<TypeName, T>>>;
  }

  registerFlow<
    Inputs extends Record<string, keyof Global["types"]>,
    Outputs extends Record<string, keyof Global["types"]>
  >(
    inputs: Inputs,
    outputs: Outputs,
    processor: (
      props: ValueTypes<Global, Inputs>
    ) => Promise<ValueTypes<Global, Outputs>>
  ): App<Global> {
    this.flows["flow"] = {
      inputs,
      outputs,
      processor,
    } as Flow<Global, Record<string, string>, Record<string, string>>;
    return this;
  }
}

const app = App.create({
  types: {},
});

app
  .registerType("number", (value) => typeof value === "number")
  .registerFlow({ a: "number" }, { b: "number" }, async ({ a }) => {
    return { b: a };
  });
