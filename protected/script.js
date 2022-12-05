// Import the Cat Module
import Cat  from './Cat.js';

// fetch details about the logged in user from the api
// store user in global variable
const getLoggedInUser = async () =>{
  if (! loggedInUser.username)
  return fetch('/api/user')
    .then(response => response.json())  
    .then(user => loggedInUser.username = user.username)
    .catch(error => console.log(error))
}

const getCats = async  ( ) => {  
  // enable loading animation during fetch.
   $('#content').style.background = 'assets/load.svg'
  // before fetching cats, identify the logged-in user
  await getLoggedInUser() 
  // fetch and render cats.
  fetch(`/api/cats?sort=${currentSort}&human=${currentHuman}`)
    .then(response => response.json())
    .then(response => {  
      $('#content').style.background = 'none'
      $('#content').innerHTML = ''
      response.forEach( data => {  
        const cat = new Cat(data) 
        cat.render() 
      })  
    })
    .catch(error => console.log(error))
}

getCats()

const navigation = () =>{
    fetch('/api/users')
    .then(response => response.json())
    .then(users => {   
      users.forEach( user => {
        let button = document.createElement('button')
        button.innerHTML = user.username
        button.addEventListener('click', event =>{
          currentHuman = user._id
          getCats() 
        })
        $('section.actions .humans').appendChild(button)
      })  
    })
    .catch(error => console.log(error))
}
navigation()

const upload = (theFile) => {
  // if the file is too big, prevent the upload
  if ( theFile.size > 5 * 1024 * 1024) {
    alert('Maximum file size is 5MB')
  }
  else{
    // activate a loading animation during upload
    preview.setAttribute('src', 'assets/load.svg')
    // send a POST request with the file in the request body
    const formData = new FormData()
    formData.append('image', theFile)
    fetch('/api/file', {
      method: "POST" ,
      body : formData
    }) 
    .then(response => response.json())
    .then(data =>  { 
      console.log(data) 
      // set the uploaded file to appear as a preview.
      preview.setAttribute('src', 'uploads/'+data.fileName)
      // set a hidden value to match the uploaded filename.
      // we can then save the metadata alongside the file.
      catForm.elements['fileName'].value = data.fileName
    }) 
    .catch(error => console.log(error))
  } 
}
 

// Listen for clicks on the header
// reset the list to show all cats
$('header h1').addEventListener('click', event => {
  catForm.reset()  
  currentSort = 'name'
  currentHuman = ''
  getCats()
}) 

// Listen for clicks on the Logout button
$('button#logout').addEventListener('click', event => {
  window.location.replace('/auth/logout')
}) 

// Listen for clicks on the "Add a Cat" button
$('button#aToZ').addEventListener('click', event => {
  catForm.reset()  
  currentSort = 'name'
  getCats()
}) 


// Listen for clicks on the "Add a Cat" button
$('button#byAge').addEventListener('click', event => {
  catForm.reset()  
  currentSort = 'birthDate'
  getCats()
}) 



// Listen for clicks on the "Add a Cat" button
$('button#add').addEventListener('click', event => {
  catForm.reset()  
  catForm.style.display ='flex'
  $('body').scrollIntoView()
}) 

// the browse button has its own event handler, 
// independed from the form as a whole
uploader.addEventListener('change', event => { 
  upload( event.target.files[0] )  
})  

// in addition to the default reset behaviour for form elements, 
// also reset the _id, image, heading, and visibility
catForm.addEventListener('reset', (e) =>{
  catForm.elements['_id'].value = '';
  catForm.elements['fileName'].value = ''
  preview.setAttribute('src', 'assets/photo.svg')   
  $('#catForm h2').innerHTML = `Add a Cat`
  catForm.style.display = 'none';
})

// define a set of handler functions 
// to respond to various events
const formEvents = { 
  // when the form is submitted, save the form  
  submit : (event) => { 
    const formData = new FormData(event.target)    
    const json = Object.fromEntries(formData)
    const cat = new Cat(json)
    cat.save() 
    event.target.reset()
  },
  // add a visual cue to indicate drag and drop is ready
  dragenter : (event) => {  event.currentTarget.className = "ready" },
  dragover : (event) => { event.currentTarget.className = "ready" },
  // if a drag and drop ends, hide the visual cue styling
  dragleave : (event) => { event.currentTarget.className = "" },
  drop : (event) => {  
    event.currentTarget.className = ""  
    // when a file is dropped onto the form, upload it.
    upload(event.dataTransfer.files[0])
  }
}
 
// iterate through all the above event handlers 
// and activate them on the image form
for (const [eventName, eventHandler] of Object.entries(formEvents)) {
  catForm.addEventListener(eventName, (event) => {
    // prevent default event handlers from running
    event.preventDefault()
    event.stopPropagation()
  }) 
  // listen for the event and attach the handler to it.
  catForm.addEventListener(eventName, eventHandler) 
} 
 

