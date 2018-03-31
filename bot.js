class Bot{
    constructor(){
    }

    static keyboard(keyboard){
        return {
            reply_markup: {
                keyboard
            },
            one_time_keyboard: true,
        };
    }

    static hideKeyboard(){
        return {
            reply_markup: {
                hide_keyboard: true
            },
        };
    }

    static inlineKeyboard(inline_keyboard){
        return {
            reply_markup: {
                inline_keyboard
            },
        };
    }    
}

module.exports = Bot;