const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')
const webpackbar = require('webpackbar')
const ESLintPlugin = require('eslint-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')
const fs = require('fs')
const { configure, resolveApp, getCacheFiles } = require('./configure')

const setup = function () {
  const { env, options, wpConfig, appDir, srcDir, favicon, template } = configure
  const isDev = env === 'development'
  const { livEnv, analyze, progress } = options
  const cacheFiles = getCacheFiles()

  const plugin = {
    env: {
      plugin: webpack.EnvironmentPlugin,
      args: [
        {
          MODE_ENV: env,
          LIV_ENV: livEnv
        }
      ]
    },
    clean: {plugin: CleanWebpackPlugin, args: []},
    html: {
      plugin: HtmlWebpackPlugin,
      args: [
        {
          title: 'LIV',
          template: template,
          favicon: favicon,
          files: {
            css: [],
            js: [],
          },
          minify: !isDev
            ? {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true
              }
            : false
        }
      ]
    },
    mf: {
      plugin: ModuleFederationPlugin,
      args: [{}],
    }
  }

  // Progress
  if (progress) {
    plugin.progress = {
      plugin: webpackbar,
      args: [
        {
          color: 'green',
          profile: true
        }
      ]
    }
  }
  // TS ForkTsCheckerWebpackPlugin
  const tsconfig = resolveApp('tsconfig.json')
  if (fs.existsSync(tsconfig)) {
    plugin.ts = {
      plugin: ForkTsCheckerWebpackPlugin,
      args: [
        {
          async: isDev, // true dev?????????????????????????????????
          eslint: {
            enabled: true,
            files: `${srcDir}/**/*.{ts,tsx,js,jsx}`,
          },
          typescript: {
            configFile: tsconfig,
            profile: false,
            typescriptPath: require.resolve('typescript'),
          }
        }
      ]
    }
  } else {
    plugin.eslint = {
      plugin: ESLintPlugin,
      args: [
        {
          extensions: ['js', 'mjs', 'jsx', 'ts', 'tsx'],
          context: appDir,
          files: ['src/**/*.{ts,tsx,js,jsx}'],
          cache: true,
          cacheLocation: cacheFiles.eslint,
          fix: true,
          threads: true,
          lintDirtyModulesOnly: false
        }
      ]
    }
  }
  // Analyze
  if (analyze) {
    plugin.analyzer = {
      plugin: BundleAnalyzerPlugin,
      args: [
        {
          reportFilename: 'report.html',
          openAnalyzer: true,
        }
      ]
    }
  }

  wpConfig.merge({
    plugin
  })
}

module.exports = {
  setup
}
