
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
        const timers = [
            { ms: 1000,  label: "1с" },
            { ms: 3000, label: "3с" },
            { ms: 5000, label: "5с" },
            { ms: 10000, label: "10с" },
            { ms: 30000, label: "30с" },
            { ms: 50000, label: "50с" }
        ];
        // 3. Запускаем циклом
        timers.forEach(timer => {
            setTimeout(() => sendTrackingEvent(timer.label), timer.ms);
        });

        let scrollSent = false;
        window.addEventListener('scroll', function() {
            if (scrollSent) return; // Если уже отправили, выходим
            scrollSent = true;
            sendTrackingEvent("scroll");
        });
    }
});
function sendTrackingEvent(eventName) {
    const urlParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlParams.entries());

    params.client_referer = document.referrer || "Прямой заход";
    params.page_path = window.location.pathname;
    params.event_name = eventName;
    fetch('/api/track-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
    }).catch(err => console.log('Tracking error:', err));
}





