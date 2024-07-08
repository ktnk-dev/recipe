const source_code = 'https://github.com/ktnk-dev/recipe'
var rendering_active = false
var debug = false
var current_page_index = -1
var current_page_handler

const sleep = ms => new Promise(r => setTimeout(r, ms));

init = async () => {
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
        await main.render(generate.recipe(window.location.search.slice(1)), animations.to_left_side)
    }


    if (typeof storage.exclude == 'string') storage.exclude = []
    collections.exclude = storage.exclude
}