'use strict'

const isPlainObj = require('is-plain-obj')
const pify = require('pify')
const componentsLookup = require('components-lookup')
const server = require('./server')
const script = require('./script')

/**
 * Returns the HTML and JSON of the UI.
 * @public
 * @param {?Object} opts - Options.
 * @returns {Promise<Object>} HTML and JSON of the UI.
 */
module.exports = async function(opts = {}) {

	if (isPlainObj(opts)===false && opts!=null) throw new Error(`'opts' must be an object, null or undefined`)

	const resolvers = [
		{
			id: 'view',
			label: 'View',
			languages: [ 'twig' ],
			resolve: (fileName, fileExt) => [ `${ fileName }${ fileExt }` ]
		},
		{
			id: 'data',
			label: 'Data',
			languages: [ 'json', 'js' ],
			resolve: (fileName, fileExt) => [ `${ fileName }.data.json`, `${ fileName }.data.js` ]
		},
		{
			id: 'notes',
			label: 'Notes',
			languages: [ 'markdown' ],
			resolve: (fileName, fileExt) => [ `${ fileName }.md` ]
		},
		{
			id: 'config',
			label: 'Config',
			languages: [ 'json' ],
			parse: (contents) => contents=='' ? {} : JSON.parse(contents),
			resolve: (fileName, fileExt) => [ `${ fileName }.config.json` ]
		}
	]

	const statuses = {
		wip: {
			label: 'WIP',
			description: 'Work in progress',
			color: '#fe913d'
		},
		pending: {
			label: 'Pending',
			description: 'Ready, but waiting for finalization',
			color: '#2d90e8'
		},
		ready: {
			label: 'Ready',
			description: 'Ready to implement',
			color: '#2bc052'
		}
	}

	opts = Object.assign({
		lang: 'en',
		title: 'Malvid',
		description: 'UI to help you build and document web components.',
		src: '',
		pattern: '**/[^_]*.{ejs,njk}',
		resolvers,
		statuses
	}, opts)

	const components = await componentsLookup(opts.pattern, opts.resolvers, { cwd: opts.src })
	const js = await script

	const state = {
		components,
		opts
	}

	return {
		html: pify(server)(state, js),
		json: Promise.resolve(state)
	}

}