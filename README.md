# Yeti

[![Build Status](https://secure.travis-ci.org/yui/yeti.png?branch=master)](http://travis-ci.org/yui/yeti)

Yeti is a command-line tool for launching JavaScript unit tests in a browser
and reporting the results without leaving your terminal.
Yeti is designed to work with tests built on [YUI Test][yuitest]
or [QUnit][] just as they are.

## Install Yeti

The latest release can be installed easily:

    npm install -g yeti

Yeti requires Node.js, which provides the `npm` command for installation.
You can [download Node.js](http://nodejs.org/download/) source or pre-built
installers from their website.

## Using Yeti

### Running a test

Just run Yeti with the HTML files containing your tests.

    $ yeti test/*.html
    Creating a Hub at http://localhost:9000
    Waiting for agents to connect at http://localhost:9000.
    When ready, press Enter to begin testing.

Point your browsers at that URL, then come back and press Enter.

    [Open some browsers...]

      Agent connected: Safari (6.0) / Mac OS
      Agent connected: Chrome (22.0.1221.0) / Mac OS

    [Come back, press Enter]

    ✔ Testing started on Safari (6.0) / Mac OS, Chrome (22.0.1221.0) / Mac OS
    ✔ Agent completed: Safari (6.0) / Mac OS
    ✔ Agent completed: Chrome (22.0.1221.0) / Mac OS
    504 tests passed! (9.1 seconds)
    $

Yeti exits automatically when all tests complete. If test failures occur, Yeti will exit with a non-zero status code.

#### JUnit XML output

Yeti can output machine-readable JUnit XML suitable for use in [Jenkins][] with the `--junit` option.

    $ yeti --junit test/*.html > yeti.xml

Yeti will output XML on stdout and status messages on stderr.

#### Code coverage

Yeti automatically includes a line coverage summary if your tests were instrumented with [YUI Test Coverage][yuitest].

    ✔ Testing started on Safari (6.0) / Mac OS
    ► Testing... \ 13% complete (10/60) 11.85 tests/sec ETA 4 minutes, 2 seconds 44% line coverage

#### AJAX testing

Yeti provides server-side AJAX routes with [echoecho][ee]. Your test can
[make relative HTTP requests][ee-usage] to test your code aganist server-side HTTP
GET, POST, PUT, DELETE, OPTIONS, GET with delay, JSON or JSONP responses via POST,
or any HTTP status code.

Example supported routes:

 - `echo/status/500` returns a 500 response.
 - `echo/delay/3` returns a 200 response after 3 seconds.
 - `echo/jsonp?callback=foo` returns a JSONP response with the given
    POST data wrapped in a call to `foo`.

Note these routes are intentionally relative paths.
See the [echoecho README][ee-readme] for more details.

#### Timeouts

Yeti will disconnect a browser if it does not record any activity from it for 45 seconds.
You can adjust this interval with the `--timeout` option.

This will run Yeti with a 120 second timeout:

    $ yeti --timeout 120 test.html

#### Query string parameters

You can specify query string parameters to add to your test URLs.
This can be used to pass information to your tests that control its behavior.

This will append `?fliter=coverage` to your tests, which is used by the tests
for the [YUI Library][YUI] to trigger loading instrumented code.

    $ yeti --query 'filter=coverage' test/*.html

#### Error handling

Yeti will report an uncaught exceptions as Script Errors.

Yeti enforces [No-Quirks Mode][] in your tests because it may impact DOM-related APIs. [Add a DOCTYPE][doctype] to your test document to fix this.

#### Mobile testing made easy

When combined with [localtunnel][], mobile testing is simple. If you're not dealing with sensitive information, startup your Yeti Hub and then run:

    $ localtunnel 9000
       Port 9000 is now publicly accessible from http://3z48.localtunnel.com ...

You can then visit that URL on your mobile (or any other) device and have it run new tests.

### Yeti Hub

To save time, start a Yeti Hub.

    $ yeti --server
    Yeti Hub listening on port 9000.

Point browsers at your local Yeti on port 9000. Now, you're ready to run tests without having to reconnect browsers each time.

Starting Yeti in another terminal will connect to that Hub instead of starting a new one
and will begin testing immediately if browsers are already connected.

    $ yeti test/*.html
    Connected to http://localhost:9000
      Agent connected: Chrome (22.0.1221.0) / Mac OS
      Agent connected: Safari (6.0) / Mac OS
    ✔ Testing started on Chrome (22.0.1221.0) / Mac OS, Safari (6.0) / Mac OS
    ✔ Agent completed: Chrome (22.0.1221.0) / Mac OS
    ✔ Agent completed: Safari (6.0) / Mac OS
    504 tests passed! (11.5 seconds)
    $

#### Sharing

Your Yeti Hub can be shared with other developers.

First, I'll start a Hub on test.yeti.cx on port 80.

    $ yeti --server --port 80

Go ahead and point a few browsers there.

Now, others can connect to it from their computer like so:

    $ yeti --hub http://test.yeti.cx/ test/*.html
    Connected to http://test.yeti.cx/
    Waiting for agents to connect at http://test.yeti.cx/.
    When ready, press Enter to begin testing.

Your `pwd` and your test file will be served through the Hub. Like magic.

    [Hit Enter]
      Agent connected: Chrome (22.0.1221.0) / Mac OS
      Agent connected: Safari (6.0) / Mac OS
    ✔ Testing started on Chrome (22.0.1221.0) / Mac OS, Safari (6.0) / Mac OS
    ✔ Agent completed: Safari (6.0) / Mac OS
    ✔ Agent completed: Chrome (22.0.1221.0) / Mac OS
    504 tests passed! (8.7 seconds)

This makes it really simple to setup an ad-hoc testing lab shared with your team.

### Options

Here's a breakdown of all available CLI options.

 - *query* (String) Query string parameters to pass to tests.
 - *timeout* (Number in seconds) Test timeout.
 - *hub* (URL) Location of the Yeti Hub to use.
   Set to `false` or specify `--no-hub` to override a configuration file.
 - *server* Starts a Yeti Hub.
 - *port* (Number) Yeti Hub will listen to this port.
 - *loglevel* (`debug` or `info`) Print debugging information.
 - *help* Print usage.
 - *version* Print the Yeti version.

#### Configuration file

You may use place JSON in a `.yeti.json` file to set project or user specific configuration.

Yeti will look for `.yeti.json` in these places:

 - Recursively starting in the directory you start Yeti
 - In your home folder

Here is an example `.yeti.json` for the YUI project, which is placed in the repositiory root:

    {
        "hub": "http://test.yeti.cx/",
        "basedir": ".",
        "glob": "**/tests/unit/*.html"
    }

Here is the breakdown of these settings:

 - The *hub* option defines a Yeti Hub URL to use.
 - The *basedir* option indicates that the directory where `.yeti.json` lives is
    permitted to serve files to the Yeti Hub.
 - The *glob* option defines a pattern to search for test files.

These settings let YUI developers simply run `yeti` inside of the project directory
to run tests. Since all tests in the project match the glob pattern, the `yeti`
command works for specific components as well as for the entire project.

This configuration can be overridden on the command line. For example, to ignore the
hub setting, you can run Yeti with `--no-hub`.

## Yeti API

You can `require("yeti")` inside your application to script Yeti for your own use.

For API documentation:

 - Run `make html` to build HTML documentation to `./build_docs`.
 - Review code comments inside `lib/yeti.js`, `lib/client.js` and `lib/hub/index.js`.

Yeti follows [Semantic Versioning](http://semver.org/) but is currently at a 0.x.y release. **The public API is not stable.** There will be changes.

## Caveats

### Platforms

Yeti should work on all platforms supported by Node.js.
It's tested on Linux and OS X.

### Serving tests

You must start Yeti's client in the directory you'll be serving tests from. For security reasons, Yeti will reject requests that try to access files outside of the directory you start Yeti in.

### Limited QUnit support

QUnit does not provide a detailed result summary when testing completes;
instead, QUnit requires Yeti to collect results as testing runs.
This is not implemented. Therefore, QUnit test details are limited
to total, pass, and fail test counts.

## Install latest Yeti snapshot

You can install the latest in-development snapshot of Yeti easily, too:

    npm install -g http://latest.yeti.cx

This will install Yeti as it exists on the [yui/yeti GitHub repository][github].
You can check the stability of the Yeti snapshot by checking [yui/yeti on Travis][travis].

## Develop Yeti

Do you want to add new features or fix bugs in Yeti itself? We made it easy for you to hack on Yeti.

### Experimental: Develop on Windows

After running `npm install`, replace the `make` commands below with
`.\jake.bat` to use the experimental Jake tasks that are Windows ready.

### Code

#### Install dependencies

Clone Yeti.

    git clone https://github.com/yui/yeti.git
    cd yeti

Install Yeti's dependencies.

    npm install

#### Run tests & code coverage

Yeti's automated tests require PhantomJS.
You can [download PhantomJS](http://phantomjs.org/download.html) source or pre-built
binaries from their website. Make sure the `phantomjs` binary is installed in your PATH.

    make test
    make coverage

The latter command uses [JSCoverage for Node.js][jsc],
which will be built and installed to `./tools/jscoverage`.

#### Linter

    make lint

You may also run the linter on individual files with `./go lint`:

    ./go lint test/blizzard.js

Yeti uses [JSHint][] to analyze code for problems. See `.jshintrc` for options used by Yeti.

#### Profiler

Requires [Google Chrome Canary][canary] and OS X.

Profile the Yeti Hub:

    ./go profile --server

Using `./go profile` without `--server` to profile the Yeti client
requires an interactive terminal, which does not yet work.

### HTML documentation

#### Website

Yeti uses [Selleck][] to generate its website. Selleck files are located in `doc/`.

    make html

Documentation will be built to `build_docs/`.

#### JavaScript API

Yeti uses [YUIDocJS][] to generate API documentation from inline JSDoc comment blocks.

    make html-api

Documentation will be built to `build_docs/api/everything/`.

### Contribute to Yeti

See [CONTRIBUTING.md](https://github.com/yui/yeti/blob/master/CONTRIBUTING.md).

## Bugs & Feedback

Open a ticket on [YUILibrary.com's Yeti Issue Tracker][issues] to report bugs or feature requests.

## License

Yeti is free to use under YUI's BSD license.
See the LICENSE file or the [YUI license page](http://yuilibrary.com/license/)
for license text and copyright information.

  [Jenkins]: http://jenkins-ci.org/
  [ee]: https://github.com/davglass/echoecho
  [ee-usage]: https://github.com/davglass/echoecho#using-in-your-tests
  [ee-readme]: https://github.com/davglass/echoecho#readme
  [canary]: https://tools.google.com/dlpage/chromesxs
  [github]: https://github.com/yui/yeti
  [travis]: http://travis-ci.org/yui/yeti
  [JSHint]: http://jshint.com/
  [YUIDocJS]: https://github.com/davglass/yuidocjs
  [Selleck]: http://github.com/rgrove/selleck
  [jsc]: https://github.com/visionmedia/node-jscoverage
  [localtunnel]: http://localtunnel.com/
  [node]: http://nodejs.org/
  [npm]: http://npmjs.org/
  [issues]: http://yuilibrary.com/projects/yeti/newticket
  [YUI]: http://yuilibrary.com/
  [yuitest]: http://yuilibrary.com/yuitest/
  [QUnit]: http://qunitjs.com/
  [doctype]: http://www.whatwg.org/specs/web-apps/current-work/multipage/syntax.html#the-doctype
  [No-Quirks Mode]: http://www.whatwg.org/specs/web-apps/current-work/multipage/dom.html#no-quirks-mode
