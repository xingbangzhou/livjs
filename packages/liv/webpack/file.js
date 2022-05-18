const {configure} = require('./configure')

const setup = function () {
  const { wpConfig } = configure

  wpConfig.merge({
    module: {
      rule: {
        // 解决svgr ReactComponent 无法获取的问题
        svg: {
          test: /\.svg$/,
          use: {
            svgr: {
              loader: require.resolve('@svgr/webpack'),
              options: {
                babel: false,
              }
            },
            url: {
              loader: 'url-loader', // 解决 ReactComponent 无法获取问题
              options: {
                esModule: false
              }
            }
          }
        },
        image: {
          test: /\.(a?png|jpe?g|gif|webp|ico|bmp|avif)$/i,
          type: 'asset/resource'
        },
        fonts: {
          test: /\.(|otf|ttf|eot|woff|woff2)$/i,
          type: 'asset/resource'
        },
        inline: {
          resourceQuery: /inline/,
          type: 'asset/inline',
        },
        // 解决 svga 解析失败问题
        svga: {
          test: /\.(svga)$/i,
          type: 'asset/resource',
        }
      }
    }
  })
}

module.exports = {
  setup
}
