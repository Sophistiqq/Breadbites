const closeBtn = document.querySelector('#closeBtn')
const popup = document.querySelector('.popup')
const signInBtn = document.querySelector('#signInBtn')

signInBtn.addEventListener('click', () => {
    popup.classList.add('active')
});
closeBtn.addEventListener('click', () => {
    popup.classList.remove('active')
})

const signin = document.querySelector('.signin')
const register = document.querySelector('.register')
const signinOrRegister = document.querySelector('#signinOrRegister')

signinOrRegister.addEventListener('click', () => {
    register.classList.toggle('hide');
    signin.classList.toggle('hide');
    signinOrRegister.innerHTML = signinOrRegister.innerHTML === 'Sign In' ? 'Register' : 'Sign In';
});

