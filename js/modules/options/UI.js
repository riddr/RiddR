/*
 * RiddR Options UI router
 *
 * Pre-load specified UI modules, and provide interface for dynamic loading of specific modules
 * additionaly this module allows interaction between specific subset of modules by using module references 
 * eg. UI.mdule.property or method()
 *
 * @package		RiddR
 * @category	Options
 * @author		Trajche Petrov
 * @link		https://github.com/riddr/RiddR/blob/master/js/modules/options/UI.js
*/

class UI
{
	// preloaded modules
	#modules = 	[
					'snackbar', 'error', 'modal', 'dom', 'read'
				];

	// initialize the UI router
	constructor ()
	{
		for ( const module in this.#modules )
			this.#load( this.#modules[module] );

		// return the proxied 
		return new Proxy( this, this.handler() );
	}

	// storage magic router 
	handler()
	{ 
		return 	{
					get: ( TARGET, NAME, RECEIVER ) => 
					{
						// check pre/loaded modules 
						if( this.#modules[NAME] )
							return this.#modules[NAME]

						// load the missing module
						return this.#load( NAME );
					}
				}
	}

	// dynamicaly load UI submodule
	async #load ( NAME )
	{
		// load the module file
		const module =  await import(`./${NAME}.js`)

		// return the module object
		return this.#modules[NAME] = module.default
	}
}

export default new UI();