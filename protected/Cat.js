export default class Cat {

  constructor(data) {   
    this.importJSON(data)   
  }

  // Given the provided JSON data
  // copy all fields into this object
  importJSON = (data) => {
    for (const key in data){ this[key] = data[key] } 
  }

  // Prepare a JSON object (e.g. for saving to a database)
  exportJSON = () => { 
    this.adopted = (this.adopted == "on") ? true : false;  
    // Enumerate all properties of this object. 
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax 
    let json = {...this} 
    delete json._id 
    Object.keys(json)
        .filter(key => typeof(this[key]) == "function")
        .forEach(key => delete json[key] ) 
    return JSON.stringify(json)  
  }

  // In this iteration the Create and Update are combined 
  // into a single "save" function
  save = () => {     
    let method = "POST" 
    let endpoint = '/api/cat/'
    if (this._id){
      method = "PUT"
      endpoint = '/api/cat/'+this._id
    }  
    fetch( endpoint , {
      method:method ,
      headers: {  'Content-Type': 'application/json'  },
      body : this.exportJSON()
    })
    .then(response => response.json())
    .then(data => { 
      console.log(data)
      this.importJSON(data) 
      // add the newly created cat to the page.
      this.render()
      // auto scroll to the newly created cat.
      $(`[data-id="${this._id}"]`).scrollIntoView()
    }) 
    .catch(error => console.log(error))
  }
 
  // delete this cat from the database.
  // i.e. remove the data for this cat from the database
  // by means of an API endpoint using the DELETE method
  delete = () => {   
    fetch('/api/cat/'+this._id, {"method":"DELETE"})
      .then(response => response.json())
      .then(response => {
          // also remove cat from page layout
          this.remove() 
      })
      .catch(error => console.log(error))
  } 

  
  // Below we have a function that populates the HTML form with data
  edit = () => {     
    const catForm = $('#catForm');
    catForm.elements['_id'].value = this._id
    catForm.elements['name'].value = this.name
    catForm.elements['species'].value = this.species
    catForm.elements['color'].value= this.color
    catForm.elements['description'].value= this.description

    // set a hidden fileName field but also set the preview image
    preview.setAttribute('src', '/uploads/'+this.fileName)
    catForm.elements['fileName'].value = this.fileName
    
    catForm.elements['playfulness'].value = this.playfulness
    catForm.elements['appetite'].value = this.appetite 
    
    catForm.elements['birthDate'].value = this.birthDate?.slice(0, 10)
    // note the use of the "checked" property insstead of the usual "value"
    catForm.elements['adopted'].checked = this.adopted 
    // set the heading for the form to match our intentions.
    $('#catForm h2').innerHTML = `Edit ${this.name }`
    // make the form appear (normally it is set to display="none")
    catForm.style.display ='flex'
    // auto-scroll to the top of the page when editing a cat.
    $('body').scrollIntoView();
  }

  // remove this cat from the page
  remove = () => {
    $(`[data-id="${this._id}"]`).remove();
  }  

  // check if this cat is owned by the logged in user
  // by comparing this cat's human with the global loggedInUser variable.
  isOwnedByUser = () =>{ 
     return (this?.human?.username ==  loggedInUser.username)? true : false;
  }
  
  // render the cat's template on the page
  render = () => {     
    // build an html template
    const template = this.template()
    // look for an already existing version on the page
    const existing = $(`[data-id="${this._id}"]`); 
    // if a previous version exists, replace it
    if (existing) $('#content').replaceChild(template, existing)
    // if this is a new cat, add it to the top of the page.
    else $('#content').prepend( template )  
    // activate edit and delete button but only if the user owns the cat.
    if (this.isOwnedByUser()){
      $(`[data-id="${this._id}"] button.edit`)
          .addEventListener('click', (event) => this.edit() )
       $(`[data-id="${this._id}"] button.delete`)
          .addEventListener('click', (event) => this.delete() )
    }
    
  }

  // build an html template for this cat
  template = () => {    
      let div = document.createElement('div')
      div.classList.add('cat')
      // attach the _id of the cat to a data-id attribute.
      // this helps us to easily identify it elsewhere in our code.
      div.setAttribute('data-id', this._id)
      let catHTML = 
        `<section class="image" style="background-image: url(${this.imageURL()})"> 
          <a href="${this.imageURL()}" target="_blank">
            <img src="assets/open.svg" alt="Open">
          </a>
        </section>
        <section class="information">
          <header > 
          <div class="basicInfo"> 
            <h2 class="name">${this.svg()} ${this.name}</h2>
            <h3>  
              <span class="species">${this.species}</span>
            </h3>
            <h3>  
              <span class="owner">${this.owner()}</span>
            </h3>
            
          </div>
          <div class="calendar">
              <div class="born">born:</div>
              <div class="birthMonth">${this.birthMonth()}</div>
              <div class="birthDay">${this.birthDay()}</div> 
              <div class="birthYear">${this.birthYear()}</div>
          </div>
        </header>
        <main>
          <p class="description">${this.description}</p>
          <div class="stats">
            <div class="stat">
              <h4>Playfulness</h4>
              <meter min="0" max="5" value="${this.playfulness}"></meter> 
            </div>
            <div class="stat">
              <h4>Appetite</h4>
              <meter min="0" max="5" value="${this.appetite}"></meter> 
            </div> 
          </div>
          <div class="badges">
            ${this.badge()}
          </div>
          <div class="options">
            ${this.buttons()}
          </div>
        </main>
        </section>
      `
      div.innerHTML = catHTML
    return div
}
 
  birthYear = () => {
    let birthDate = new Date( this.birthDate ) 
    let format = { year: 'numeric', timeZone: "UTC"  }
    return birthDate.toLocaleString("en-CA", format ) 
  }
  birthMonth = () => {
    let birthDate = new Date( this.birthDate ) 
    let format = { month: 'short', timeZone: "UTC"  }
    return birthDate.toLocaleString("en-CA", format ) 
  }
  birthDay = () => {
    let birthDate = new Date( this.birthDate ) 
    let format = {  day: '2-digit', timeZone: "UTC"  }
    return birthDate.toLocaleString("en-CA", format ) 
  } 

  buttons = () => {
    // add buttons but only if the cat is owned by the current user.
    return ( this.isOwnedByUser() ) ? 
      `<button class="edit">Edit</button>
      <button class="delete">Delete</button>` :  ''
  }
  
  badge = () => {
    return (this.adopted) ?
      '<div class="badge success">Adopted</div>':
      '<div class="badge alert">Awaiting Adoption</div>'  
  }

  imageURL = () => {
    return (this.fileName) ? 'uploads/'+this.fileName : 'assets/photo.svg'; 
  } 
  
  owner = () => {
    return (this.human) ? 
      `<img src="assets/human.svg"> ${this.human.username}` : 
      '<img src="assets/paw.svg"> Free Spirit'; 
  } 
  
  svg = () => {
    return `<svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor" fill="${this.color}" stroke-width="0" viewBox="0 0 512 512"> <use href="#catIcon" /> </svg>`
  }
  
  
}