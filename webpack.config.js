const path = require("path");

module.exports = {
    mode: "development",
    entry: "./src/App.js",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist"),
        publicPath: "/dist/",
    },
    devServer: {
        static: {
            directory: path.join(__dirname, "/"),
        },
    },
    resolve: {
        fallback: {
            crypto: false,
            os: false,
            fs: false,
            tls: false,
            net: false,
            path: false,
            zlib: false,
            http: false,
            https: false,
            stream: false,
        },
    },
};
