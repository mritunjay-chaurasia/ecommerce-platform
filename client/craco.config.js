const path = require('path');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');

module.exports = {
    webpack: {
        alias: {
            '@shared': path.resolve(__dirname, '../shared'),
        },
        configure: (webpackConfig) => {
            webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
                (plugin) => !(plugin instanceof ModuleScopePlugin),
            );

            webpackConfig.module.rules.push({
                test: /\.m?js$/,
                resolve: {
                    fullySpecified: false,
                },
            });
            return webpackConfig;
        },
    },
};
