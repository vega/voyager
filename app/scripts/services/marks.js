'use strict';

var includeZero = {
	name: 'zero',
	default: false,
	type: 'bool'
}

var reverse = {
	name: 'reverse',
	default: false,
	type: 'bool'
}

var scale = {
	name: 'scale',
	default: 'linear',
	type: 'choice',
	choices: ['linear', 'logarithmic']
}

var weight = {
	name: 'fontWeight',
	default: 'normal',
	type: 'choice',
	choices: ['normal', 'bold']
}

var size = {
	name: 'fontSize',
	default: 10,
	type: 'integer'
}

var font = {
	name: 'font',
	default: 'Halvetica Neue',
	type: 'string'
}

var marks = [
	{
		name: 'x',
		config: {
			Q: [includeZero,
				reverse,
				scale],
			O: [reverse],
			T: [reverse,
				scale]
		}
	},{
		name: 'y',
		config: {
			Q: [includeZero,
				reverse,
				scale],
			O: [reverse],
			T: [reverse,
				scale]
		}
	},{
		name: 'row',
		config: {
			O: [reverse]
		}
	},{
		name: 'col',
		config: {
			O: [reverse]
		}
	},{
		name: 'size',
		config: {
			Q: [includeZero,
				reverse,
				scale],
			O: [reverse],
			T: [reverse,
				scale]
		}
	},{
		name: 'color',
		config: {
			Q: [includeZero,
				reverse,
				scale],
			O: [reverse],
			T: [reverse,
				scale]
		}
	},{
		name: 'alpha',
		config: {
			Q: [includeZero,
				reverse,
				scale],
			O: [reverse],
			T: [reverse,
				scale]
		}
	},{
		name: 'shape',
		config: {
			O: [reverse]
		}
	},{
		name: 'text',
		config: {
			Q: [weight, size, font],
			O: [weight, size, font],
			T: [weight, size, font]
		}
	}
]

angular.module('vleApp')
  .constant('Marks', marks);
