// make it easier to select elements
const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

/* If we are inside an iFrame add a link to open a separate tab */
if (window.frameElement) {
  $('footer').innerHTML = `Please open a <a>separate tab</a>`
  $('footer a').addEventListener('click', () => {
    window.open('https://my-cats.haroldsikkema.repl.co', '_blank')
  })
  $$('section').forEach(form => { form.style.display = 'none' })
}

// toggle between the two forms
const toggleForms = () => {
  $('#signUpForm').classList.toggle('show')
  $('#signUpForm').classList.toggle('hide')
  $('#loginForm').classList.toggle('show')
  $('#loginForm').classList.toggle('hide')
}

// activate toggle links
$$('.actions a').forEach(link => {
  link.addEventListener('click', toggleForms)
})

// function to show a notice at the top of the page.
const showNotice = (noticeText) => {
  let p = document.createElement('p')
  p.innerHTML = noticeText
  $('header #notice').style.display = 'block'
  $('header #notice').appendChild(p)
}

const showError = (errorText) => {
  let p = document.createElement('p')
  p.innerHTML = errorText
  $('header #error').style.display = 'block'
  $('header #error').appendChild(p)
}


// reset notices and errors whenever a form gets submitted.
$$('form').forEach(form=> {
  form.addEventListener('submit', (event) =>{
    event.preventDefault()   
    $('header #error').innerHTML = ''
    $('header #notice').innerHTML = ''
    $('header #error').style.display = 'none'
    $('header #notice').style.display = 'none'
  })
})

// handler for sign up form
$('#signUpForm form').addEventListener('submit', (event) => {
  event.preventDefault()
  let formData = new FormData(event.target)
  const json = Object.fromEntries(formData)
  fetch('/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(json)
  })
  .then(response => response.json())
  .then(data => {
   // console.log(data)
    if (data.success){
      showNotice (`Account created for ${data.username}`)
      toggleForms()
    }
    else{
      for (field in data.errors) 
        showError( data.errors[field].message)
    }
  })
  .catch(err => {
    showError('Something went wrong during signup') 
    //console.log(err)
  })
})

// // handler for login form
$('#loginForm form').addEventListener('submit', (event) => {
  event.preventDefault()
  let formData = new FormData(event.target)
  const json = Object.fromEntries(formData)
  fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(json)
  })
  .then(response => {
    if (response.status == 200 )
      window.location.assign("/")
    else showError('Login failed')

  })
  .catch(err => {
    showError('Sorry, something went wrong')
  })
})