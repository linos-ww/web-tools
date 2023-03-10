const {VueLoaderPlugin}=require("vue-loader")
const HtmlWebpackPlugin=require("html-webpack-plugin")
const path=require("path")
const webpack = require("webpack")
const WebpackBar =require('webpackbar')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports={
    mode:"development",
    entry:process.env.TYPE=='js'?"./src/index.js":"./src/index.ts",
    output:{
        path:path.resolve(__dirname,"dist"),
        filename:"[name]-[id].js"
    },
    devtool:"inline-source-map",
    module:{
        rules:[{
            test:/\.vue$/,
            use:'vue-loader'
        }, {
            test:/\.css$/,
            use:['style-loader','css-loader']
        }, {
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
        }, {
            test:/\.txt$/,
            type:'asset'
        }]
    },
    devServer:{
        host:'localhost',
        port:7000,
        open:true,
        hot:true,
        static:{
            directory:"./dist"
        },
        proxy:{
            "/":{
                // target:"http://101.201.141.76:8103",
                // target:'http://localhost:5000',
                // pathRewrite:{'^/api':''},
                // changeOrigin:true
            }
        }
    },
    resolve:{
        extensions:[".ts",".js",".vue","..."],
        // enforceExtension:true,  //??????????????????
        mainFiles: ['index'],
        alias: {
            // '@': path.join(__dirname, "src"),
            
        }
    },
    plugins:[
        new MiniCssExtractPlugin(),
        new VueLoaderPlugin(),
        new WebpackBar(),
        new HtmlWebpackPlugin({
            filename:"index.html",              //???????????????
            inject:true,                        //???temlate?????????????????????,
            template: "./src/index.html"        //????????????
        }),
        // new webpack.ProvidePlugin({
        //     process:"process/browser",
        //     Buffer:["buffer","Buffer"]
        // })
    ]
    
}
