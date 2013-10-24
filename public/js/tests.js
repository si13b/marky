(function() {
	module('marky', {
		setup: function() {
			F.open('index.html');
		}
	});
	
	test('Login', function() {
		F('input[name="username"]').size(1, function() {
			F('input[name="username"]').visible('User field visible').type('admin');
			F('input[name="password"]').visible('P/W field visible').type('admin123');
			F('input[type="Submit"]').visible('Login button visible').click();
	
			ok( 1 == "1", "Passed!" );
			F('nav').size(1, function() {
				F('nav').visible('Find navigation panel');
				F('nav > h1').visible('Marky title should be visible!');
				equal(F('nav > h1').text().trim(), 'marky', 'Marky title should be "marky"');
				
				testNoteBasics();
			});
			
		});
		
	});
	
	function testNoteBasics() {
		var count = F('ul.tree li').size();
		F('.opts > div[title="New note"]').click();
		F('ul.tree li').size(count + 1, 1000, function() {
			equal(F('ul.tree > li:last-child').text().trim(), 'New note', 'New note has been created');
		});
	}
})();