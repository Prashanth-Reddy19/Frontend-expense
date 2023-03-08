async function login(event) {
    try {
        event.preventDefault();
        console.log(event.target.name)

        const loginDetails = {

            email: event.target.email.value,
            password: event.target.password.value
        }
        console.log(loginDetails)
        const response = await axios.post('http://localhost:3000/user/login', loginDetails)
        alert(response.data.message)
        console.log(response.data)
        localStorage.setItem('token', response.data.token)
        window.location.href = "../Expense/expense.html"

    } catch (err) {
        
        document.body.innerHTML += `<div style="color:red">${err}</div>`
    }
}

function forgotpassword() {
    window.location.href = "../Forgotpassword/forgotpassword.html"
}