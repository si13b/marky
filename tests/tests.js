var casper = require('casper').create({
    verbose: true,
    logLevel: 'info'
});

casper.start('http://localhost:3000/index.html', function() {
  casper.log('Logging in', 'info');
  this.test.assertExists('form input[name="username"]');
  
  casper.waitForSelector("form input[name='username']", function () {
    this.test.assertExists("form input[name='username']");
    this.click("form input[name='username']");
    this.sendKeys("input[name='username']", 'simon');
  });
  
  casper.waitForSelector("input[name='password']", function () {
    this.sendKeys("input[name='password']", 'simon');
  });
  
  casper.waitForSelector('button[type="submit"]', function() {
    this.click('button[type="submit"]');
  });
});

casper.then(function() {
  casper.waitForSelector('nav', function() {
    casper.log('Application loaded', 'info');
  });
  
  casper.waitForSelector('nav > .tree.shown > li:last-child', function() {
    casper.log('Clicked last nav item', 'info');
    this.click('nav > .tree.shown > li:last-child');
  });
  
  casper.waitForSelector('.editor.selected > .ace_editor > textarea', function() {
    casper.log('Clicked editor', 'info');
    this.click('.editor.selected > .ace_editor > textarea');
    this.sendKeys(".editor.selected > .ace_editor > textarea", 'Adding some text to the editor');
    this.test.assertSelectorHasText('.editor.selected > .ace_editor > textarea', 'Adding some text to the editor');
  });
  
  casper.waitForSelector('.editor.selected > .toolbar > .alpha > button[title="Save"]', function() {
    this.click('.editor.selected > .toolbar > .alpha > button[title="Save"]');
  });
  
  casper.waitForSelector('nav > .tree.shown > li:nth-child(3)', function() {
    casper.log('Clicked third nav item', 'info');
    this.click('nav > .tree.shown > li:nth-child(3)');
  });
  
  casper.waitForSelector('nav > .tree.shown > li:last-child', function() {
    casper.log('Clicked last nav item', 'info');
    this.click('nav > .tree.shown > li:last-child');
  });
  
  casper.waitForSelector('.editor.selected > .ace_editor > textarea', function() {
    casper.log(this.evaluate(function() {
      return document.querySelector('.editor.selected > .ace_editor > textarea').textContent;
    }), 'info');
  });
});

casper.run(function() {
  this.test.renderResults(true);
  this.test.done();
});