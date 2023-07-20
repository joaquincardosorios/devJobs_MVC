document.addEventListener('DOMContentLoaded', () => {
    const skills = document.querySelector('.lista-conocimientos')

    // Limpiar alertas
    let alertas = document.querySelector('.alertas')
    if(alertas) {
        limpiarAlertas()
    }

    if(skills){
        skills.addEventListener('click', agregarSkills);

        // una vez que estamos en editar, llamar la funcion
        skillsSeleccionados()

    }
})
const skills = new Set();

const agregarSkills = (e) => {
    if(e.target.tagName === 'LI'){
        if(e.target.classList.contains('activo')){
            skills.delete(e.target.textContent)
            e.target.classList.remove('activo')
        }else {
            skills.add(e.target.textContent);
            e.target.classList.add('activo')
        }
    }
    const skillsArray = [...skills]
    document.querySelector('#skills').value = skillsArray
}
const skillsSeleccionados = () => {
    const seleccionadas = Array.from(document.querySelectorAll('.lista-conocimientos .activo'))
    console.log(seleccionadas)
    seleccionadas.forEach(seleccionada => {
        skills.add(seleccionada.textContent)
    })
    // Inyectarlo en el hidden
    const skillsArray = [...skills]
    document.querySelector('#skills').value = skillsArray
}
const limpiarAlertas = () => {
    const alertas = document.querySelector('.alertas');
    const interval = setInterval(() => {
        if (alertas.children.length > 0) {
            alertas.removeChild(alertas.children[0]);
        } else {
            alertas.parentElement.removeChild(alertas);
            clearInterval(interval);
        }
    }, 2000);
};