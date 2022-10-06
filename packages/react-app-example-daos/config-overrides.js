// config-overrides.js
// More info here https://github.com/facebook/create-react-app/pull/12021#issuecomment-1108426483
module.exports = {
  webpack: function (config, env) {
    console.log(config.module);
    config.module.rules = config.module.rules.map((rule) => {
      if (rule.oneOf instanceof Array) {
        console.log(JSON.stringify(rule.oneOf));
        rule.oneOf[rule.oneOf.length - 1].exclude = [
          /\.(js|mjs|jsx|cjs|ts|tsx)$/,
          /\.html$/,
          /\.json$/,
        ];
      }
      return rule;
    });
    return config;
  },
};
