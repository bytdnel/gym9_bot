const fs = require('fs')
const cheerio = require('cheerio')
const request = require('request')
const HtmlTableToJson = require('html-table-to-json');
const express = require('express')
const VkBot = require('node-vk-bot-api');
const Markup = require('node-vk-bot-api/lib/markup')
const Session = require('node-vk-bot-api/lib/session');
const Stage = require('node-vk-bot-api/lib/stage');
const Scene = require('node-vk-bot-api/lib/scene');
const bodyParser = require('body-parser')
const vk_token = 'a8dede36c00ac4d8b6fd4ce2a71f4aa9123096189bbe363b789621b182c4d56b31dcaa49ae20483d3248c'
const bot = new VkBot(vk_token)

const schedule_time = JSON.parse(fs.readFileSync('./time.json'))
const schedule = JSON.parse(fs.readFileSync('./auto_schedule.json'))
const schedule_sceleton = JSON.parse(fs.readFileSync('./schedule_sceleton.json'))

let emoji = '😊😃😉😄😇😨😀😁😱👍✌👏👌🌟☀⛄😹😸😺⏰🌝✏✒🎉🎊📅📒📓📔📕📖📗📘📙📚📝📜📉📊📋📌📍📎📐🔬🏈⚽'

let port = process.env.PORT || 3000

let app = express()
app.use(bodyParser.json());

// META

const config = {
    timeStepMs: 2*60*60*1000,
    forms_meaning: {
        "5А": {form: {v:5, i:0}, letter: {v:"А", i:0}},
        "5Б": {form: {v:5, i:0}, letter: {v:"Б", i:1}},
        "5В": {form: {v:5, i:0}, letter: {v:"В", i:2}},
        "5Г": {form: {v:5, i:0}, letter: {v:"Г", i:3}},
        "6А": {form: {v:6, i:1}, letter: {v:"А", i:0}},
        "6Б": {form: {v:6, i:1}, letter: {v:"Б", i:1}},
        "6В": {form: {v:6, i:1}, letter: {v:"В", i:2}},
        "6Г": {form: {v:6, i:1}, letter: {v:"Г", i:3}},
        "7А": {form: {v:7, i:2}, letter: {v:"А", i:0}},
        "7Б": {form: {v:7, i:2}, letter: {v:"Б", i:1}},
        "7В": {form: {v:7, i:2}, letter: {v:"В", i:2}},
        "7Г": {form: {v:7, i:2}, letter: {v:"Г", i:3}},
        "8А": {form: {v:8, i:3}, letter: {v:"А", i:0}},
        "8Б": {form: {v:8, i:3}, letter: {v:"Б", i:1}},
        "8В": {form: {v:8, i:3}, letter: {v:"В", i:2}},
        "8Г": {form: {v:8, i:3}, letter: {v:"Г", i:3}},
        "9А": {form: {v:9, i:4}, letter: {v:"А", i:0}},
        "9Б": {form: {v:9, i:4}, letter: {v:"Б", i:1}},
        "9В": {form: {v:9, i:4}, letter: {v:"В", i:2}},
        "9Г": {form: {v:9, i:4}, letter: {v:"Г", i:3}},
        "10А": {form: {v:10, i:5}, letter: {v:"А", i:0}},
        "10Б": {form: {v:10, i:5}, letter: {v:"Б", i:1}},
        "11А": {form: {v:11, i:6}, letter: {v:"А", i:0}},
        "11Б": {form: {v:11, i:6}, letter: {v:"Б", i:1}}
    },
    lesson_ctx: [
        "Алгебра",
        "Английский язык",
        "Астрономия",
        "Биология",
        "Вн.Воспитательные мероприятия",
        "Вн.Жизнь уч.сообществ",
        "Вн.ОБЖ",
        "Вн.ОДНКНР",
        "Вн.Практикум по математике",
        "Вн.Робототехника",
        "Вн.Экологическая лаб.",
        "Вн.вокал",
        "Вн.диалог культур",
        "Вн.индивидуальный проект",
        'Вн.метапредмет "Слово"',
        "Вн.предметной направлен",
        "Вн.социальное направление",
        "Вн.спорт",
        "Вн.сценическая речь",
        "Второй иностранный язык",
        "География",
        "Геометрия",
        "Изобразительное искусство",
        "Индивидуальный проект",
        "Информатика",
        "История",
        "Литература",
        "Математика",
        "Музыка",
        "ОБЖ",
        "Обществознание",
        "Основы финансовой грам",
        "Право",
        "Родной язык\\родная литература",
        "Технология",
        "Физика",
        "Физическая культура",
        "Химия",
        "Экономика",
        "Русский язык"
    ]
}

