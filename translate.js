const ua = {
    'WELCOME_MESSAGE': "Привіт:)\nЦей бот допоможе вам в декілька кліків створити замовлення в W&B Software Developers Team\nДля створення замовлення натисніть на кнопку, або відправте повідомлення для зв'язку з працівником компанії",
    'CREATE_ORDER': 'Створити замовлення',
    'ADMIN_PANEL': 'Адмін панель',
    'CHOOSE_OFFER': 'Оберіть проект, який ви хочете замовити:',
    'LANDING_PAGE': 'Лендінг сторінка',
    'TELEGRAM_BOT': 'Telegram Bot',
    'CMS': "CMS",
    'WEB_MARKET': 'Інтернет магазин',
    'WEBSITE_PARSER': 'Парсер вебсайта',
    'OTHER': 'Інше',
    'TYPE_DESCRIPTION': 'Введіть короткий опис проекту:',
    'TYPE_PRICE': 'Введіть бюджет проекту:',
    'TYPE_PHONE': "Надайте доступ до свого телефону, щоб ми могли з вами зв'язатися: ",
    'GIVE_PHONE': "Надати доступ до телефону",
    'THANK_YOU_FOR_CREATING': "Дякуємо, що звернулися в W&B Software Developers Team. Наш спеціаліст зв'яжеться з вами:)",
    'CONNECT_REQUEST': "Ви бажаєте зв'язатися з працівником сервісу?",
    'YES': "Так",
    "NO": 'Ні',
    "WAIT_FOR_ADNIN": 'Зачекайте будь-ласка...',
    'NOT_FOUND_ADMIN': ' Нажаль вільних працівників не знайдено. Спробуйте будь-ласка пізніше',
}

function getTranslation(languageCode){
    switch(languageCode){
        default: return ua;
    }
}

module.exports = getTranslation;