
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
});




