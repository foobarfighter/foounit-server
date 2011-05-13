# foounit-server

A node server that allows foounit to work better in a browser environment

## What does it do?

* Better stacktraces
* Dynamically created suites
* Continuous integration

### Better stacktraces
By default, foounit runs with an XhrLoadingStrategy which wreaks havoc on stack traces.  foounit-server will load all dependencies as script tags so that stack traces are preserved.

### Dynamically created suites
By accessing subdirectories of a test/spec directory from within your browser, foounit-server will partition the tests that are actually run.

For example, let's say you have a project that has the following file structure:

    lib/example.js
    lib/example/support.js
    lib/example/support/inflections.js
    lib/example/support/datetime.js
    lib/example/widget/login_form.js
    spec/example_spec.js
    spec/example/support_spec.js
    spec/example/support/inflections_spec.js
    spec/example/support/datetime_spec.js
    spec/example/widget/login_form_spec.js

If you point your web browser at http://localhost:5057/spec/ then it will run the entire test suite.

If you point your web browser at http://localhost:5057/spec/support_spec then it will run:

    spec/example/support_spec.js

If you point your web browser at http://localhost:5057/spec/support then it will run

    spec/example/support_spec.js
    spec/example/support/inflections_spec.js 
    spec/example/support/datetime_spec.js 

If you point your web browser at http://localhost:5057/spec/widget then it will run

    spec/example/widget/login_form_spec.js

### Continuous integration
foounit-server will output all test results to it's STDOUT.  If there are any failures then foounit-server will exit with a non-zero return value.  If all tests passed then the foounit-server process will exit with a 0 return value.

## Installation

    npm install foounit-server

## Running

    foounit-server [-p PORT] [-h HOSTNAME] [--src-dir1=SOURCEDIR] [--test-dir1=TESTDIR] [<suite-template-file>]

