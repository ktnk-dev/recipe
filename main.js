// DEFAULT
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function init() {
    if (window.location.search != '') {
        document.querySelector('main').innerHTML = ''
        document.querySelector('main').classList.remove('default')
    }

    document.querySelectorAll('aside > .side').forEach(e => {
        const text = e.querySelector('span').innerHTML
        e.onclick = () => {renderMenu(text, e)}
    })


    try {
        cookie.init()
        if (storage.version != cookie.version) {
            cookie.refresh()
            cookie.init()
        } 
    } catch {
        cookie.refresh()
        cookie.init()
    }
    await sleep(250)
    await fetch('./collection.json').then(e => {return e.json()}).then(async d => {
        collections.data = d
        if (window.location.search == '') app.back()
        document.querySelector('.load').style.opacity = 0
        await sleep(300)
        document.querySelector('.load').remove()
    })
    if (window.location.search != '') {
        // await main.clear(animations.to_left_side)
        await main.render(generate.recipe(window.location.search.slice(1)), animations.to_left_side)
    }
    if (typeof storage.exclude == 'string') storage.exclude = []
    collections.exclude = storage.exclude
}
async function renderMenu(menu_name, target) {
    while (rendering_active) {await sleep(25)}
    rendering_active = true
    if (target == document.querySelector('aside > .side.active')) {return}
    try{document.querySelector('aside > .side.active').classList.remove('active')}catch{}
    target.classList.add('active')
    if (debug) console.log('Tab changed to:', menu_name, target)

    pages = {
        'Рецепты': app.search,
        'Избранное': app.favourites,
        'Настройки': app.settings,
    }
    direction = Object.keys(pages).indexOf(menu_name) > current_page_index ? animations.to_left_side : animations.to_right_side
    await main.clear(direction)
    current_page_index = Object.keys(pages).indexOf(menu_name) 
    current_page_handler = pages[menu_name]
    await main.render(await pages[menu_name](), direction)
    rendering_active = false
}

const source_code = 'https://github.com/ktnk-dev/recipe'
var rendering_active = false
var debug = false
var current_page_index = -1
var current_page_handler
var storage = {}

// OBJECTS
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
const main = {
    clear: async (direction) => {
        if (debug) console.log('Clearing main element innerHTML:', parseFloat(direction.split(' ')[1]), 's')
        document.querySelectorAll('main > *').forEach(e => {
            e.style.animation = `hide${direction} cubic-bezier(.99,-0.02,.54,.74)`
        })
        await sleep(240)
        try{document.querySelector('main').classList.remove('default')}catch{}
        document.querySelector('main').innerHTML = ''
    },
    render: async (innerHTML, direction) => {
        if (debug) console.log('Rendering new main element innerHTML:', parseFloat(direction.split(' ')[1]), 's')
        if (direction == animations.from_top) {}
        else if (direction == animations.to_left_side) {direction = animations.to_right_side}
        else if (direction == animations.to_right_side) {direction = animations.to_left_side}
        document.querySelector('main').innerHTML = innerHTML
        document.querySelectorAll('main > *').forEach(e => {
            e.style.animation = `hide${direction} cubic-bezier(.99,-0.02,.54,.74) reverse`
        })
        await sleep(parseFloat(direction.split(' ')[1])*1000 - 10)
        document.querySelectorAll('main > *').forEach(e => {
            e.style.animation = ``
        })
        rendering_active = false
    }
}

const animations = {
    to_left_side: ' .25s',
    to_right_side: '_r .25s',
    from_top: '_d 1s',
}


