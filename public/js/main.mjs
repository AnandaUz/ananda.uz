
window.addEventListener("load", e => {
    const meetForm = document.getElementById('meetForm');
    const formMessage = document.getElementById('formMessage');

    if (meetForm) {
        meetForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(meetForm);
            const data = {
                userName: formData.get('userName'),
                userContact: formData.get('userContact')
            };

            try {
                const response = await fetch('/api/submit-form', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (typeof window.fbq === 'function') {
                    fbq('track', 'Lead', {value: 1.00, currency: 'USD', content_name: 'meet_form'});
                }

                if (result.success) {
                    meetForm.style.display = 'none';
                    formMessage.style.display = 'block';
                } else {
                    alert('Произошла ошибка при отправке заявки. Попробуйте еще раз.');
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                alert('Произошла ошибка при отправке заявки.');
            }
        });
    }
    {
        // Ждем 1 секунду после полной загрузки
        setTimeout(function() {
            // Собираем все параметры из URL (UTM, fbclid, key1 и т.д.)
            const urlParams = new URLSearchParams(window.location.search);
            const params = Object.fromEntries(urlParams.entries());

            // Добавляем инфо о реферере, так как сервер иногда его теряет
            params.client_referer = document.referrer || "Прямой заход";

            params.event_name = "1 секунда";

            // Отправляем на наш новый эндпоинт
            fetch('/api/track-visit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params)
            }).catch(err => console.log('Tracking error:', err));
        }, 1000);
        // Ждем 1 секунду после полной загрузки
        setTimeout(function() {
            // Собираем все параметры из URL (UTM, fbclid, key1 и т.д.)
            const urlParams = new URLSearchParams(window.location.search);
            const params = Object.fromEntries(urlParams.entries());

            // Добавляем инфо о реферере, так как сервер иногда его теряет
            params.client_referer = document.referrer || "Прямой заход";

            params.event_name = "10 секунд";

            // Отправляем на наш новый эндпоинт
            fetch('/api/track-visit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params)
            }).catch(err => console.log('Tracking error:', err));
        }, 10000);
    }
});






