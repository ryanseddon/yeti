var sys = require("sys");
var Browsers = require("./browsers").Browsers;

exports.good = "✔";
exports.bad = "✖";

var color = require("./color").codes;
exports.color = color;

function log () {
    var args = Array.prototype.slice.call(arguments);
    var line = [];
    args.forEach(function (msg) {
        if (msg instanceof Error) msg = msg.stack;
        if (typeof msg !== "string") msg = sys.inspect(msg, 0, 4);
        line.push(msg);
    });
    sys.error(line.join(" "));
};

exports.log = log;

var startTime = 0;
var pendingResults = 0;

exports.start = function () {
    startTime = new Date().getTime();
};

exports.pending = function () {
    pendingResults++;
};

var everything = {
    passed : 0,
    failed: 0
};

function results (result) {
    everything.failed += result.failed;
    everything.passed += result.passed;

    var browser = Browsers.forAgent(result.ua);

    var icon = result.failed ? exports.bad : exports.good;
    var em = result.failed ? color.red : color.green;
    log(em(icon) + "  " + color.bold(result.name) + " on " + browser);
    log("  " + result.passed + " passed");
    log("  " + result.failed + " failed");

    if (!--pendingResults) summarize();
};

exports.results = results;

function summarize () {
    var duration = new Date().getTime() - startTime;
    var time = " (" + duration + "ms)";
    log("");
    if (everything.failed) {
        var total = everything.passed + everything.failed;
        log(
            color.red("Failures") + ": "
            + everything.failed + " of " + total
            + " tests failed." + time
        );
    } else {
        log(color.green(everything.passed + " tests passed!") + time);
    }
    // process.exit(0);
}

