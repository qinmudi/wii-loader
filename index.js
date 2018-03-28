/**
 * 平台组前端静态资源加载模块
 * @since	2017-03-13
 * @author	erikqin
 */
export default ((window) => {
	const setImmediate = window.setImmediate ? window.setImmediate : (() => {
		if (typeof process === 'object' && typeof process.nextTick === 'function') {
			return process.nextTick
		} else {
			return function(fn) {
				setTimeout(fn, 0);
			}
		}
	})()

	let loaders = {}
	let cacheMap = {}

	let promiseLoad = (item, increment) => {
		if(cacheMap[item]){
			return false;
		}else{
			cacheMap[item] = 1;
		}
		let promise = new Promise((resolve, reject) => {
			if (item instanceof Promise) {
				reject(`item ${item} must be a promise`)
			} else if (typeof item === 'function') {
				setImmediate(() => {
					item.call(this, resolve, reject)
				})
			} else {
				let regexExt = /(?:\.([^.]+))?$/,
					ext = regexExt.exec(item)[1],
					loader = loaders[ext] || (() => {
						throw 'No loader for file ' + ext;
					})();
				if (typeof loader === 'function') {
					setImmediate(() => {
						loader.call(this, resolve, reject, item)
					})
				} else {
					let element = document.createElement(loader.tag || _loaderDefaults.tag),
						parent = loader.parent || _loaderDefaults.parent,
						attr = loader.attr || _loaderDefaults.attr;
					element.onload = function() {
						resolve(item);
					};
					element.onerror = function() {
						reject('Error while loading ' + item);
					};
					loader.config(element);
					element[attr] = item;
					document[parent].appendChild(element);
				}
			}
		})
		if (increment) promise.then(increment);
		return promise;
	}

	const promiseAsyncLoad = (items, increment) => {
		if (typeof items === 'string' || items instanceof String) {
			items = [promiseLoad(items, increment)];
		} else if (typeof items === 'function') {
			items = [promiseLoad(items, increment)];
		} else {
			for (var i = 0; i < items.length; i++) {
				items[i] = promiseLoad(items[i], increment);
			}
		}
		return Promise.all(items);
	}

	const getPercent = (current, total) => {
		return Math.round((current / total) * 100)
	}

	const load = (resources, callback, progress) => {
		if (resources.length == 0) return

		const increment = (result) => {
			if (progress && !error) progress(getPercent(counter++, total))
			return result
		}

		let error = false,
			counter = 0,
			total = resources[0] instanceof Array ? resources[0].length : 1,
			result = callback ? [] : undefined,
			prom = promiseAsyncLoad(resources[0], increment)

		resources.forEach((item) => {
			if (item !== resources[0]) {
				total += item instanceof Array ? item.length : 1;
				prom = prom.then(function(data) {
					if (callback) result.push(data);
					return promiseAsyncLoad(item, increment);
				});
			}
		})

		prom.then(function(data) {
			if (callback) {
				result.push(data);
				callback(false, result);
			}
		}).catch(function(err) {
			error = true;
			if (callback) callback(err);
		});
		increment();
		return prom;
	}

	const addLoader = (loader) => {
		let i, exts = loader.ext.split(',');
		for (i = exts.length - 1; i > -1; i--) {
			loaders[exts[i]] = 'custom' in loader ? loader.custom : loader;
		}
	}

	var _loaderDefaults = {
		tag: 'link',
		parent: 'head',
		attr: 'href'
	}

	addLoader({
		ext: 'js',
		tag: 'script',
		parent: 'body',
		attr: 'src',
		config: (el) => {
			el.async = false
		}
	})

	addLoader({
		ext: 'css',
		config: (el) => {
			el.type = 'text/css'
			el.rel = 'stylesheet'
		}
	})

	addLoader({
		ext: 'jpg,png,gif,svg',
		custom: function(resolve, reject, url) {
			console.log('Loading Image', url);
			var image = new Image();
			image.onload = function() {
				resolve(image);
			};
			image.onerror = function() {
				reject('Unable to load image ' + url);
			};
			image.src = url;
		}
	})

	addLoader({
		ext: 'html',
		config: (el) => {
			el.rel = 'import'
		}
	})

	window.addEventListener('unhandledrejection', function(event) {
		console.error(event.type, event.reason)
		event.preventDefault()
	}, true)

	window.WiiLoader = {}
	window.WiiLoader.load = load
	window.WiiLoader.loadOne = promiseLoad
	window.WiiLoader.loadMany = promiseAsyncLoad
	window.WiiLoader.addLoader = addLoader
	window.WiiLoader.loaders = loaders

	return WiiLoader
})(window)