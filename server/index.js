const express = require('express')
const bodyparser = require('body-parser')
const mysql = require('mysql2/promise')
const cors = require('cors')
const app = express()

app.use(bodyparser.json())
app.use(cors())

const port = 8000

let conn = null

const initMySQL = async () => {
	conn = await mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: 'root',
		database: 'tutorials',
		port: 8889
	})
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

app.get('/users', async (req, res) => {
	try {
		const results = await conn.query('SELECT * FROM users')
		res.json(results[0])
	} catch (error) {
		console.error('Error fetching users:', error.message)
		res.status(500).json({ error: 'Error fetching users' })
	}
})

app.get('/users/:id', async (req, res) => {
	try {
		let id = req.params.id
		const results = await conn.query('SELECT * FROM users WHERE id = ?', id)
		if (results[0].length == 0) {
			throw { statusCode: 404, message: 'หาไม่เจอ' }
		}
		res.json(results[0][0])
		
	} catch (error) {
		console.error('Error fetching users:', error.message)
		res.status(error.statusCode).json({
			error: 'Error fetching users',
			errorMessage: error.message
		 })
	}
})

app.post('/users', async (req, res) => {
	try {
		let user = req.body
		const errors = validateData(user)
		if (errors.length > 0) {
			throw {
				message: 'กรอกข้อมูลไม่ครบ',
				errors: errors
			}
		}
		const results = await conn.query('INSERT INTO users SET ?', user)
		res.json({
			message: 'insert ok',
			data: results[0]
		})
	} catch (error) {
		const errorMessage = error.message || 'something wrong'
		const errors = error.errors || []
		console.error(error.message)
		res.status(500).json({
			message: errorMessage,
			errors: errors
		})
	}	
})

app.put('/users/:id', async (req, res) => {
	try {
		let id = req.params.id
		let updateUser = req.body
		const results = await conn.query('UPDATE users SET ? WHERE id = ?', [updateUser, id])
		res.json({
			message: 'update ok',
			data: results[0]
		})
	} catch (error) {
		console.error(error.message)
		res.status(500).json({
			message: 'something wrong'
		})
	}
})

app.delete('/users/:id', async (req, res) => {
	try {
		let id = req.params.id
		const results = await conn.query('DELETE FROM users WHERE id = ?', id)
		res.json({
			message: 'delete ok',
			data: results[0]
		})
	} catch (error) {
		console.error(error.message)
		res.status(500).json({
			message: 'something wrong'
		})
	}
})

app.listen(port, async (req, res) => {
	await initMySQL()
	console.log('http server run at  ' + port)
})