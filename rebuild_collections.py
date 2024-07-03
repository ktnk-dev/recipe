import json


collections_info = {
    # 'alt': '',
    'anti_age': 'Анти-Возраст',
    'best_choice': 'Лучший выбор',
    'for_couples': 'Для пар',
    'main': 'Основное',
    'postnoe': 'Постное',
    'rich_menu': 'По-богаче',
    'vegetarian': 'Вегетарианское'
}


collection = {

}

def generate_recipe(info: dict) -> dict:
    type = info['meal']
    if 'Перекус' in type: type = 'Перекус'

    ingredients = []
    for ingredient in info['ingr'].values():
        ingredients.append({
            'name': ingredient['name'],
            'amount': ingredient['amount'],
            'currency': ingredient['dim']
        })


    return {
        'name': info['name'],
        'type': type,
        'calories': round(info['calories']),
        'ingredients': ingredients,
        'recipe': info['rec'].replace('\n', '', 1),
        'image': None
    }



for id, name in collections_info.items():
    data: dict[str, dict] = json.load(open(f'./legacy_collections/{id}.json', 'r', encoding='utf-8'))['e']
    collection[id] = {
        'name': name,
        'recipes': {},
        'per_day': []
    }

    day = 8
    daily_menu = []
    for recipe in data.values():
        if recipe['name'] not in collection[id]['recipes']: 
            collection[id]['recipes'][recipe['name']] = generate_recipe(recipe)

        if recipe['day'] != day:
            day = recipe['day']
            if daily_menu not in collection[id]['per_day']:
                collection[id]['per_day'].append(daily_menu)
            daily_menu = []

        daily_menu.append(recipe['name'])

json.dump(collection, open('collection.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=4)