module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: ['build/'],
		typescript: {
			base: {
				src: ['src/*.ts'],
				dest: 'build/',
				options: {
					module: 'commonjs', //or commonjs
					target: 'es5', //or es3
					basePath: 'src/',
					sourceMap: true,
					declaration: true
				}
			}
		},
		copy: {
			main: {
				files: [
					{expand: true, src: ['public/**'], dest: 'build/'}
				]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-typescript');

	grunt.registerTask('default', ['clean', 'typescript', 'copy']);
};