const keyboards = {
    default: Markup.keyboard([
        [
            Markup.button({
                action: {
                  type: 'open_link',
                  link: 'https://vk.com/im?sel=211349777',
                  label: '⚠️ Сообщить об ошибке ⚠️',
                  payload: JSON.stringify({
                    url: 'https://vk.com/im?sel=211349777',
                  }),
                }
              })
        ],
        [
            Markup.button({
                action: {
                  type: 'open_link',
                  link: 'https://vk.com/im?sel=421614165',
                  label: '🌝 Написать адмиралу 🌝',
                  payload: JSON.stringify({
                    url: 'https://vk.com/im?sel=421614165',
                  }),
                }
              }),
        ],
        [
            Markup.button('📅 Расписание 📅')
        ],
        [
            Markup.button('📎 Соц.сети 📎')
        ]
    ])
    .oneTime(),
    massmedia: Markup.keyboard([
        [
            Markup.button('📌 Главное меню 📌', 'positive')
        ],
        [
            Markup.button({
                action: {
                    type: 'open_link',
                    link: 'https://www.instagram.com/gymnine_/',
                    label: '📕 Instagram 📙',
                    payload: JSON.stringify({
                    url: 'https://www.instagram.com/gymnine_/',
                    }),
                }
            })
        ],
        [
            Markup.button({
                action: {
                    type: 'open_link',
                    link: 'https://vk.com/gymnasianumber9',
                    label: '📘 Группа VK 📘',
                    payload: JSON.stringify({
                    url: 'https://vk.com/gymnasianumber9',
                    }),
                }
            })
        ],
        [
            Markup.button({
                action: {
                    type: 'open_link',
                    link: 'http://gym9.ru/',
                    label: '📜 Сайт Гимназии №9 📜',
                    payload: JSON.stringify({
                    url: 'http://gym9.ru/',
                    }),
                }
            })
        ],
        [
            Markup.button({
                action: {
                    type: 'open_link',
                    link: 'https://uslugi.mosreg.ru/',
                    label: '📊 Школьный портал 📊',
                    payload: JSON.stringify({
                    url: 'https://uslugi.mosreg.ru/',
                    }),
                }
            })
        ],
        //
    ]).oneTime(),
    after_schedule: Markup.keyboard([
        [
            Markup.button({
                action: {
                  type: 'open_link',
                  link: 'https://vk.com/im?sel=211349777',
                  label: '⚠️ Сообщить об ошибке ⚠️',
                  payload: JSON.stringify({
                    url: 'https://vk.com/im?sel=211349777',
                  }),
                }
              })
        ],
        [Markup.button('Добавить ДЗ (не готово)')], 
        [Markup.button('📅 Расписание 📅')],
        [Markup.button('📌 Главное меню 📌', 'positive')]
    ]).oneTime()
}

const forms_whitelist = [
    "5А",
    "5Б",
    "5В",
    "5Г",
    "6А",
    "6Б",
    "6В",
    "6Г",
    "7А",
    "7Б",
    "7В",
    "7Г",
    "8А",
    "8Б",
    "8В",
    "8Г",
    "9А",
    "9Б",
    "9В",
    "9Г",
    "10А",
    "10Б",
    "11А",
    "11Б",
]

const whitelist = [
    "📌 Главное меню 📌",
    "Начать",
    "📎 Соц.сети 📎",
    "📅 Расписание 📅"
]

const lessons_counter = {
    1: {
        h: 9,
        m: 15
    },
    2: {
        h: 10,
        m: 10
    },
    3: {
        h: 11,
        m: 5
    },
    4: {
        h: 12,
        m: 10
    },
    5: {
        h: 13,
        m: 10
    },
    6: {
        h: 14,
        m: 5
    },
    7: {
        h: 15,
        m: 0
    },
    8: {
        h: 15,
        m: 55
    },
    9: {
        h: 16,
        m: 50
    }
}

// END OF META

