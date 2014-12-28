'use strict';

var includeZero = {
	name: 'zero',
	default: false,
	type: 'bool',
	property: 'scale'
}

var reverse = {
	name: 'reverse',
	default: false,
	type: 'bool',
	property: 'scale'
}

var scaleType = {
	name: 'scale',
	default: 'linear',
	type: 'choice',
	choices: ['linear', 'logarithmic', 'power', 'quantile'],
	property: 'scale'
}

var weight = {
	name: 'weight',
	default: 'normal',
	type: 'choice',
	choices: ['normal', 'bold'],
	property: 'text'
}

var size = {
	name: 'size',
	default: 10,
	type: 'integer',
	property: 'font'
}

var font = {
	name: 'name',
	default: 'Halvetica Neue',
	type: 'string',
	property: 'font'
}

var marks = [
	{
		name: 'x',
		config: {
			Q: [includeZero,
				reverse,
				scaleType],
			O: [reverse],
			T: [reverse,
				scaleType]
		}
	},{
		name: 'y',
		config: {
			Q: [includeZero,
				reverse,
				scaleType],
			O: [reverse],
			T: [reverse,
				scaleType]
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
				scaleType],
			O: [reverse],
			T: [reverse,
				scaleType]
		}
	},{
		name: 'color',
		config: {
			Q: [includeZero,
				reverse,
				scaleType],
			O: [reverse],
			T: [reverse,
				scaleType]
		}
	},{
		name: 'alpha',
		config: {
			Q: [includeZero,
				reverse,
				scaleType],
			O: [reverse],
			T: [reverse,
				scaleType]
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
