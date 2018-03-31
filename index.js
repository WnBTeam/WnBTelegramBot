const TelegramBot = require('node-telegram-bot-api');
const Bot = require('./bot');
const JsonDB = require('./jsondb')
const getTranslations = require('./translate')

const token = '571413803:AAFZfur5CGHgIlkYkG5HjBgPbatvvPgO5uY';


const bot = new TelegramBot(token, {polling: true});
const db = new JsonDB('db.json');

const offers = [
    'LANDING_PAGE',
    'TELEGRAM_BOT',
    'CMS',
    'WEB_MARKET',
    'WEBSITE_PARSER',
    'OTHER'
];

bot.onText(/\/start/, (msg, match) => {
    
    let user = db.get('user', (item)=>item.userId == msg.from.id);
    if(!user){
        user = {
            userId: msg.from.id,
            chatId: msg.chat.id,
            language: msg.from.language_code,
            name: msg.from.first_name,
            lastName: msg.from.last_name
        };
        db.create('user', user);
    }
    const locale = getTranslations(user.language);

    const inlineKeyboard = [
        [{text: locale['CREATE_ORDER'], callback_data: "CREATE_ORDER"}]
    ];
    if(user.admin){
        inlineKeyboard.push([{text: locale['ADMIN_PANEL'], callback_data: "ADMIN_PANEL"}])
    }

    bot.sendMessage(msg.chat.id, locale['WELCOME_MESSAGE'], Bot.inlineKeyboard(inlineKeyboard)); 
});

bot.on('callback_query', function (msg) {
    const user = db.get('user', (item)=>item.chatId == msg.message.chat.id);
    if(!user) return;
    const locale = getTranslations(user.language);
    
    switch(true){
        case (msg.data =='CREATE_ORDER'):{
            const prevTask = db.get('task', item=>item.user == user.id)
            if(prevTask) db.delete('task', prevTask.id);

            db.create('task', {user: user.id, type: 'order', request: 'type'});

            const keyboard = offers.map(offer => [locale[offer]]);
            bot.sendMessage(msg.message.chat.id, locale['CHOOSE_OFFER'], Bot.keyboard(keyboard))
            break;
        }
        case (msg.data.includes('DENY')): {
            if(!user.admin) return;
            try{
                const id = parseInt(msg.data.split('_')[0]);
                const task = db.get('task', (item)=>item.id == id);
                if(!task) return;
                db.delete('task' , id);
                const user = db.get('user', (item)=> item.id == task.user);
                if(!user) return;
                const trans = getTranslations(user.language);
                bot.sendMessage(task.chatId, trans['NOT_FOUND_ADMIN']);
            } catch(e){
                console.log(e);
            }
        }
        case (msg.data.includes('CONNECT')): {
            if(!user.admin) return;
            try{
                const id = parseInt(msg.data.split('_')[0]);
                const task = db.get('task', (item)=>item.id == id);
                if(!task) return;
                db.delete('task' , id);
                const u = db.get('user', (item)=> item.id == task.user);
                if(!u) return;
                db.create('connection', {
                    admin: user.id,
                    user: u.id
                })
                bot.sendMessage(msg.message.chat.id, "З'єднано", Bot.keyboard([['Стоп']]))
            } catch(e){
                console.log(e);
            }
        }
    }
});

bot.on('message', (msg) => {
    if(msg.text == '/start') return;
    const user = db.get('user', (item)=>item.chatId == msg.chat.id);
    if(!user) return;
    const locale = getTranslations(user.language);
    const task = db.get('task', (item)=>item.user == user.id);
    const connection = db.get('connection', (item)=> item.user == user.id || item.admin == user.id);
    
    switch(true){
        case(!!connection):{
            if(user.admin && msg.text == 'Стоп') {
                db.delete('connection', connection.id);
                break;
            }
            const opositeId = (user.admin)? connection.user: connection.admin;
            const opositeUser = db.get('user', (item)=> item.id == opositeId);
            bot.sendMessage(opositeUser.chatId, msg.text);
            break;
        }
        case(!task):{
            db.create('task', {user: user.id, chatId: msg.chat.id, type: 'connect', message: msg.text});

            const keyboard = [[locale['YES'], locale['NO']]];
            bot.sendMessage(msg.chat.id, locale['CONNECT_REQUEST'], Bot.keyboard(keyboard))
            break;
        }
        case(task && task.type == 'connect' && task.status != 'acepted'):{          
            if(msg.text == locale['NO']) {
                db.delete('task', task.id);  
                return;
            };
            db.update('task', task.id, {
                status: 'acepted'
            })
            bot.sendMessage(msg.chat.id, locale['WAIT_FOR_ADNIN'], Bot.hideKeyboard())
            
            admin = db.get('user', (item)=>item.admin);
            const kb = [ [{text: "З'єднати", callback_data: `${task.id}_CONNECT`},
                          {text: "Відмовити", callback_data: `${task.id}_DENY` }] ]
            bot.sendMessage(admin.chatId, `Запит на з'єднання:\nІм'я - ${msg.from.first_name}\nКористувач - ${user.id}\nПовідомлення - ${task.message}\n`,
                 Bot.inlineKeyboard(kb))
            break;
        }
        case(task && task.type == 'order' && task.request == 'type'): {
            const order = db.create('order', {
                user: user.id,
                status: 'creating',
                type: msg.text
            });
            db.update('task', task.id, {
                request: 'description',
                order: order.id
            })
            bot.sendMessage(msg.chat.id, locale['TYPE_DESCRIPTION'], Bot.hideKeyboard())
            break;
        }
        case(task && task.type == 'order' && task.request == 'description'): {
            const order = db.get('order', item => item.id == task.order);
            db.update('task', task.id, {
                request: 'price'
            });
            db.update('order', order.id, {
                description: msg.text
            })
            bot.sendMessage(msg.chat.id, locale['TYPE_PRICE'])
            break;
        }
        case(task && task.type == 'order' && task.request == 'price'): {
            const order = db.get('order', item => item.id == task.order);
            db.update('task', task.id, {
                request: 'phone'
            });
            db.update('order', order.id, {
                price: msg.text
            })

            const keyboard = [[{ text: locale['GIVE_PHONE'], request_contact: true}]];
            bot.sendMessage(msg.chat.id, locale['TYPE_PHONE'], Bot.keyboard(keyboard));
            break;
        }
    }
});

bot.on("contact",(msg)=>{
    const user = db.get('user', (item)=>item.chatId == msg.chat.id);
    if(!user) return;
    const locale = getTranslations(user.language);
    const task = db.get('task', (item)=>item.user == user.id);
    switch(true){
        case(task && task.type == 'order' && task.request == 'phone'):{
            let order = db.get('order', item => item.id == task.order);
            db.delete('task', task.id);
            order = db.update('order', order.id, {
                phone: msg.contact.phone_number,
                status: 'created'
            })
            db.update('user', user.id, {
                phone: msg.contact.phone_number
            })
            bot.sendMessage(msg.chat.id, locale['THANK_YOU_FOR_CREATING'], Bot.hideKeyboard())

            admin = db.get('user', (item)=>item.admin);
            bot.sendMessage(admin.chatId, `Створено нове замовлення:\nТип - ${order.type}\nОпис - ${order.description}\nЦіна - ${order.price}\nТелефон - ${order.phone}\n`)
        }
    }
})