const generate = {
    min: (id) => {
        var recipe = collections.get(id)
        return `
<div class="recipe_mini" onclick="app.showRecipe('${id}')">
    <h2>${recipe.name}</h2>
    <div class="info">
        <span>
            <span>
                <span>
                    ${recipe.data.calories} ккал.
                </span>
                ${recipe.collection}
            </span>
            ${recipe.data.type}
        </span>
    </div>
</div>
        `
    },
    recipe: (id) => {
        const recipe = collections.get(id)
        var ingredientHTML = []
        recipe.data.ingredients.forEach(ingredient => {
            ingredientHTML.push(`
            <div>
                <span class="name">${ingredient.name}</span>
                <span class="amount">${ingredient.amount} ${ingredient.currency}</span>
            </div>
            `)
        })

        return `
<div class="recipe">
    <div class="back" onclick="app.back()">
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"/></svg>
        <span>Назад</span>
    </div>
    <h1>${recipe.name}</h1>
    <div class="collections">
        <span>
            <span>
                <span>
                    ${recipe.data.calories} ккал.
                </span>
                ${recipe.collection}
            </span>
            ${recipe.data.type}
        </span>
    </div>
    <div class="info">
        <div class="ingredients">
            <h2>Ингредиенты</h2>
            <div class="list">
                ${ingredientHTML.join('')}
            </div>
        </div>
        <div class="todo">
            <h2>Рецепт</h2>
            <p>${recipe.data.recipe.split('\n').join('</p><p>').split('. ').join('.').split('.').join('. ')}</p>
        </div>
    </div>
    <div class="buttons">
        <button id="savebutton" onclick="app.save('${id}')">
        ${
            !storage.favourites.includes(id)
            ? `
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M440-501Zm0 381L313-234q-72-65-123.5-116t-85-96q-33.5-45-49-87T40-621q0-94 63-156.5T260-840q52 0 99 22t81 62q34-40 81-62t99-22q81 0 136 45.5T831-680h-85q-18-40-53-60t-73-20q-51 0-88 27.5T463-660h-46q-31-45-70.5-72.5T260-760q-57 0-98.5 39.5T120-621q0 33 14 67t50 78.5q36 44.5 98 104T440-228q26-23 61-53t56-50l9 9 19.5 19.5L605-283l9 9q-22 20-56 49.5T498-172l-58 52Zm280-160v-120H600v-80h120v-120h80v120h120v80H800v120h-80Z"/></svg>
            <span>Сохранить рецепт</span>`
            : `
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M440-501Zm0 381L313-234q-72-65-123.5-116t-85-96q-33.5-45-49-87T40-621q0-94 63-156.5T260-840q52 0 99 22t81 62q34-40 81-62t99-22q84 0 153 59t69 160q0 14-2 29.5t-6 31.5h-85q5-18 8-34t3-30q0-75-50-105.5T620-760q-51 0-88 27.5T463-660h-46q-31-45-70.5-72.5T260-760q-57 0-98.5 39.5T120-621q0 33 14 67t50 78.5q36 44.5 98 104T440-228q26-23 61-53t56-50l9 9 19.5 19.5L605-283l9 9q-22 20-56 49.5T498-172l-58 52Zm160-280v-80h320v80H600Z"/></svg>            
            <span>Удалить рецепт</span>`
        }
        </button>
        <div class="mini">
            <button onclick="app.copy('${id}')">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/></svg>
            </button>
            <button onclick="app.share('${id}')">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M720-80q-50 0-85-35t-35-85q0-7 1-14.5t3-13.5L322-392q-17 15-38 23.5t-44 8.5q-50 0-85-35t-35-85q0-50 35-85t85-35q23 0 44 8.5t38 23.5l282-164q-2-6-3-13.5t-1-14.5q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35q-23 0-44-8.5T638-672L356-508q2 6 3 13.5t1 14.5q0 7-1 14.5t-3 13.5l282 164q17-15 38-23.5t44-8.5q50 0 85 35t35 85q0 50-35 85t-85 35Zm0-640q17 0 28.5-11.5T760-760q0-17-11.5-28.5T720-800q-17 0-28.5 11.5T680-760q0 17 11.5 28.5T720-720ZM240-440q17 0 28.5-11.5T280-480q0-17-11.5-28.5T240-520q-17 0-28.5 11.5T200-480q0 17 11.5 28.5T240-440Zm480 280q17 0 28.5-11.5T760-200q0-17-11.5-28.5T720-240q-17 0-28.5 11.5T680-200q0 17 11.5 28.5T720-160Zm0-600ZM240-480Zm480 280Z"/></svg>
            </button>
        </div>
    </div>
</div>
    `
    }
}



