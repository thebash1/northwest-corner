fetch('./data.json')
  .then(response => response.json())
  .then(datos => {
    console.log(datos);
  })
  .catch(error => console.error('Error:', error));