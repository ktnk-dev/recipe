const app = {
    search_query: '',
    default: async () => {
        navigator.userAgentData.mobile ? window.location.href =  window.location.href.split('?')[0] : void 0
        
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
            await main.clear(animations.to_right_side)
            await main.render(await app.default(), animations.from_top)
        } else {
            await main.clear(animations.to_right_side)
            await main.render(await current_page_handler(), animations.to_right_side)
        }
    },

    show: async (id) => {
        await main.clear(animations.to_left_side)
        await main.render(generate.recipe(id), animations.to_left_side)
        
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
    

}


const search = {
    query: '',
    render: (query) => {
        var results = []
        query != '' ? collections.search(query).forEach(id => {results.push(generate.min(id))}) : collections.random().forEach(id => {results.push(generate.min(id))})
        return query != '' 
        ? results.length 
            ? '<h1>Результаты поиска</h1>'+results.join('') 
            : '<h1>Ничего не найдено</h1>'
        : '<h1>Случайные рецепты</h1>'+results.join('')
    }, 

    init: async () => {
        return `
<div class="search">
    <input type="text" placeholder="Название блюда" id="search" onchange="search.find()" value="${search.query}">
    <div class="sb" onclick="app.find()">
        <span>Найти</span>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg>
    </div>
</div>
<div class="results" id="results">
    ${search.render(search.query)}
</div>
        `
    },
    find: async () => {
        var query = document.querySelector('#search').value
        search.query = query
        document.querySelector('#results').innerHTML = search.render(query)
    },


}


const favourites = {
    init: async () => {
        recipesHTML = []
        storage.favourites.forEach(id => {id != '' ? recipesHTML.push(generate.min(id)) : void 0})
        return `
        <h1>Избранное</h1>
        <div class="results" id="results" style="margin: 10px 0 0">
            ${recipesHTML.length ? recipesHTML.join('') : '<h2> Нету сохраненных рецептов</h2>'}
        </div>
        `
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
}

   
const settings = {
    init: async () => {
        const bordersHTML = "`<style id='dbg'>*:hover {border: solid 1px #f00}</style>`"
        var collectionsHTML = []
        Object.keys(collections.data).forEach(id => {
            collectionsHTML.push(`
            <label>
                <input type="checkbox" onchange="setting.collections_exclude_list('${id}', this.checked)" ${collections.exclude.includes(id) ? '' : 'checked'}>
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



