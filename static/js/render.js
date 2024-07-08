const animations = {
    to_left_side: ' .25s',
    to_right_side: '_r .25s',
    from_top: '_d 1s',
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


const generate = {
    min: (id) => {
        var recipe = collections.get(id)
        return `
<div class="recipe_mini" onclick="app.show('${id}')">
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
        <button id="savebutton" onclick="favourites.save('${id}')">
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


renderMenu = async (menu_name, target) => {
    if (rendering_active) {
        await sleep(450)
        if (rendering_active) return
    }

    rendering_active = true
    if (target == document.querySelector('aside > .side.active')) {return}
    try{document.querySelector('aside > .side.active').classList.remove('active')}catch{}
    target.classList.add('active')
    if (debug) console.log('Tab changed to:', menu_name, target)

    pages = {
        'Рецепты': search.init,
        'Избранное': favourites.init,
        'Настройки': settings.init,
    }
    direction = Object.keys(pages).indexOf(menu_name) > current_page_index ? animations.to_left_side : animations.to_right_side
    await main.clear(direction)
    current_page_index = Object.keys(pages).indexOf(menu_name) 
    current_page_handler = pages[menu_name]
    await main.render(await pages[menu_name](), direction)
    rendering_active = false
    return
}
