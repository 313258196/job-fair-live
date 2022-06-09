const { defineConfig } = require('@vue/cli-service')

const os = require("os");
let localhost = "";

try {
    const network = os.networkInterfaces();
    network[Object.keys(network)[0]].forEach((details) => {
        if (localhost === "" && details.family === "IPv4" && !details.internal) {
            localhost = details.address
            return;
        }
    });
} catch (err) {
    localhost = "localhost";
}

module.exports = defineConfig({
    transpileDependencies: true,
    chainWebpack: config => {
        const oneOfsMap = config.module.rule('scss').oneOfs.store
        oneOfsMap.forEach(item => {
            item
                .use('sass-resources-loader')
                .loader('sass-resources-loader')
                .options({
                    // Provide path to the file with resources
                    // 要公用的scss的路径
                    resources: 'src/assets/css/theme.scss'
                })
                .end()
        })
    },
    devServer: {
        host: localhost
	}
})