// FUNCTIONS
const getScheduleByDateAndForm = (form => {
console.log(form)
    // get DAY OF WEEK
    let date = new Date()
    let getDayOfWeek = () => {
        let day = date.getDay() - 1 
        let toReturn = {
            current: day
        }
        day == 4 || day == 5 ? toReturn.next = 0 : toReturn.next = day + 1
        return toReturn
    }
    let dayOfWeek = getDayOfWeek()
    console.log('DAY_OF_WEEK', dayOfWeek)
    let now = {
        hours: date.getHours() + 3,
        minutes: date.getMinutes()
    }

    console.log(`Now: ${now.hours}:${now.minutes}`)

    let splitted_form = form.split('')

    let lesson_emoji = {
        1: '1️⃣',
        2: '2️⃣',
        3: '3️⃣',
        4: '4️⃣',
        5: '5️⃣',
        6: '6️⃣',
        7: '7️⃣',
        8: '8️⃣',
        9: '9️⃣',
        10: '🔟'
    }
    let letters_index = {
        "А": 0,
        "Б": 1,
        "В": 2,
        "Г": 3
    }
    let study_days = {
        //-1: "Воскресенье",
        0: "Понедельник",
        1: "Вторник",
        2: "Среда",
        3: "Четверг",
        4: "Пятница"
        //5: "Суббота"
    }
    let form_number
    let form_letter

    switch(splitted_form.length) {
        case 2:
            form_number = splitted_form[0] - 5
            form_letter = splitted_form[1]
            break
        case 3:
            // console.log(Number(splitted_form[0])*10 + Number(splitted_form[1]) - 5)
            form_number = Number(splitted_form[0])*10 + Number(splitted_form[1]) - 5
            form_letter = splitted_form[2]
            break
    }
    let reply = ''//'Твое расписание на сегодня: \n\n'
    now.lesson = defineLesson(now.hours, now.minutes)
    if (now.lesson == 'undefined') {
        var lessons = schedule[form_number].letters[letters_index[form_letter]].schedule[dayOfWeek.next].lessons
        console.log('lessons', lessons)
        console.log({letters_index, form_letter, form_number, value: letters_index[form_letter]})
        reply += `Учебный день закончился. Отдыхай!\n\n`
        reply += `Твое расписание на следующий учебный день (${study_days[dayOfWeek.next]}):\n\n`
    }

    if (now.lesson !== 'undefined') {
        var lessons = schedule[form_number].letters[letters_index[form_letter]].schedule[dayOfWeek.current].lessons
        console.log('lessons', lessons)
        console.log({letters_index, form_letter, form_number, value: letters_index[form_letter]})
        reply += 'Твое расписание на сегодня: \n\n'
        reply += `⏰ Сейчас у тебя: ${lessons[now.lesson].name}\n`
        try {
            reply += `⏰ Следующий урок: ${lessons[Number(now.lesson)+1].name}\n`
        } catch(e) {
            reply += `Больше уроков сегодня нет 😹\n\n`
        }
    }

    now.lessons_quantity = 0
    for (let i = 0; i<9; i++) {
        try {
            let data = `${lesson_emoji[i]}${lessons[`${i}`].name} (${schedule_time[`${i}`].start}-${schedule_time[`${i}`].stop})
👫 ${lessons[`${i}`].teacher}`
            reply += `\n${data}`
            now.lessons_quantity += 1
        } catch(e) {
            console.log(`Урока №${i+1} в расписании нет`)
        }
    }
    if (now.lesson !== 'undefined') {
        now.mins_left = (now.lessons_quantity-now.lesson) * 45 + (now.lessons_quantity-1) * 10
        reply += `\n\nДо конца учебного дня осталось ${now.mins_left} минут 😊`
    }

    return `${reply}`
})

const defineLesson = (h, m) => {
    let lesson_number
    try {
        Object.values(lessons_counter).forEach((object, i) => {
            if (h == object.h) {
                if (m <= object.m) {
                    lesson_number = i+1
                } else {
                    lesson_number = i+2
                }
            }
        })
        console.log(`Сейчас ${lesson_number} урок, время ${h}:${m}`)
        return lesson_number + ''
    } catch (e) {
        console.log('Ошибка получения данных об уроке', {e})
    }
    
}

// END OF FUNCTIONS

app.post('/', (req, res) => {
    switch(req.body.type) {
        case 'confirmation':
            console.log('1ea3e8f1')
            res.send('1ea3e8f1') // vk host confirmation
            break
    }
})

