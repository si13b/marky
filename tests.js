//==============================================================================
// Casper generated Wed Nov 20 2013 06:30:04 GMT+0800 (WST)
//==============================================================================

var x = require('casper').selectXPath;
var casper = require('casper').create({
    verbose: false,
    logLevel: 'info'
});

var username = casper.cli.raw.get('user'),
    password = casper.cli.raw.get('pass'),
    code = casper.cli.raw.get('code');

casper.start('http://localhost:3000/index.html', function() {
    this.test.assert(!!(username && username.length));
    this.test.assert(!!(password && password.length));
    this.test.assert(!!(code && code.length));
    
    login();
    basic();
});

var login = function() {
    casper.log('Logging in', 'info');
    
    casper.waitForSelector(x("//a[normalize-space(text())='Login']"),
        function success() {
            this.test.assertExists(x("//a[normalize-space(text())='Login']"));
            this.click(x("//a[normalize-space(text())='Login']"));
        },
        function fail() {
            this.test.assertExists(x("//a[normalize-space(text())='Login']"));
    });
    casper.waitForSelector("form input[name='login']",
        function success() {
            this.test.assertExists("form input[name='login']");
            this.click("form input[name='login']");
        },
        function fail() {
            this.test.assertExists("form input[name='login']");
    });
    casper.waitForSelector("input[name='login']",
        function success() {
            this.sendKeys("input[name='login']", username);
        },
        function fail() {
            this.test.assertExists("input[name='login']");
    });
    casper.waitForSelector("input[name='password']",
        function success() {
            this.sendKeys("input[name='password']", password);
        },
        function fail() {
            this.test.assertExists("input[name='password']");
    });
    casper.waitForSelector("form input[type=submit][value='Sign in']",
        function success() {
            this.test.assertExists("form input[type=submit][value='Sign in']");
            this.click("form input[type=submit][value='Sign in']");
        },
        function fail() {
            this.test.assertExists("form input[type=submit][value='Sign in']");
    });
    // submit form
    casper.waitForSelector("input[name='otp']",
        function success() {
            this.test.assertExists("input[name='otp']");
            this.sendKeys("input[name='otp']", code);
        },
        function fail() {
            this.test.assertExists("input[name='otp']");
    });
    casper.waitForSelector("form button",
        function success() {
            this.test.assertExists("form button");
            this.click("form button");
        },
        function fail() {
            this.test.assertExists("form button");
    });
}

var basic = function() {
    casper.log('Basic tests', 'info');
    
    casper.waitForSelector("nav ul.tree",
        function success() {
            this.test.assertExists("nav ul.tree");
            this.click("nav ul.tree > li:nth-child(2)");
        },
        function fail() {
            this.test.assertExists("nav ul.tree");
            this.capture('noNavTree.png');
            this.die('Could not find the menu tree');
    })
    casper.waitForSelector(".selected",
        function success() {
            this.test.assertExists(".selected");
            this.click(".selected");
        },
        function fail() {
            this.test.assertExists(".selected");
    });
    casper.waitForSelector(".tree.shown .selected",
        function success() {
            this.test.assertExists(".tree.shown .selected");
            this.click(".tree.shown .selected");
        },
        function fail() {
            this.test.assertExists(".tree.shown .selected");
    });
    casper.waitForSelector(".opts button:nth-child(1)",
        function success() {
            this.test.assertExists(".opts button:nth-child(1)");
            this.click(".opts button:nth-child(1)");
        },
        function fail() {
            this.test.assertExists(".opts button:nth-child(1)");
    });
    casper.waitForSelector(".tree.shown .selected",
        function success() {
            this.test.assertExists(".tree.shown .selected");
            this.click(".tree.shown .selected");
        },
        function fail() {
            this.test.assertExists(".tree.shown .selected");
    });
    casper.waitForSelector(".title input",
        function success() {
            this.sendKeys(".title input", "This is a new ntoeote\r");
        },
        function fail() {
            this.test.assertExists(".title input");
    });
    casper.waitForSelector(".ace_content",
        function success() {
            this.test.assertExists(".ace_content");
            this.click(".ace_content");
        },
        function fail() {
            this.test.assertExists(".ace_content");
    });
    casper.waitForSelector("textarea",
        function success() {
            this.sendKeys("textarea", "This is a new note\r");
        },
        function fail() {
            this.test.assertExists("textarea");
    });
    casper.waitForSelector(".opts button:nth-child(1)",
        function success() {
            this.test.assertExists(".opts button:nth-child(1)");
            this.click(".opts button:nth-child(1)");
        },
        function fail() {
            this.test.assertExists(".opts button:nth-child(1)");
    });
    casper.waitForSelector(".tree.shown .selected",
        function success() {
            this.test.assertExists(".tree.shown .selected");
            this.click(".tree.shown .selected");
        },
        function fail() {
            this.test.assertExists(".tree.shown .selected");
    });
    casper.waitForSelector(".title input",
        function success() {
            this.test.assertExists(".title input");
            this.click(".title input");
        },
        function fail() {
            this.test.assertExists(".title input");
    });
    casper.waitForSelector(".title input",
        function success() {
            this.test.assertExists(".title input");
            this.click(".title input");
        },
        function fail() {
            this.test.assertExists(".title input");
    });
    casper.waitForSelector(".title input",
        function success() {
            this.sendKeys(".title input", "TesT!");
        },
        function fail() {
            this.test.assertExists(".title input");
    });
    casper.waitForSelector(".ace_content",
        function success() {
            this.test.assertExists(".ace_content");
            this.click(".ace_content");
        },
        function fail() {
            this.test.assertExists(".ace_content");
    });
    casper.waitForSelector(".tree.shown .selected",
        function success() {
            this.test.assertExists(".tree.shown .selected");
            this.click(".tree.shown .selected");
        },
        function fail() {
            this.test.assertExists(".tree.shown .selected");
    });
    casper.waitForSelector(".ace_content",
        function success() {
            this.test.assertExists(".ace_content");
            this.click(".ace_content");
        },
        function fail() {
            this.test.assertExists(".ace_content");
    });
}

casper.run(function() {this.test.renderResults(true);});