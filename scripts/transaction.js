let userCode = document.getElementById('userCode')
let form = document.querySelector('form')

form.addEventListener('submit', (e) => {
    e.preventDefault()

    $.ajax({
        url: `/api/shops/${form.dataset.shop}/transaction/${userCode.value}`,
        contentType: "application/json",
        method: "PUT",
    })
})