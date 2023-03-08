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
            showExpense(response.data.newExpense);

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
    const limit=localStorage.getItem('limit');
        const page=1;
    const token = localStorage.getItem('token')
    const decodeToken = parseJwt(token)
      console.log(decodeToken)
      const ispremiumuser = decodeToken.ispremiumuser
      if (ispremiumuser) {
        
        showPremiumuserMessage()
        showLeaderBoard()
      }
      

    axios.get(`http://localhost:3000/expense/get-expenses?page=${page}&limit=${limit}`, { headers: { "Authorization": token } })
        .then((response) => {
            console.log(response, "*****Get Request*****")
            for (var i = 0; i < response.data.message.length; i++) {
                showExpense(response.data.message[i])
            }
            showpages(response.data);
        })
        .catch((error) => {
            document.body.innerHTML = document.body.innerHTML + "<h4>Something went wrong</h4>"
            console.log(error)

        })

})

function showExpense(expense) {
    document.getElementById('expense').value = '';
    document.getElementById('description').value = '';
    document.getElementById('category').value = ''


    const parentNode = document.getElementById('listOfExpenses');
    const childHTML = `<li id=${expense.id}> ${expense.expense} - ${expense.description} - ${expense.category}
            <button onclick=deleteExpense('${expense.id}')> Delete Expense </button>
            
         </li>`

    parentNode.innerHTML = parentNode.innerHTML + childHTML;
}

function deleteExpense(expenseId) {
    const token = localStorage.getItem('token')
    axios.delete(`http://localhost:3000/expense/delete-expense/${expenseId}`, { headers: { "Authorization": token } })
        .then((response => {
            removeExpenseFromScreen(expenseId)
        }))
        .catch((error) => {
            console.log(error)
        })

    console.log('*****', ('Deleted expense Id'), (expenseId), '*****')
    removeExpenseFromScreen(expenseId);

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
            leaderboardEle.innerHTML += `<li>Name - ${userDetails.name}  - Total Expense - ${userDetails.totalexpenses}</li>`

        })
    }
    document.getElementById("premiummessage").appendChild(inputElement)
}




function removeExpenseFromScreen(expenseId) {
    const parentNode = document.getElementById('listOfExpenses');
    const childNodeToBeDeleted = document.getElementById(expenseId);
    if (childNodeToBeDeleted) {

        parentNode.removeChild(childNodeToBeDeleted)
    }
}


function download(){
    const token=localStorage.getItem('token')
    axios.get('http://localhost:3000/expense/download', { headers: {"Authorization" : token} })
    .then((response) => {
        if(response.status === 201){
            //the bcakend is essentially sending a download link
            //  which if we open in browser, the file would download
            var a = document.createElement("a");
            a.href = response.data.fileUrl;
            a.download = 'myexpense.csv';
            a.click();
        } 
  
    })
    .catch((err) => {
        console.log(err)
    });
  }


  async function downloadedfiles(e) {

    try {
      e.preventDefault();
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3000/expense/downloadedfiles`, { headers: { 'Authorization': token } });
      console.log(response)
  
      const downloadedfileslist = document.getElementById('downloadedfileslist');
    downloadedfileslist.innerHTML='';
      for (let i = 0; i < response.data.message.length; i++) {
  
        console.log(response.data.message[i].url);
        downloadedfileslist.innerHTML += `<li><a href=${response.data.message[i].url}>TextFile${i}</a></li>`
      }
  
  
    } catch (err) {
      console.log(err);
    }
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
                await axios.post('http://localhost:3000/purchase/updatetransactionstatus', {
                    order_id: options.order_id,
                    payment_id: response.razor_payment_id
                },
                    { headers: { "Authorization": token } })

                alert('You Are a Premium User Now')
                document.getElementById('premium').style.visibility="hidden";
                document.getElementById('premiummessage').innerHTML="You are a premium user";
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


const pages= document.getElementById('pages')
async function showpages({currentpage,nextpage,previouspage,hasnextpage,haspreviouspage,lastpage}){
     try{
             pages.innerHTML='';

                 if(haspreviouspage){
                     const btn2=document.createElement('button');
                     btn2.innerHTML=previouspage;
                     btn2.addEventListener('click',()=>getExpenses(previouspage))
                     pages.appendChild(btn2);
                 }
                 const btn1=document.createElement('button');
                 btn1.innerHTML=`<h3>${currentpage}</h3>`
                 btn1.addEventListener('click',()=>getExpenses(currentpage))
                 pages.appendChild(btn1);

                 if(hasnextpage){
                     const btn3=document.createElement('button')
                     btn3.innerHTML=nextpage;
                     btn3.addEventListener('click',()=>getExpenses(nextpage))
                     pages.appendChild(btn3);
                 }

     }catch(err){
             console.log(err);
     }
}

async function getExpenses(page){
 try{
     const limit=localStorage.getItem('limit');
     const token= localStorage.getItem('token');
     const response =await axios.get(`http://localhost:3000/expense/get-expenses?page=${page}&limit=${limit}`,{headers:{"Authorization":token}});

         console.log("$$$$$$$$$$$",response)

         listOfExpenses.innerHTML="";
     for(let i=0;i<response.data.message.length;i++)
     {
         showExpense(response.data.message[i]);
     }
     showpages(response.data);


 }catch(err){
     console.log(err);
 }
}
