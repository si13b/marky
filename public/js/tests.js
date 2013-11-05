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
			
					ok( 1 == "1", 'Basic assertion' );
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
	
	function setACE(text) {
		F('textarea.ace_text-input').click();
		F.win.marky.ui._content._ace.setValue(text);
		//ok(F.eval('marky.ui._content._ace.setValue("' + text + '");'), 'Failed to set the ACE editor value');
	}
	
	function getACE(text) {
		return F.win.marky.ui._content._ace.getValue();
	}
	
	function massDeleteAction(element) {
		return element.click()
			.type('\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b')
			.type('[delete][delete][delete][delete][delete][delete][delete][delete][delete][delete][delete][delete][delete][delete][delete]');
	}
	
	test('Note creation and deletion', function() {
		var elNew1 = null,
			elNew2 = null,
			new1ID = null,
			new2ID = null,
			count = null,
			elAce = null;
			
		checkLogin(function() {
			count = F('ul.tree li').size();
			F('.opts > button[title="New note"]').click();
			F('ul.tree li').size(count + 1, 1000, createFirstNote);
		});
			
		function createFirstNote() {
			elNew1 = F('ul.tree > li:last-child');
			new1ID = elNew1.attr('data-id');
			equal(elNew1.text().trim(), 'New note', 'New note has been created');
			elNew1.click();
			F('textarea.ace_text-input').size(1, function() {
				elAce = F('textarea.ace_text-input');
				elAce.visible('ACE editor is now visible');
				equal(elAce.text().trim().length, 0, 'ACE editor should now be empty');
				
				elAce.click().click().then(editFirstNote);
			});
		}
		
		function editFirstNote() {
			//$(elAce).text('# This is a title\nAnd this is some text');
			var noteOneText = '# This is a title\nAnd this is some text';
			setACE(noteOneText);
			F.wait(100, function() {
				equal(getACE(), noteOneText, 'ACE editor should have first test note contents');
				F.wait(100, editSecondNote);
			});
		}
		
		function editSecondNote() {
			F('.opts > button[title="New note"]').click();
			F('ul.tree li').size(count + 2, 1000, function() {
				elNew2 = F('ul.tree > li:last-child');
				equal(elNew2.text().trim(), 'New note', 'New note has been created');
				elNew2.click();
				new2ID = elNew2.attr('data-id');
				
				F.wait(200, function() {
					equal(elAce.text().trim().length, 0, 'ACE editor should now be empty');
					setACE('New note two');
					checkFirstNoteLabel();
				});
			});
		}
		
		function checkFirstNoteLabel() {
			elNew1 = F('li[data-id="' + new1ID + '"]');
			elNew1.click();
			F.wait(200, function(){
				console.log('ACE: ' + getACE());
				ok(getACE().contains('This is a title'), 'ACE editor should have first test note contents');
				F('.editor.selected > .title > input').val('New note', 'Contains the default note label').click().then(changeFirstNoteLabel);
			});
		}
		
		function changeFirstNoteLabel() {
			var newLabelText = 'This is a super cool new label';
			massDeleteAction(F('.editor.selected > .title > input')).click().type(newLabelText + '[enter]');
			F.wait(200, function() {
				F('textarea.ace_text-input').click();
				F('.editor.selected > .title > input').val(newLabelText);
				ok(elNew1.text().contains(newLabelText), 'Menu item for note contains new label');
				F.wait(200, deleteNotes);
			});
		}
		
		function deleteNotes() {
			elNew1.click();
			F.wait(200, function() {
				F('.editor > .toolbar a[title="Delete note"]').click();
				F('li[data-id="' + new1ID + '"]').missing(function() {
					elNew2 = F('ul.tree li[data-id="' + new2ID + '"]');
					elNew2.click();
					F.wait(200, function() {
						F('.editor > .toolbar a[title="Delete note"]').click();
						F('ul.tree li[data-id="' + new2ID + '"]').missing('The second note has now been removed');
					});
				}, 'The first note has now been removed');
			});
		}
	});
	
	test('Folder creation and deletion', function() {
		var noteIDs = [],
			folderID = null,
			elFolder = null,
			NOTE_COUNT = 3;
			
		checkLogin(function() {
			count = F('ul.tree li').size();
			F('.opts > button[title="New note"]').click();
			F('.opts > button[title="New note"]').click();
			F('.opts > button[title="New note"]').click();
			F.wait(400, function() {
				for (var i = 0; i < NOTE_COUNT; i++) noteIDs.push(F('ul.tree > li:nth-child(' + ((count + 1) + i) + ')').attr('data-id'));
				
				renameNote(1);
			});
		});
		
		function renameNote(number) {
			F('li[data-id="' + noteIDs[number - 1] + '"]').visible().click();
			F.wait(200, function() {
				massDeleteAction(F('.editor.selected > .title > input')).visible().click().type('Note number ' + number + '[enter]');
				setACE('# A note!\n* Note number ' + number);
				F.wait(200, function() {
					if (number >= NOTE_COUNT) createFolder();
					else renameNote(number + 1);
				});
			});
			
		}
		
		function createFolder() {
			F('.opts > button[title="New folder"]').visible().click();
			F.wait(200, function() {
				folderID = F('ul.tree > li.folder:last-child').attr('data-id');
				elFolder = F('ul.tree > li.folder[data-id="' + folderID + '"]');
				elFolder.visible().click().hasClass('expanded', true);
				
				elFolder.then(function() {
					moveItem(0);
				});
			});
		}
		
		// TODO this part doesn't seem to be working
		function moveItem(index) {
			if (!index) index = 0;
			
			if (index >= NOTE_COUNT) {
				deleteFolder();
				return;
			}
			
			F('ul.tree > li[data-id="' + noteIDs[index] + '"]').visible().click();
			
			F.wait(200, function() {
				F('.editor > .toolbar button[title="Move to"]').visible().click();
				F.wait(200, function() {
					F('.panel').visible();
					F('.panel > ul > li[data-id="' + noteIDs[index] + '"]').visible().click().then(function() {
						moveItem(index + 1);
					});
				});
			});
		}
		
		function deleteFolder() {
			for (var i = 0; i < NOTE_COUNT; i++) elFolder.find('ul > li[data-id="' + noteIDs[i] + '"]').visible();
			elFolder.then(function() {
				elFolder.find('.setting').visible().click();
				elFolder.find('.settings.shown').visible().then(function() {
					elFolder.find('.settings.shown > button[title="Delete"]').visible().click();
					elFolder.missing().then(deleteItem);
				});
			});
		}
		
		function deleteItem(index) {
			if (!index) index = 0;
			
			if (index >= NOTE_COUNT) return;
			
			F('ul.tree > li[data-id="' + noteIDs[index] + '"]').visible().click();
			
			F.wait(200, function() {
				F('.editor > .toolbar a[title="Delete note"]').visible().click();
				F('ul.tree li[data-id="' + index + '"]').missing('The second note has now been removed').then(function() {
					deleteItem(index + 1);
				});
			});
		}
	});
})();