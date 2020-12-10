// general
const path = require('path');
// html
const HtmlWebpackPlugin = require('html-webpack-plugin');
const glob = require('glob');
// css
const autoprefixer = require('autoprefixer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries');
const sass = require('sass');
const fibers = require('fibers');
// images
const CopyWebpackPlugin = require('copy-webpack-plugin');

// html出力設定
const HtmlWebpackPluginList = glob.sync('**/*.html', { cwd: './public' });
const HWPConfig = HtmlWebpackPluginList.map(item => {
  return new HtmlWebpackPlugin({
    template: `./public/${item}`,
    filename: `./${item}`,
    chunks: [],
  });
});

// エントリーポイントの設定
const entries = {
  // js エントリーポイント: plugins/とmodules/は除外
  ...glob.sync('*.js', { cwd: './src/js', ignore: 'modules/**/*.js' }).reduce((entries, path) => {
    // 'js/[filename]': './src/js/[filename].js'の形にする
    entries[`/assets/js/${path.replace('.js', '')}`] = `./src/js/${path}`;
    return entries;
  }, {}),
  // scss エントリーポイント: パーシャルは除外
  ...glob.sync('**/*.scss', { cwd: './src/scss' }).reduce((entries, path) => {
    // 'scss/[filename]': './src/scss/[filename].scss'の形にする
    entries[`/assets/css/${path.replace('.scss', '')}`] = `./src/scss/${path}`;
    return entries;
  }, {}),
};

module.exports = (_, arg) => ({
  mode: 'development',
  entry: entries,
  output: {
    filename: './[name].js', // './[name].[hash].js',
    path: path.resolve(__dirname, `./dist/`),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          {
            loader: 'css-loader',
            options: {
              url: false,
              sourceMap: arg.mode !== 'production',
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: arg.mode !== 'production',
              plugins: [autoprefixer],
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: arg.mode !== 'production',
              implementation: sass,
              sassOptions: {
                fiber: fibers,
              },
            },
          },
        ],
      },
    ],
  },
  devServer: {
    open: true,
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
    proxy: {
      context: ['!/**/*'],
      target: 'http://yoshida-dev-env.s3-website-ap-northeast-1.amazonaws.com/test1/',
      secure: true,
      changeOrigin: true,
    },
  },
  plugins: [
    ...HWPConfig,
    new MiniCssExtractPlugin({
      filename: './[name].css',
    }),
    new FixStyleOnlyEntriesPlugin(),
    new CopyWebpackPlugin([
      {
        from: './public/images/',
        to: 'wp-content/themes/B-LINE/images/',
      },
    ]),
  ],
});
