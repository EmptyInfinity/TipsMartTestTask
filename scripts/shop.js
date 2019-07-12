let buy = document.querySelector('button')
let form = document.querySelector('form')

buy.addEventListener('click', (e) => {
    form.classList.toggle('active')
})
form.addEventListener('submit', (e) => {
    e.preventDefault()
    form.classList.toggle('active')


    async function post(){
        $.ajax({
            url: `/api/shops/${form.dataset.shop}/transaction`,
            contentType: "application/json",
            method: "POST",
            data: JSON.stringify({
                created: new Date(),
                _user: form.dataset.user
            })
        })
    }

    async function postAndGet(){
        let newPost = await post()
        window.location = `/api/shops/${form.dataset.shop}/transaction`;
    }
    postAndGet()
})