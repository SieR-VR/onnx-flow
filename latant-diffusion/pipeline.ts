import { InferenceSession, Tensor } from "onnxruntime-node";

const __MODEL_MAP = new Map<string, InferenceSession>();

const load = async (model: string) => {
  const session = await InferenceSession.create(model);
  __MODEL_MAP.set(model, session);

  return (feeds: Record<string, Tensor>) => {
    if (!__MODEL_MAP.has(model)) {
      throw new Error(`Model ${model} unloaded`);
    }

    const session = __MODEL_MAP.get(model)!;
    return session.run(feeds);
  };
};
