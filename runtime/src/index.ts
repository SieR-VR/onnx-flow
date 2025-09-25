import typia from "typia";
import { App } from "./app";

let app = App.create();

(async () => {
  app
    .pipe((app) => app
      .registerType("number", typia.createIs<number>())
      .registerFlow("fn", { a: "number" }, { b: "number" }, async ({ a }) => {
        return { b: a };
      })
    )
    .pipe((app) => {
      const numberType = app.state.types.number;
      console.log(numberType);
      console.log(numberType.validator(1));
      console.log(numberType.validator("1"));

      return app;
    })
    .pipe(async (app) => {
      const result = await app.run("fn", { a: 1 });
      console.log(result);
      return app;
    });
})();
