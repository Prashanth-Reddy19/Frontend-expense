function saveToLocalStorage(event) {
  event.preventDefault();
  const expense = event.target.expense.value;
  const description = event.target.description.value;
  const category = event.target.category.value;

  const expenseDetails = {
    expense,
    description,
    category
  }
  console.log(expenseDetails)


  const token = localStorage.getItem('token')

  axios.post("http://localhost:3000/expense/add-expense", expenseDetails, { headers: { "Authorization": token } })
    .then((response) => {
      console.log(response, '****Post Request*****')
      showUser(response.data.newExpense);

    })
    .catch((err) => {
      document.body.innerHTML = document.body.innerHTML + "<h4>Something went wrong</h4>"
      console.log(err)
    })
}


function showPremiumuserMessage() {
  document.getElementById('premium').style.visibility = "hidden"
  document.getElementById('premiummessage').innerHTML = "You are premium user"
}

function parseJwt(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);

}

window.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem('token')
  const decodeToken = parseJwt(token)
  console.log(decodeToken)
  const ispremiumuser = decodeToken.ispremiumuser
  if (ispremiumuser) {
    showPremiumuserMessage()
    showLeaderBoard()
  }

  axios.get("http://localhost:3000/expense/get-expenses", { headers: { "Authorization": token } })

    .then((response) => {
      console.log(response, "*****Get Request*****")
      for (var i = 0; i < response.data.expenses.length; i++) {
        showUser(response.data.expenses[i])

      }
    })
    .catch((error) => {
      document.body.innerHTML = document.body.innerHTML + "<h4>Something went wrong</h4>"
      console.log(error)

    })

})

function showUser(user) {
  document.getElementById('expense').value = '';
  document.getElementById('description').value = '';
  document.getElementById('category').value = '';


  const parentNode = document.getElementById('listOfUsers');
  const childHTML = `<li id=${user.id}> ${user.expense} - ${user.description} - ${user.category}
          <button onclick=deleteUser('${user.id}')> Delete User </button>
          </li>`

  parentNode.innerHTML = parentNode.innerHTML + childHTML;
}

function deleteUser(userId) {
  const token = localStorage.getItem('token')
  axios.delete(`http://localhost:3000/expense/delete-expense/${userId}`, { headers: { "Authorization": token } })
    .then((response => {
      removeUserFromScreen(userId)
    }))
    .catch((error) => {
      console.log(error)
    })

  console.log('*****', ('Deleted user Id'), (userId), '*****')
  removeUserFromScreen(userId);

}
function showLeaderBoard() {
  const inputElement = document.createElement("input")
  inputElement.type = "button"
  inputElement.value = 'Show Leaderboard'
  inputElement.onclick = async () => {
    const token = localStorage.getItem('token')
    const userLeaderBoardDetails = await axios.get('http://localhost:3000/premium/showLeaderBoard', { headers: { "Authorization": token } })
    console.log(userLeaderBoardDetails)

    var leaderboardEle = document.getElementById('leaderboard')
    leaderboardEle.innerHTML += '<h1>Leader Board</h1>'
    userLeaderBoardDetails.data.forEach((userDetails) => {
      leaderboardEle.innerHTML += `<li> Name - ${userDetails.name}   Total Expense - ${userDetails.totalexpenses}</li>`

    })
  }
  document.getElementById("premiummessage").appendChild(inputElement)
}




function removeUserFromScreen(userId) {
  const parentNode = document.getElementById('listOfUsers');
  const childNodeToBeDeleted = document.getElementById(userId);
  if (childNodeToBeDeleted) {

    parentNode.removeChild(childNodeToBeDeleted)
  }
}

function download(){
  axios.get('http://localhost:3000/user/download', { headers: {"Authorization" : token} })
  .then((response) => {
      if(response.status === 201){
          //the bcakend is essentially sending a download link
          //  which if we open in browser, the file would download
          var a = document.createElement("a");
          a.href = response.data.fileUrl;
          a.download = 'myexpense.csv';
          a.click();
      } else {
          throw new Error(response.data.message)
      }

  })
  .catch((err) => {
      showError(err)
  });
}


const premium = document.querySelector('#premium');

premium.addEventListener('click', premiumuser);

async function premiumuser(e) {
  try {
    const token = localStorage.getItem('token');
    console.log(token);
    const response = await axios.get(`http://localhost:3000/purchase/premiummembership`, { headers: { 'Authorization': token } });
    console.log(response);
    var options = {
      "key": response.data.key_id,
      "order_id": response.data.order.id,
      "handler": async function (response) {
        const res = await axios.post('http://localhost:3000/purchase/updatetransactionstatus', {
          order_id: options.order_id,
          payment_id: response.razor_payment_id
        },
          { headers: { "Authorization": token } })

        alert('You Are a Premium User Now')

        document.getElementById('premium').style.visibility = "hidden"
        document.getElementById('premiummessage').innerHTML = "You are premium user"
        localStorage.setItem('token', res.data.token)
        showLeaderBoard()





      },

    }


    const rp1 = new Razorpay(options);
    rp1.open();
    e.preventDefault();

    rp1.on('payment.failed', function (response) {
      console.log(response);
      alert('Something went wrong')
    })

  }
  catch (err) {
    console.log(err);
    console.log("error at premiumbtn", err);
  }

}