module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./src"],
          extensions: [".ts", ".tsx", ".js", ".jsx"],
          alias: {
            "@shared": "./src/shared",
            "@entities": "./src/entities",
            "@features": "./src/features",
            "@widgets": "./src/widgets",
            "@app": "./app",
            "@ui": "./src/shared/ui",
            "@lib": "./src/shared/lib",
            "@theme": "./src/shared/theme",
            "@types": "./src/types",
          },
        },
      ],
    ],
  };
};