app.get('/api/getSchedule', (req, res) => {
    request('http://gym9.ru/raspis-gimnazisty.html', (err, response, body) => {
        const $ = cheerio.load(body, {
            normalizeWhitespace: true,
        })
        $('caption').each((i, el) => {
            let classForm = $(el).text().toUpperCase().split('\n').join('')
            let table = $(el).parent()
            let needToParse = !!forms_whitelist.find((wl_form) => wl_form == classForm)
            if (needToParse) {
                let ctx = config.forms_meaning[classForm]
                let _$ = cheerio.load(table.children()["1"])
                if (true) { // Ограничение по классу, например, i=38 == 11Б
                    _$(_$('tbody')["0"]).children().each((j, tr) => {
                        let __$ = cheerio.load(tr)
                        __$(__$('tr')["0"]).children().each((k, td) => {
                            let ___$ = cheerio.load(td)
                            let cellValue = ___$.text().trim()
                            let splitted_CV = cellValue.split('')
                            // if (splitted_CV.length > 15) {
                                // console.log('-------')
                                let match = false
                                config.lesson_ctx.map(lesson => {
                                    if (!!~cellValue.indexOf(lesson)) {
                                        match = true
                                        // if (lesson == 'ОБЖ' && i == 38) console.log(cellValue)
                                        let teacher = cellValue.split(lesson).join('').trim()
                                            .split(':1').join(' (1 группа)')
                                            .split(':2').join(' (2 группа)')
                                            .split('/').join(' / ')
                                            // .split('.').join(' ').trim()
                                        let lessonNumber = j
                                        let dayIdx = k-2
                                        // console.log(dayIdx)
                                        console.log({
                                            classForm,
                                            lesson_c: j,
                                            day_i: k-2,
                                            name: lesson,
                                            teacher
                                        })
                                        schedule_sceleton[ctx.form.i].letters[ctx.letter.i].schedule[dayIdx].lessons[`${lessonNumber}`] = {
                                            name: lesson,
                                            teacher
                                        }
                                    }
                                })
                                if (!match)  console.log({v: cellValue})
                        })
                    })
                    }
                }
        })
        fs.writeFileSync('auto_schedule.json', JSON.stringify(schedule_sceleton, 0, 4))
        res.send(body)
    })
})



const session = new Session();
const scene = new Scene('schedule',
    (ctx) => {
    ctx.scene.next();
    ctx.reply('В каком ты классе?');
    },
    (ctx) => {
    let candidate = ctx.message.body.trim().split(' ').join('').split('-').join('').toUpperCase();
    let result = forms_whitelist.find((form) => form == candidate)
    if (!!result) {
        ctx.session.form = candidate
        ctx.scene.leave();
        let reply
        try {
            reply = getScheduleByDateAndForm(ctx.session.form)
        } catch(e) {
            console.log(e)
            reply = e
        }
        ctx.reply(reply, null, keyboards.after_schedule)
        // ctx.reply(`Я понял, что ты из ${ctx.session.form} класса! Но пока расписание тебе не покажу. Бебебе`, null, keyboards.default);
    } else {
        ctx.scene.leave()
        ctx.reply('Что-то пошло не так... Нужно ввести номер и букву класса (например, 11А). Попробуй еще раз!', null, keyboards.default)
    }
    });
const stage = new Stage(scene);

bot.use(session.middleware());
bot.use(stage.middleware());

let message
let attachment
let markup

bot.on((ctx) => {
    result = whitelist.find(command => ctx.message.body == command)
    console.log(!result, !!result, result)
    if (!result) {
        message = 'Пожалуйста, выбери одну из предложенных команд 😊'
        attachment = null
        markup = keyboards.default
        console.log('Я внутри блока логического ага')
        ctx.reply(message, attachment, markup)
    }
    else {
        switch(result) {
            case '📌 Главное меню 📌':
                message = 'Пожалуйста, выбери одну из предложенных команд 😊'
                attachment = null
                markup = keyboards.default
                ctx.reply(message, attachment, markup)
                break
            case 'Главное меню':
                message = 'Пожалуйста, выбери одну из предложенных команд 😊'
                attachment = null
                markup = keyboards.default
                ctx.reply(message, attachment, markup)
                break
            case 'Начать': 
                message = `Привет! Я Бот-гимназист📚

            Могу подсказать расписание уроков и даты ближайших школьных мероприятий⏰`
                attachment = null
                markup = keyboards.default
                ctx.reply(message, attachment, markup)
                break
            case '📎 Соц.сети 📎':
                message = 'Подпишись типа пж'
                attachment = null
                markup = keyboards.massmedia
                ctx.reply(message, attachment, markup)
                break
            case 'Соц.сети':
                message = 'Подпишись типа пж'
                attachment = null
                markup = keyboards.massmedia
                ctx.reply(message, attachment, markup)
                break
            case '📅 Расписание 📅':
                ctx.scene.enter('schedule');
                break
            case 'Расписание':
                ctx.scene.enter('schedule');
                break
        }
    }
})

bot.startPolling()

app.listen(port, () => {
    console.log('Bot is up. Deploing on port', port)
})