let buyButton = document.getElementById('buy')
let user = document.getElementById('user')
let shop = document.getElementById('shop')
let form = document.querySelector('form')
let errorNode = document.getElementById('error')

buyButton.addEventListener('click', () => {
	form.classList.toggle('active')
})

form.addEventListener('submit', e => {
	e.preventDefault()

	$.ajax({
		url: `/api/shops/${form.dataset.shop}`,
		contentType: "application/json",
		method: "POST",
		data: JSON.stringify({
			created: new Date(),
			user: user.dataset.id
		}),
		success: function (data) {
			if (data.errorMessage) {
				errorNode.innerText = data.errorMessage
			} else {
				window.location = `/api/shops/${form.dataset.shop}/transaction/${data.code}`
			}
		},
		error: function (err) {
		}
	})

})