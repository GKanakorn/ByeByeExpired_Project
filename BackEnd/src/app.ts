import express from 'express'
import authRoute from './routes/auth.route'
import storageRoute from './routes/storage.route'
import locationRoute from './routes/location.route'

const app = express()
app.use(express.json())

app.use('/auth', authRoute)
app.use('/api', locationRoute)
app.use('/api', storageRoute)

export default app