const app = {
    search_query: '',
    default: async () => {
        window.history.replaceState( {}, 'Рецепты', window.location.href.split('?')[0]);
        document.querySelector('main').classList.add('default')
        var total_recipes = 0
        Object.keys(collections.data).forEach(c => {total_recipes += Object.keys(collections.data[c].recipes).length})

        return `
        <div class="center">
            <h1>Рецепты</h1>
            <h2>${total_recipes} рецептов в базе</h2>
        </div>
        <div class="bottom">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z"/></svg>
            <span>Выбери пункт ниже</span>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z"/></svg>
        </div>
        `
    },
    back: async () => {
        if (!current_page_handler) {
            await main.render(await app.default(), animations.from_top)
        } else {
            await main.clear(animations.to_right_side)
            await main.render(await current_page_handler(), animations.to_right_side)
        }
    },

    showRecipe: async (id) => {
        await main.clear(animations.to_left_side)
        await main.render(generate.recipe(id), animations.to_left_side)
        
    },



    search: async () => {
        return `
<div class="search">
    <input type="text" placeholder="Название блюда" id="search" onchange="app.find()" value="${app.search_query}">
    <div class="sb" onclick="app.find()">
        <span>Найти</span>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg>
    </div>
</div>
<div class="results" id="results">
    ${app.findHTML(app.search_query)}
</div>
        `
    },
    copy: (id) => {
        const recipe = collections.get(id)
        var ingredients = []
        var index = 0
        recipe.data.ingredients.forEach(ingredient => {
            index++
            ingredients.push(`${index}. ${ingredient.name} — ${ingredient.amount} ${ingredient.currency}`)
        })

        text = `${recipe.name} — ${recipe.data.calories} ккал., ${recipe.collection}, ${recipe.data.type}

Ингредиенты:
${ingredients.join('\n')}

Рецепт:
${recipe.data.recipe.split('. ').join('.').split('.').join('. ')}`
        // https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
        var input = document.createElement('textarea');
        input.innerHTML = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        if (debug) console.log('Copied recipe')
        alert('Рецепт скопирован')
    },
    share: (id) => {
        // https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
        var input = document.createElement('textarea');
        input.innerHTML = window.location.href + '?' + id;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        if (debug) console.log('Copied url to recipe')
        alert('Ссылка на рецепт скопирована')
    },
    save: (id) => {
        // collections.exclude = collections.exclude.filter(e => e !== collection_code)
        if (storage.favourites.includes(id)) {
            storage.favourites = storage.favourites.filter(e => {e !== id})
            document.querySelector('#savebutton').innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M440-501Zm0 381L313-234q-72-65-123.5-116t-85-96q-33.5-45-49-87T40-621q0-94 63-156.5T260-840q52 0 99 22t81 62q34-40 81-62t99-22q81 0 136 45.5T831-680h-85q-18-40-53-60t-73-20q-51 0-88 27.5T463-660h-46q-31-45-70.5-72.5T260-760q-57 0-98.5 39.5T120-621q0 33 14 67t50 78.5q36 44.5 98 104T440-228q26-23 61-53t56-50l9 9 19.5 19.5L605-283l9 9q-22 20-56 49.5T498-172l-58 52Zm280-160v-120H600v-80h120v-120h80v120h120v80H800v120h-80Z"/></svg>
            <span>Сохранить рецепт</span>
            `
        } else {
            try {storage.favourites.push(id)} catch {storage.favourites = [id]}
            document.querySelector('#savebutton').innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M440-501Zm0 381L313-234q-72-65-123.5-116t-85-96q-33.5-45-49-87T40-621q0-94 63-156.5T260-840q52 0 99 22t81 62q34-40 81-62t99-22q84 0 153 59t69 160q0 14-2 29.5t-6 31.5h-85q5-18 8-34t3-30q0-75-50-105.5T620-760q-51 0-88 27.5T463-660h-46q-31-45-70.5-72.5T260-760q-57 0-98.5 39.5T120-621q0 33 14 67t50 78.5q36 44.5 98 104T440-228q26-23 61-53t56-50l9 9 19.5 19.5L605-283l9 9q-22 20-56 49.5T498-172l-58 52Zm160-280v-80h320v80H600Z"/></svg>            
            <span>Удалить рецепт</span>
            `
        }
        cookie.save()
    },


    findHTML: (query) => {
        var results = []
        query != '' ? collections.search(query).forEach(id => {results.push(generate.min(id))}) : collections.random().forEach(id => {results.push(generate.min(id))})
        return query != '' 
        ? results.length 
            ? '<h1>Результаты поиска</h1>'+results.join('') 
            : '<h1>Ничего не найдено</h1>'
        : '<h1>Случайные рецепты</h1>'+results.join('')
    }, 
    find: async () => {
        var query = document.querySelector('#search').value
        app.search_query = query
        document.querySelector('#results').innerHTML = app.findHTML(query)
    },
    favourites: async () => {
        recipesHTML = []
        storage.favourites.forEach(id => {id != '' ? recipesHTML.push(generate.min(id)) : void 0})
        return `
        <h1>Избранное</h1>
        <div class="results" id="results" style="margin: 10px 0 0">
            ${recipesHTML.length ? recipesHTML.join('') : '<h2> Нету сохраненных рецептов</h2>'}
        </div>
        `
    },
    settings: async () => {
        const bordersHTML = "`<style id='dbg'>*:hover {border: solid 1px #f00}</style>`"
        var collectionsHTML = []
        Object.keys(collections.data).forEach(id => {
            collectionsHTML.push(`
            <label>
                <input type="checkbox" onchange="app.collections_exclude_list('${id}', this.checked)" ${collections.exclude.includes(id) ? '' : 'checked'}>
                <span>${collections.data[id].name}</span>
            </label>
            `)
        })
        return `
        <h1>Настройки</h1>
        <div class="setting">
            <div class="title">
                <h2>Доступные коллекции</h2>
                <span>Выбранные коллекции будут отображаться в поиске и в случайной подборке рецептов</span>
            </div>
            <div class="edit checkboxes">
                ${collectionsHTML.join('')}
            </div>
        </div>
        <div class="setting">
            <div class="title">
                <h2>Для разработчиков</h2>
                <span>Эти опции предназначены только для разработчиков</span>
            </div>
            <div class="edit checkboxes">
                <label>
                    <input type="checkbox" onchange="debug = this.checked">
                    <span>Подробный лог</span>
                </label>
                <label>
                    <input type="checkbox" onchange="window.location.href = '${source_code}'">
                    <span>Открыть исходный код</span>
                </label>
                <label>
                    <input type="checkbox" onchange="window.location.href = './collection.json'">
                    <span>Открыть <code>collection.json</code></span>
                </label>
                <label>
                    <input type="checkbox" onchange="this.checked ? document.head.innerHTML += ${bordersHTML} : document.getElementById('dbg').remove()">
                    <span>Отображать границы элементов</span>
                </label>
                <label>
                    <input type="checkbox" onchange="">
                    <span>Использовать <code>Silence/dev</code></span>
                </label>
            </div>
        </div>
        ` // TODO: наконец доделать Silence 
    },

    collections_exclude_list: (collection_code, state) => {
        if (debug) console.log(state ? 'Include collection: ' : 'Exclude collection: ', collections.data[collection_code].name)
        if (state) {
            if (collections.exclude.includes(collection_code)) collections.exclude = collections.exclude.filter(e => {e !== collection_code})
        }
        else {
            if (!collections.exclude.includes(collection_code)) 
                collections.exclude.push(collection_code)
        }
        storage.exclude = collections.exclude
        cookie.save()
    }

}




default_ = `
<h1>Рецепты</h1>
<h3>Сайт с огромным количеством рецептов, отсортированные по коллекциям</h3>
<h3>Выбери нужный пункт в самом низу экрана</h3>
<button onclick="window.location.href = 'https://github.com/ktnk-dev'">
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M640-480v-80h80v80h-80Zm0 80h-80v-80h80v80Zm0 80v-80h80v80h-80ZM447-640l-80-80H160v480h400v-80h80v80h160v-400H640v80h-80v-80H447ZM160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h240l80 80h320q33 0 56.5 23.5T880-640v400q0 33-23.5 56.5T800-160H160Zm0-80v-480 480Z"/></svg>
    <span>Открыть исходный код</span>
</button>
`
