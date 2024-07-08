const collections = {
    data: {},
    exclude: [],

    generateID: (collection, meal_name) => {
        var string = `c=${collection}&n=${meal_name}`
        var id = 0, i, chr
        if (string.length === 0) return id
        for (i = 0; i < string.length; i++) {
            chr = string.charCodeAt(i)
            id = ((id << 5) - id) + chr
            id |= 0
        }
        id = id.toString(16)
        if (id[0] == '-') id = 'n'+id.slice(1)
        return id
    },

    search: (query, exclude_types = []) => {
        var results = []
        Object.keys(collections.data).forEach(col => {
            if (collections.exclude.includes(col)) {return}
            Object.keys(collections.data[col].recipes).forEach(meal => {
                if (meal.toLocaleLowerCase().includes(query.toLocaleLowerCase())) {
                    if (exclude_types.includes(collections.data[col].recipes[meal].type)) {return}
                    results.push(collections.generateID(col, meal))
                }
            })
        })
        if (debug && results.length) console.log('Found', results.length, 'results with query: ', query, exclude_types)
        if (debug && !results.length) console.warn('Not results found with query: ', query, exclude_types)
        return results
    },
    random: () => {
        var results = []
        var search_list = []
        Object.keys(collections.data).forEach(c => {
            if (!collections.exclude.includes(c)) search_list.push(c)
        })
        for (let _ = 0; _ < 25; _++) {
            const random_collection = search_list[Math.round(Math.random()*(search_list.length-1))]
            const meal_list = Object.keys(collections.data[random_collection].recipes)
            const random_meal = meal_list[Math.round(Math.random()*(meal_list.length-1))]
            const random_id = collections.generateID(random_collection, random_meal)
            !results.includes(random_id) ? results.push(random_id) : void 0
        }
        if (debug) console.log('Generated', results.length, 'random results')
        return results
    },
    get: (id) => {
        var result, collection
        Object.keys(collections.data).forEach(col => {
            Object.keys(collections.data[col].recipes).forEach(meal => {
                if (collections.generateID(col, meal) == id) {
                    collection = collections.data[col].name
                    result = collections.data[col].recipes[meal]
                }
            })
        })
        if (result) {
            if (debug) console.log('Found recipe:', result.name, '| id:', id, '| collection:', collection)
            return {
                collection: collection,
                name: result.name,
                data: result
            }
        } else {
            if (debug) console.error('Recipe not found by id:', id)
            throw new Error('not found')
        }
    }
}

const cookie = {
    version: '1.0',
    refresh: () => {
        document.cookie = 'main|favourites=|; expires=Mon, 1 Jan 2035 12:00:00 UTC; path=/; sameStie=none'
        document.cookie = 'main|exclude=|; expires=Mon, 1 Jan 2035 12:00:00 UTC; path=/; sameStie=none'
        document.cookie = `main|version=${cookie.version}; expires=Mon, 1 Jan 2035 12:00:00 UTC; path=/; sameStie=none`
    },
    init: () => {
        var data = {}
        document.cookie.split('; ').forEach(cookie => {
            if (cookie.split('=')[0].split('|')[0] == 'main'){
                const key = cookie.split('=')[0].split('|')[1]
                var value = cookie.split('=')[1]
                if (debug) console.log('loaded cookie', key, value)
                if (value == 'true') {value = true}
                if (value == 'false') {value = false}
                if (value[0] == '|') {value = value.slice(1).split('|')}
                data[key] = value
            }
        })
        
        storage = data
    }, 
    save: () => {
        Object.keys(storage).forEach(key => {
            var value = storage[key] 
            if (typeof(value) == 'object'){ value = ''; storage[key].forEach(e => {value += `|${e}`})}
            document.cookie = `main|${key}=${value}; expires=Mon, 1 Jan 2035 12:00:00 UTC; path=/; sameStie=none`
        })
    }
}

var storage = {}
