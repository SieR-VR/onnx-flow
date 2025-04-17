import esbuild from "esbuild";
import UnpluginTypia from '@ryoppippi/unplugin-typia/esbuild';

esbuild.build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    outdir: "dist",
    format: "cjs",
    sourcemap: true,
    plugins: [
        UnpluginTypia({
            include: ["src/**/*.ts"],
            exclude: ["node_modules/**", "dist/**"],
        }),
    ],
});
