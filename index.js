const BASE_URL = 'http://localhost:8000'

let mode = 'CREATE'
let selectedId = ''

window.onload = async () => {
    const urlParams = new URLSearchParams(window.location.search)
    const id = urlParams.get('id')
    if (id) {
        mode = 'EDIT'
        selectedId = id

        try {
            const response = await axios.get(`${BASE_URL}/users/${id}`)
            const user = response.data

            let firstNameDOM = document.querySelector('input[name=firstname]')
            let lastNameDOM = document.querySelector('input[name=lastname]')
            let ageDOM = document.querySelector('input[name=age]')
            let descriptionDOM = document.querySelector('textarea[name=description]')

            let genderDOMs = document.querySelectorAll('input[name=gender]')
            let interestsDOMs = document.querySelectorAll('input[name=interest]')
            
            firstNameDOM.value = user.firstname
            lastNameDOM.value = user.lastname
            ageDOM.value = user.age
            descriptionDOM.value = user.description
            for (let i = 0; i < genderDOMs.length; i++) {
                if (genderDOMs[i].value == user.gender) {
                    genderDOMs[i].checked = true
                }
            }

            for (let i = 0; i < interestsDOMs.length; i++) {
                if (user.interests.includes(interestsDOMs[i].value)) {
                    interestsDOMs[i].checked = true
                }
            }
        } catch (error) {
        }
    }
}
const validateData = (userData) => {
    let errors = []
    if (!userData.firstname) {
        errors.push('กรุณาใส่ชื่อจริง')
    }

    if (!userData.lastname) {
        errors.push('กรุณาใส่นามสกุล')
    }

    if (!userData.age) {
        errors.push('กรุณาใส่อายุ')
    }

    if (!userData.gender) {
        errors.push('กรุณาใส่เพศ')
    }

    if (!userData.interests) {
        errors.push('กรุณาใส่ความสนใจ')
    }

    if (!userData.description) {
        errors.push('กรุณาใส่รายละเอียดของคุณ')
    }
    return errors
}

const submitData = async () => {
    let firstNameDOM = document.querySelector('input[name=firstname]')
    let lastNameDOM = document.querySelector('input[name=lastname]')
    let ageDOM = document.querySelector('input[name=age]')

    let genderDOM = document.querySelector('input[name=gender]:checked') || {}
    let interestsDOM = document.querySelectorAll('input[name=interest]:checked') || {}
    let descriptionDOM = document.querySelector('textarea[name=description]')

    let messageDOM =  document.getElementById('message')

    try {
        let interest = ''
    
        for(let i = 0; i < interestsDOM.length; i++) {
            interest += interestsDOM[i].value
            if (i != interestsDOM.length - 1) {
                interest += ' ,'
            }
        }

        let userData = {
            firstname: firstNameDOM.value,
            lastname: lastNameDOM.value,
            age: ageDOM.value,
            gender: genderDOM.value,
            description: descriptionDOM.value,
            interests: interest
        }
        
        const errors = validateData(userData)

        if (errors.length > 0) {
            throw {
                message: 'กรอกข้อมูลไม่ครบ',
                errors: errors
            }
        }
        let message = 'บันทึกข้อมูลเรียบร้อย'
        if (mode == 'CREATE') {
            const response = await axios.post(`${BASE_URL}/users`, userData)
        } else {
            message = 'แก้ไขข้อมูลเรียบร้อย'
            const response = await axios.put(`${BASE_URL}/users/${selectedId}`, userData)
        }
        
        messageDOM.innerText = message
        messageDOM.className = 'message success'
    } catch (error) {
        if (error.response) {
            error.message = error.response.data.message
            error.errors = error.response.data.errors
        }
        
        let htmlData = '<div>'
        htmlData += `<div>${error.message}</div>`
        htmlData += '<ul>'
        for (let i = 0; i < error.errors.length; i++) {
            htmlData += `<li>${error.errors[i]}</li>`
        }
        htmlData += '</ul>'
        htmlData += '</div>'
        messageDOM.innerHTML = htmlData
        messageDOM.className = 'message danger'
    }
}