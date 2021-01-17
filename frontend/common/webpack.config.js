const path = require('path');

module.exports = {
    mode: 'development',
    // Set the entry point (main file) for webpack.
    entry: null,
    // Output bundle is created in a "build" directory.
    output: {
        path: path.join(__dirname, '..', '..', 'public', 'javascripts'),
        filename: null
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader'
                    }
                ]
            },
            {
                // Use babel loader to transform JSX to ES2015 javascript.
                test: /\.jsx?$/,
                loader: 'babel-loader',
                options: {
                    presets: [
                        [
                            '@babel/preset-env',
                            {
                                targets: {
                                    esmodules: true
                                }
                            }
                        ],
                        '@babel/preset-react'
                    ]
                }
            },
            {
                test: /\.svg$/,
                loader: 'svg-loader'
            }
        ]
    }
};