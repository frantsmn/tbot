module.exports = {
    apps : [{
        name   : "tbot",
        script : "./dist/app.js",
        watch: ["dist"],
        watch_delay: 5000,
    }]
}
