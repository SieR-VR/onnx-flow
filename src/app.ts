import {
  GlobalBase,
  AnyValueType,
  AnyFlow,
  ValueType,
  ValueTypes,
  Flow,
} from "./types";
import { Normalize } from "./utils";

type RegisterValueType<
  Global extends GlobalBase,
  TargetValueType extends AnyValueType
> = Normalize<
  TargetValueType extends ValueType<infer TypeName, infer T>
    ? {
        [K in keyof Global]: K extends "types"
          ? Global["types"] & {
              [K2 in TypeName]: ValueType<K2, T>;
            }
          : Global[K];
      }
    : Global
>;

type RegisterFlow<
  Global extends GlobalBase,
  FlowName extends string,
  Inputs extends Record<string, keyof Global["types"]>,
  Outputs extends Record<string, keyof Global["types"]>
> = Normalize<{
  [K in keyof Global]: K extends "flows"
    ? Global["flows"] & {
        [K2 in FlowName]: Inputs extends Record<string, string>
          ? Outputs extends Record<string, string>
            ? Flow<FlowName, Inputs, Outputs>
            : never
          : never;
      }
    : Global[K];
}>;

export class App<Global extends GlobalBase> {
  state: Global;

  constructor(state: Global) {
    this.state = state;
  }

  static create(): App<{ types: {}; flows: {} }> {
    return new App<{ types: {}; flows: {} }>({ types: {}, flows: {} });
  }

  registerType<TypeName extends string, T>(
    typeName: TypeName,
    validator: (value: unknown) => value is T
  ): App<RegisterValueType<Global, ValueType<TypeName, T>>> {
    this.state.types[typeName] = { validator, typeName };
    return this as any;
  }

  registerFlow<
    FlowName extends string,
    Inputs extends Record<string, keyof Global["types"]>,
    Outputs extends Record<string, keyof Global["types"]>
  >(
    flowName: FlowName,
    inputs: Inputs,
    outputs: Outputs,
    processor: (
      props: ValueTypes<Global, Inputs>
    ) => Promise<ValueTypes<Global, Outputs>>
  ): App<RegisterFlow<Global, FlowName, Inputs, Outputs>> {
    this.state.flows[flowName] = {
      name: flowName,
      inputs,
      outputs,
      processor,
    } as AnyFlow;

    return this as any;
  }

  pipe<T>(fn: (app: App<Global>) => T): T {
    return fn(this);
  }

  async run<
    FlowName extends keyof Global["flows"] = keyof Global["flows"],
    TargetFlow extends AnyFlow = Global["flows"][FlowName]
  >(
    flow: FlowName,
    props: ValueTypes<Global, TargetFlow["inputs"]>
  ): Promise<ValueTypes<Global, TargetFlow["outputs"]>> {
    // @ts-ignore
    const _flow = this.state.flows[flow] as TargetFlow;
    return _flow.processor(props) as Promise<ValueTypes<Global, TargetFlow["outputs"]>>;
  }
}
