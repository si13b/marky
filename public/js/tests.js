(function() {
	module('marky', {
		setup: function() {
			F.open('login.html');
		}
	});
	
	function checkLogin(callback) {
		console.log('checkLogin');
		if (!callback) return;
		F.wait(200, function() {
			console.log('Check nav and login');
			if (F('nav').length) {
				callback();
				return;
			}
			
			if (F('input[name="username"]').length) {
				F('input[name="username"]').size(1, function() {
					F('input[name="username"]').visible('User field visible').type('admin');
					F('input[name="password"]').visible('P/W field visible').type('admin123');
					F('input[type="Submit"]').visible('Login button visible').click();
			
					ok( 1 == "1", "Passed!" );
					F('nav').size(1, function() {
						F('nav').visible('Find navigation panel');
						F('nav > h1').visible('Marky title should be visible!');
						equal(F('nav > h1').text().trim(), 'marky', 'Marky title should be "marky"');
						
						callback();
					});
					
				});
			}
		}, 'Waiting for marky app, or login');
	}
	
	test('Test note basics', function() {
		checkLogin(function() {
			var count = F('ul.tree li').size();
			F('.opts > div[title="New note"]').click();
			F('ul.tree li').size(count + 1, 1000, function() {
				var elNew1 = F('ul.tree > li:last-child');
				equal(elNew1.text().trim(), 'New note', 'New note has been created');
				elNew1.click();
				F('textarea.ace_text-input').size(1, function() {
					var elAce = F('textarea.ace_text-input');
					elAce.visible('ACE editor is now visible');
					equal(elAce.text().trim().length, 0, 'ACE editor should now be empty');
					
					elAce.click().click().then(function() {
						$(elAce).text('# This is a title\nAnd this is some text');
						elAce.type('').then(function() {
							ok(F('.ace_content').text().contains('# This is a title'), 'ACE editor should have first test note contents');
							F.wait(100, function() {
								// Create another new note
								F('.opts > div[title="New note"]').click();
								F('ul.tree li').size(count + 2, 1000, function() {
									var elNew2 = F('ul.tree > li:last-child');
									equal(elNew2.text().trim(), 'New note', 'New note has been created');
									elNew2.click();
									
									F.wait(200, function() {
										equal(elAce.text().trim().length, 0, 'ACE editor should now be empty');
										elAce.click().type('New note two');
										
										elNew1.click();
										
										F.wait(200, function(){
											ok(F('.ace_content').text().contains('# This is a title'), 'ACE editor should have first test note contents');
										});
									});
								});
							});
						});
					});
				});
				
			});
		});
	});
})();