const source_code = 'https://github.com/ktnk-dev/recipe'
var rendering_active = false
var debug = false
var current_page_index = -1
var current_page_handler

const sleep = ms => new Promise(r => setTimeout(r, ms));

init = async () => {
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
    try {theme.set(storage.theme)} catch {theme.set('dark')}

    if (window.location.search.startsWith('?update')) {
        const prefetch = [
            './index.html',
            './static/style/ui.css',
            './static/style/app.css',
            './static/style/recipes.css',

            './static/js/app.js',
            './static/js/init.js',
            './static/js/render.js',
            './static/js/storage.js',
        ]
        document.querySelector('body > .load > h1').innerHTML = 'Обновление...'

        for (let i = 0; i < prefetch.length; i++) {
            const file = prefetch[i];
            await fetch(file, {headers: {'Cache-Control': 'no-cache'}})
            
        }
        await sleep(1000)
        window.location.href =  window.location.href.split('?')[0] 
    }

    
    if (window.location.search != '') {
        document.querySelector('main').innerHTML = ''
        document.querySelector('main').classList.remove('default')
    }

    document.querySelectorAll('aside > .side').forEach(e => {
        const text = e.querySelector('span').innerHTML
        e.onclick = () => {renderMenu(text, e)}
    })



    await sleep(250)
    await fetch('./collection.json').then(e => {return e.json()}).then(async d => {
        collections.data = d
        if (window.location.search == '') app.back()
        document.querySelector('.load').style.opacity = 0
        await sleep(300)
        document.querySelector('.load').remove()
    })


    if (window.location.search != '') {
        await main.render(generate.recipe(window.location.search.slice(1)), animations.to_left_side)
    }


    if (typeof storage.exclude == 'string') storage.exclude = []
    collections.exclude = storage.exclude
}