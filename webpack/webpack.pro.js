const {VueLoaderPlugin}=require("vue-loader")
const HtmlWebpackPlugin=require("html-webpack-plugin")
const path=require("path")
const webpack = require("webpack")
const WebpackBar =require('webpackbar')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports={
    mode:"production",
    entry:process.env.TYPE=='js'?"./src/index.js":"./src/index.ts",
    output:{
        path:path.resolve(__dirname,"../dist"),
        chunkFilename:'[chunkFilename]-[hash].[ext]',
        filename:"js/[name]-[id].js"
    },
    devtool:"inline-source-map",
    module:{
        rules:[{
            test:/\.vue$/,
            use:'vue-loader'
        }, {
            test:/\.css$/,
            use:[MiniCssExtractPlugin.loader,'css-loader']
        },  {
            test:/\.tsx?/,
            use:['ts-loader']
        },{
            test:/\.(js|jsx|mjs)$/,
            use:['babel-loader'],exclude:/node_modules/
        }, {
            test:/\.(png|jpg|svg|gif)$/,
            type:'asset',
            generator:{
                filename:'imgs/[name]-[hash][ext]'
            },
            parser:{
                dataUrlCondition:{
                    maxSize:10*1024  //10k
                }
            }
            // use:['url-loader']
            // use:[{loader:"file-loader",options:{outputPath:'imgs',publicPath:"imgs"}}]
        }, {
            test:/\.(ttf|otf|woff|eot)$/,
            type:'asset/resource',
            generator:{
                filename:'fonts/[name]-[hash][ext]'
            }
            // use:['url-loader']
            // use:[{loader:'file-loader',options: {name:'fonts/[name]-[hash].[ext]'}}]
        },{
            test:/\.txt$/,
            type:'asset'
        }]
    },
    optimization:{
        splitChunks:{
           chunks:"all"
            // cacheGroups:{
            //     commons:{
            //         test:/[\\/]node_modules[\\/]/,
            //         name:"tools",
            //         chunks:'all'
            //     }
            // }
        }
    },
    resolve:{
        // extensions:[".ts",".js",".vue","..."],
        // enforceExtension:true,
        // mainFiles: ['index'],
        alias: {
            // '@': path.join(__dirname, "src"),
            
        }
    },
    plugins:[
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
        }),
        new WebpackBar(),
        new HtmlWebpackPlugin({
            filename:"index.html",              //输出文件名
            inject:true,                        //在temlate模板中注入脚本,
            template: "./src/index.html"        //模板文件
        }),
        new webpack.ProvidePlugin({
            process:"process/browser",
            Buffer:["buffer","Buffer"]
        })
    ]
 
}