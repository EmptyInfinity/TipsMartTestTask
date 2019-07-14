let userCode = document.getElementById('userCode')
let form = document.querySelector('form')
let errorNode = document.getElementById('error')

form.addEventListener('submit', (e) => {
		e.preventDefault()

		$.ajax({
        url: ``,
        contentType: "application/json",
				method: "PUT",
				data: JSON.stringify({
					user: form.dataset.user,
					code: userCode.value
				}),
				success: function(data){
					if (data.errorMessage){
						errorNode.innerText = data.errorMessage
					} else {
						window.location = `/api/shops`
					}
				}
		})
})